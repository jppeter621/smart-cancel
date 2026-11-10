/* global process */
import { useEffect } from "react";
import { useLoaderData, useFetcher, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  Page,
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  InlineGrid,
  Badge,
  List,
  Divider,
  Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  authenticate,
  MONTHLY_PLAN_GROWTH,
  MONTHLY_PLAN_PRO,
} from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;

  let currentPlan = "FREE";
  let hasActivePayment = false;
  let appSubscriptions = [];

  try {
    const billingCheck = await billing.check({
      plans: [MONTHLY_PLAN_GROWTH, MONTHLY_PLAN_PRO],
      isTest: true,
    });
    hasActivePayment = billingCheck.hasActivePayment;
    appSubscriptions = billingCheck.appSubscriptions || [];

    // If an active subscription exists on Shopify, sync it to the database
    if (hasActivePayment && appSubscriptions.length > 0) {
      const activeSub = appSubscriptions[0];
      const activePlan =
        activeSub.name === MONTHLY_PLAN_GROWTH
          ? "GROWTH"
          : activeSub.name === MONTHLY_PLAN_PRO
          ? "PRO"
          : "FREE";

      const limit =
        activePlan === "PRO" ? 999999 : activePlan === "GROWTH" ? 250 : 25;

      await db.cancelSettings.upsert({
        where: { shop },
        update: { plan: activePlan, monthlyActionsLimit: limit },
        create: {
          shop,
          plan: activePlan,
          monthlyActionsLimit: limit,
          cancellationWindowMinutes: 60,
          allowAddressEdit: true,
          allowCancellation: true,
        },
      });
      currentPlan = activePlan;
    } else {
      const settings = await db.cancelSettings.findUnique({ where: { shop } });
      currentPlan = settings?.plan || "FREE";
    }
  } catch (err) {
    console.warn("Billing check or DB sync failed:", err?.message);
    const settings = await db.cancelSettings.findUnique({ where: { shop } });
    currentPlan = settings?.plan || "FREE";
  }

  return {
    currentPlan,
    hasActivePayment,
    appSubscriptions,
  };
};

export const action = async ({ request }) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const plan = formData.get("plan");

  if (plan === "FREE") {
    try {
      const billingCheck = await billing.check({
        plans: [MONTHLY_PLAN_GROWTH, MONTHLY_PLAN_PRO],
        isTest: true,
      });
      if (billingCheck.hasActivePayment && billingCheck.appSubscriptions?.length) {
        for (const sub of billingCheck.appSubscriptions) {
          await billing.cancel({
            subscriptionId: sub.id,
            isTest: true,
            prorate: true,
          });
        }
      }
    } catch (e) {
      console.warn("Failed to cancel subscription via API:", e?.message);
    }

    await db.cancelSettings.update({
      where: { shop },
      data: { plan: "FREE", monthlyActionsLimit: 25 },
    });
    return { success: true, plan: "FREE" };
  }

  const targetPlan =
    plan === "GROWTH" ? MONTHLY_PLAN_GROWTH : MONTHLY_PLAN_PRO;

  try {
    return await billing.request({
      plan: targetPlan,
      isTest: true,
    });
  } catch (error) {
    // If it's a redirect Response (Shopify App Bridge 401 redirect or 302), rethrow it
    if (error instanceof Response) {
      throw error;
    }
    console.error("Shopify billing request error:", error);
    const errorMessage =
      error?.errorData?.[0]?.message ||
      error?.message ||
      "Billing request could not be completed";
    return { error: errorMessage };
  }
};

