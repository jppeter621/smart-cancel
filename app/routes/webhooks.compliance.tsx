import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`Received compliance webhook: ${topic} for shop: ${shop}`);

  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST": {
      // Return customer data stored by the app
      console.log(`Customer data request for shop ${shop}`, payload);
      // In SmartCancel, check for customer actions:
      const customerEmail = payload?.customer?.email;
      if (customerEmail) {
        const actions = await db.cancelAction.findMany({
          where: { shop, customerEmail },
        });
        console.log(`Found ${actions.length} records for customer ${customerEmail}`);
      }
      return new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    case "CUSTOMERS_REDACT": {
      // Redact customer personal data
      console.log(`Customer redact request for shop ${shop}`, payload);
      const customerEmail = payload?.customer?.email;
      if (customerEmail) {
        await db.cancelAction.updateMany({
          where: { shop, customerEmail },
          data: {
            customerEmail: "[REDACTED]",
            details: null,
          },
        });
      }
      return new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    case "SHOP_REDACT": {
      // Redact/erase shop data 48 hours after uninstall
      console.log(`Shop redact request for shop ${shop}`, payload);
      await db.cancelAction.deleteMany({ where: { shop } });
      await db.cancelSettings.deleteMany({ where: { shop } });
      await db.session.deleteMany({ where: { shop } });
      return new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    default:
      return new Response("Unhandled compliance topic", { status: 400 });
  }
};
