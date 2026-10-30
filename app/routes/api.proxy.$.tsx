import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// Helper to format numeric or GID order ID
function toOrderGid(id: string): string {
  if (id.startsWith("gid://shopify/Order/")) return id;
  return `gid://shopify/Order/${id}`;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const path = url.pathname;

  const { admin, session } = await authenticate.public.appProxy(request);

  if (!session || !admin) {
    return json({ error: "Unauthorized: App not installed or offline session missing" }, { status: 401 });
  }

  const shop = session.shop;

  // Endpoint: /api/proxy/eligibility
  if (path.endsWith("/eligibility")) {
    const rawOrderId = url.searchParams.get("order_id");
    if (!rawOrderId) {
      return json({ error: "Missing order_id parameter" }, { status: 400 });
    }

    const orderGid = toOrderGid(rawOrderId);

    // Get merchant settings for this shop
    let settings = await db.cancelSettings.findUnique({ where: { shop } });
    if (!settings) {
      settings = await db.cancelSettings.create({
        data: {
          shop,
          cancellationWindowMinutes: 60,
          allowCancellation: true,
          allowAddressEdit: true,
          autoRestock: true,
          autoRefund: true,
        },
      });
    }

    // Query Shopify Admin API for order details
    const orderResponse = await admin.graphql(
      `#graphql
      query getOrderDetails($id: ID!) {
        order(id: $id) {
          id
          name
          createdAt
          cancelledAt
          cancelReason
          displayFinancialStatus
          displayFulfillmentStatus
          shippingAddress {
            address1
            address2
            city
            province
            provinceCode
            zip
            country
            countryCodeV2
            name
            phone
          }
        }
      }`,
      { variables: { id: orderGid } }
    );

    const orderData = await orderResponse.json();
    const order = orderData?.data?.order;

    if (!order) {
      return json({ error: "Order not found" }, { status: 404 });
    }

    const orderCreatedAt = new Date(order.createdAt).getTime();
    const now = Date.now();
    const minutesElapsed = Math.floor((now - orderCreatedAt) / 60000);
    const windowMinutes = settings.cancellationWindowMinutes;
    const remainingMinutes = Math.max(0, windowMinutes - minutesElapsed);
    const isWindowExpired = remainingMinutes <= 0;

    const isFulfilled =
      order.displayFulfillmentStatus === "FULFILLED" ||
      order.displayFulfillmentStatus === "IN_TRANSIT" ||
      order.displayFulfillmentStatus === "OUT_FOR_DELIVERY";

    const isAlreadyCancelled = Boolean(order.cancelledAt);

    let cancelDisabledReason: string | null = null;
    if (isAlreadyCancelled) {
      cancelDisabledReason = "This order has already been cancelled.";
    } else if (isFulfilled) {
      cancelDisabledReason = "This order has already been fulfilled and cannot be cancelled online.";
    } else if (isWindowExpired) {
      cancelDisabledReason = `The self-service cancellation window (${windowMinutes} minutes) has expired.`;
    } else if (!settings.allowCancellation) {
      cancelDisabledReason = "Self-service order cancellation is currently disabled by the store.";
    }

    let addressEditDisabledReason: string | null = null;
    if (isAlreadyCancelled) {
      addressEditDisabledReason = "Cannot edit address for a cancelled order.";
    } else if (isFulfilled) {
      addressEditDisabledReason = "This order has already been fulfilled.";
    } else if (isWindowExpired) {
      addressEditDisabledReason = `The address correction window (${windowMinutes} minutes) has expired.`;
    } else if (!settings.allowAddressEdit) {
      addressEditDisabledReason = "Address editing is currently disabled by the store.";
    }

    const eligibleForCancel = !cancelDisabledReason;
    const eligibleForAddressEdit = !addressEditDisabledReason;

    const reasonsList = settings.reasonOptions
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    return json({
      orderId: order.id,
      orderName: order.name,
      eligibleForCancel,
      cancelDisabledReason,
      eligibleForAddressEdit,
      addressEditDisabledReason,
      remainingMinutes,
      windowMinutes,
      isWindowExpired,
      reasons: reasonsList,
      shippingAddress: order.shippingAddress,
      retentionOffer: settings.retentionDiscountEnabled
        ? {
            enabled: true,
            code: settings.retentionDiscountCode,
            percent: settings.retentionDiscountPercent,
          }
        : { enabled: false },
    });
  }

  return json({ error: "Unknown endpoint" }, { status: 404 });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const path = url.pathname;

  const { admin, session } = await authenticate.public.appProxy(request);

  if (!session || !admin) {
    return json({ error: "Unauthorized: Missing shop session" }, { status: 401 });
  }

  const shop = session.shop;

  let body: any;
  try {
    const text = await request.text();
    body = text ? JSON.parse(text) : {};
  } catch (e) {
    return json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  // 1. Cancel Order Action
  if (path.endsWith("/cancel")) {
    const { orderId, reason, customerEmail } = body;
    if (!orderId) {
      return json({ error: "Missing required orderId" }, { status: 400 });
    }

    const orderGid = toOrderGid(orderId);

    // Verify settings & usage limit
    const settings = await db.cancelSettings.findUnique({ where: { shop } });
    if (settings && settings.plan === "FREE" && settings.monthlyActionsCount >= settings.monthlyActionsLimit) {
      return json(
        { error: "Monthly free action quota reached for store. Please contact support." },
        { status: 429 }
      );
    }

    // Call Shopify orderCancel mutation
    // Valid Shopify reasons: CUSTOMER, DECLINED, FRAUD, INVENTORY, OTHER
    const shopifyReason = "CUSTOMER";

    const cancelResponse = await admin.graphql(
      `#graphql
      mutation cancelOrder($orderId: ID!, $reason: OrderCancelReason!, $refund: Boolean!, $restock: Boolean!) {
        orderCancel(orderId: $orderId, reason: $reason, refund: $refund, restock: $restock) {
          job {
            id
          }
          orderCancelUserErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          orderId: orderGid,
          reason: shopifyReason,
          refund: settings ? settings.autoRefund : true,
          restock: settings ? settings.autoRestock : true,
        },
      }
    );

    const cancelData = await cancelResponse.json();
    const userErrors = cancelData?.data?.orderCancel?.orderCancelUserErrors || [];

    if (userErrors.length > 0) {
      const errMessage = userErrors.map((e: any) => e.message).join(", ");
      await db.cancelAction.create({
        data: {
          shop,
          orderId: orderGid,
          orderName: body.orderName || orderGid,
          customerEmail: customerEmail || null,
          actionType: "CANCEL",
          reason: reason || "Customer requested",
          status: "FAILED",
          errorMessage: errMessage,
        },
      });

      return json({ success: false, error: errMessage }, { status: 400 });
    }

    // Success: Record audit log and increment monthly counter
    await db.cancelAction.create({
      data: {
        shop,
        orderId: orderGid,
        orderName: body.orderName || orderGid,
        customerEmail: customerEmail || null,
        actionType: "CANCEL",
        reason: reason || "Customer self-serve cancel",
        status: "SUCCESS",
      },
    });

    if (settings) {
      await db.cancelSettings.update({
        where: { shop },
        data: { monthlyActionsCount: { increment: 1 } },
      });
    }

    return json({
      success: true,
      message: "Order successfully cancelled and processed.",
    });
  }

  // 2. Edit Shipping Address Action
  if (path.endsWith("/edit-address")) {
    const { orderId, shippingAddress, customerEmail, orderName } = body;
    if (!orderId || !shippingAddress) {
      return json({ error: "Missing orderId or shippingAddress" }, { status: 400 });
    }

    const orderGid = toOrderGid(orderId);

    const updateResponse = await admin.graphql(
      `#graphql
      mutation updateOrderShippingAddress($input: OrderInput!) {
        orderUpdate(input: $input) {
          order {
            id
            shippingAddress {
              address1
              address2
              city
              province
              zip
              country
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          input: {
            id: orderGid,
            shippingAddress: {
              address1: shippingAddress.address1,
              address2: shippingAddress.address2 || "",
              city: shippingAddress.city,
              province: shippingAddress.province || "",
              zip: shippingAddress.zip,
              country: shippingAddress.country || "",
              firstName: shippingAddress.firstName || "",
              lastName: shippingAddress.lastName || "",
              phone: shippingAddress.phone || "",
            },
          },
        },
      }
    );

    const updateData = await updateResponse.json();
    const userErrors = updateData?.data?.orderUpdate?.userErrors || [];

    if (userErrors.length > 0) {
      const errMessage = userErrors.map((e: any) => e.message).join(", ");
      await db.cancelAction.create({
        data: {
          shop,
          orderId: orderGid,
          orderName: orderName || orderGid,
          customerEmail: customerEmail || null,
          actionType: "EDIT_ADDRESS",
          status: "FAILED",
          errorMessage: errMessage,
          details: JSON.stringify(shippingAddress),
        },
      });

      return json({ success: false, error: errMessage }, { status: 400 });
    }

    // Success: Record audit log
    await db.cancelAction.create({
      data: {
        shop,
        orderId: orderGid,
        orderName: orderName || orderGid,
        customerEmail: customerEmail || null,
        actionType: "EDIT_ADDRESS",
        status: "SUCCESS",
        details: JSON.stringify(shippingAddress),
      },
    });

    return json({
      success: true,
      message: "Shipping address updated successfully.",
      shippingAddress: updateData?.data?.orderUpdate?.order?.shippingAddress,
    });
  }

  return json({ error: "Unknown action endpoint" }, { status: 404 });
};
