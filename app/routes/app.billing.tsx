import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  InlineGrid,
  Badge,
  List,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  authenticate,
  MONTHLY_PLAN_GROWTH,
  MONTHLY_PLAN_PRO,
} from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;

  const settings = await db.cancelSettings.findUnique({ where: { shop } });
  const currentPlan = settings?.plan || "FREE";

  const billingCheck = await billing.check({
    plans: [MONTHLY_PLAN_GROWTH, MONTHLY_PLAN_PRO],
    isTest: true,
  });

  return json({
    currentPlan,
    hasActivePayment: billingCheck.hasActivePayment,
    appSubscriptions: billingCheck.appSubscriptions,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const plan = formData.get("plan") as string;

  if (plan === "FREE") {
    // Cancel active subscriptions if moving to free
    await db.cancelSettings.update({
      where: { shop },
      data: { plan: "FREE", monthlyActionsLimit: 25 },
    });
    return json({ success: true, plan: "FREE" });
  }

  const targetPlan =
    plan === "GROWTH" ? MONTHLY_PLAN_GROWTH : MONTHLY_PLAN_PRO;

  // Trigger Shopify Billing charge flow
  await billing.request({
    plan: targetPlan,
    isTest: true,
    returnUrl: `${process.env.SHOPIFY_APP_URL}/app/billing?confirmed=true`,
  });

  return null;
};

export default function BillingPage() {
  const { currentPlan } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isUpgrading = navigation.state === "submitting";

  const handleSelectPlan = (plan: string) => {
    const formData = new FormData();
    formData.append("plan", plan);
    submit(formData, { method: "POST" });
  };

  return (
    <Page backAction={{ content: "Dashboard", url: "/app" }}>
      <TitleBar title="Plans & Subscription" />
      <BlockStack gap="500">
        <BlockStack gap="200">
          <Text as="h1" variant="headingLg">
            Choose the right plan for your business
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Automate order modifications, eliminate customer support tickets, and retain revenue before orders get cancelled.
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
                {currentPlan === "FREE" && <Badge tone="success">Current Plan</Badge>}
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
                For growing stores wanting to eliminate address typos and save orders.
              </Text>
              <Divider />
              <List>
                <List.Item><strong>250 actions/month</strong></List.Item>
                <List.Item>Self-serve address correction</List.Item>
                <List.Item>Order retention discount offers</List.Item>
                <List.Item>Custom survey reasons</List.Item>
                <List.Item>Audit log & export</List.Item>
                <List.Item>Priority email support</List.Item>
              </List>
              <Button
                variant="primary"
                disabled={currentPlan === "GROWTH" || isUpgrading}
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
                {currentPlan === "PRO" && <Badge tone="success">Current Plan</Badge>}
              </InlineStack>
              <Text as="p" variant="heading2xl">
                $24.99
                <Text as="span" variant="bodySm" tone="subdued">
                  /month
                </Text>
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                For high-volume merchants seeking maximum automation and retention.
              </Text>
              <Divider />
              <List>
                <List.Item><strong>Unlimited actions/month</strong></List.Item>
                <List.Item>Everything in Growth</List.Item>
                <List.Item>Instant store credit / gift card swap</List.Item>
                <List.Item>AI Cancellation trend insights</List.Item>
                <List.Item>Custom branding & CSS overrides</List.Item>
                <List.Item>24/7 Priority support</List.Item>
              </List>
              <Button
                disabled={currentPlan === "PRO" || isUpgrading}
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