export default function BillingPage() {
  const { currentPlan } = useLoaderData();
  const fetcher = useFetcher();
  const isUpgrading = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.data?.confirmationUrl) {
      open(fetcher.data.confirmationUrl, "_top");
    }
  }, [fetcher.data]);

  const handleSelectPlan = (plan) => {
    const formData = new FormData();
    formData.append("plan", plan);
    fetcher.submit(formData, { method: "POST" });
  };

  return (
    <Page backAction={{ content: "Dashboard", url: "/app" }}>
      <TitleBar title="Plans & Subscription" />
      <BlockStack gap="500">
        {fetcher.data?.error && (
          <Banner title="Shopify Billing Notice" tone="critical">
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd">
                {fetcher.data.error}
              </Text>
              {fetcher.data.error.includes("public distribution") && (
                <Text as="p" variant="bodySm">
                  <strong>Action required:</strong> In your{" "}
                  <a
                    href="https://partners.shopify.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Shopify Partner Dashboard
                  </a>
                  , select your app <strong>smartcancel</strong>, click{" "}
                  <strong>Distribution</strong> in the left sidebar, and select{" "}
                  <strong>Public distribution</strong>. Shopify requires public
                  distribution enabled before test stores can create subscriptions.
                </Text>
              )}
            </BlockStack>
          </Banner>
        )}

        {fetcher.data?.success && (
          <Banner title="Plan updated" tone="success">
            <Text as="p" variant="bodyMd">
              Your store is now on the Free plan.
            </Text>
          </Banner>
        )}

        <BlockStack gap="200">
          <Text as="h1" variant="headingLg">
            Choose the right plan for your business
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Automate order modifications, eliminate customer support tickets,
            and retain revenue before orders get cancelled.
          </Text>
        </BlockStack>

        <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
          {/* Free Plan */}
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  Free
                </Text>
                {currentPlan === "FREE" && (
                  <Badge tone="success">Current Plan</Badge>
                )}
              </InlineStack>
              <Text as="p" variant="heading2xl">
                $0
                <Text as="span" variant="bodySm" tone="subdued">
                  /month
                </Text>
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Perfect for new stores testing self-service cancellation.
              </Text>
              <Divider />
              <List>
                <List.Item>25 self-service actions/month</List.Item>
                <List.Item>Self-serve order cancellation</List.Item>
                <List.Item>Configurable cancellation window</List.Item>
                <List.Item>Standard cancellation survey</List.Item>
                <List.Item>Automated restock & refund</List.Item>
              </List>
              <Button
                disabled={currentPlan === "FREE" || isUpgrading}
                onClick={() => handleSelectPlan("FREE")}
              >
                {currentPlan === "FREE" ? "Active" : "Downgrade to Free"}
              </Button>
            </BlockStack>
          </Card>

          {/* Growth Plan */}
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  Growth
                </Text>
                {currentPlan === "GROWTH" ? (
                  <Badge tone="success">Current Plan</Badge>
                ) : (
                  <Badge tone="attention">Most Popular</Badge>
                )}
              </InlineStack>
              <Text as="p" variant="heading2xl">
                $9.99
                <Text as="span" variant="bodySm" tone="subdued">
                  /month
                </Text>
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                For growing stores wanting to eliminate address typos and save
                orders.
              </Text>
              <Divider />
              <List>
                <List.Item>
                  <strong>250 actions/month</strong>
                </List.Item>
                <List.Item>Self-serve address correction</List.Item>
                <List.Item>Order retention discount offers</List.Item>
                <List.Item>Custom survey reasons</List.Item>
                <List.Item>Audit log & export</List.Item>
                <List.Item>Priority email support</List.Item>
              </List>
              <Button
                variant="primary"
                disabled={currentPlan === "GROWTH" || isUpgrading}
                loading={isUpgrading}
                onClick={() => handleSelectPlan("GROWTH")}
              >
                {currentPlan === "GROWTH" ? "Active Plan" : "Upgrade to Growth"}
              </Button>
            </BlockStack>
          </Card>

          {/* Pro Plan */}
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  Pro
                </Text>
                {currentPlan === "PRO" && (
                  <Badge tone="success">Current Plan</Badge>
                )}
              </InlineStack>
              <Text as="p" variant="heading2xl">
                $24.99
                <Text as="span" variant="bodySm" tone="subdued">
                  /month
                </Text>
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                For high-volume merchants seeking maximum automation and
                retention.
              </Text>
              <Divider />
              <List>
                <List.Item>
                  <strong>Unlimited actions/month</strong>
                </List.Item>
                <List.Item>Everything in Growth</List.Item>
                <List.Item>Instant store credit / gift card swap</List.Item>
                <List.Item>AI Cancellation trend insights</List.Item>
                <List.Item>Custom branding & CSS overrides</List.Item>
                <List.Item>24/7 Priority support</List.Item>
              </List>
              <Button
                disabled={currentPlan === "PRO" || isUpgrading}
                loading={isUpgrading}
                onClick={() => handleSelectPlan("PRO")}
              >
                {currentPlan === "PRO" ? "Active Plan" : "Upgrade to Pro"}
              </Button>
            </BlockStack>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
