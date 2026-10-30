import { useState, useCallback } from "react";
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
  Select,
  Checkbox,
  TextField,
  Banner,
  DataTable,
  Badge,
  ProgressBar,
  Divider,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

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
        retentionDiscountEnabled: false,
        retentionDiscountCode: "KEEP10",
        retentionDiscountPercent: 10,
        plan: "FREE",
        monthlyActionsCount: 0,
        monthlyActionsLimit: 25,
      },
    });
  }

  const actions = await db.cancelAction.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  const totalCancels = await db.cancelAction.count({
    where: { shop, actionType: "CANCEL", status: "SUCCESS" },
  });

  const totalAddressEdits = await db.cancelAction.count({
    where: { shop, actionType: "EDIT_ADDRESS", status: "SUCCESS" },
  });

  return json({
    settings,
    actions,
    metrics: {
      totalCancels,
      totalAddressEdits,
      usedActions: settings.monthlyActionsCount,
      limitActions: settings.monthlyActionsLimit,
      plan: settings.plan,
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const cancellationWindowMinutes = parseInt(
    formData.get("cancellationWindowMinutes") as string,
    10
  );
  const allowCancellation = formData.get("allowCancellation") === "true";
  const allowAddressEdit = formData.get("allowAddressEdit") === "true";
  const autoRestock = formData.get("autoRestock") === "true";
  const autoRefund = formData.get("autoRefund") === "true";
  const retentionDiscountEnabled =
    formData.get("retentionDiscountEnabled") === "true";
  const retentionDiscountCode =
    (formData.get("retentionDiscountCode") as string) || "KEEP10";
  const retentionDiscountPercent = parseInt(
    (formData.get("retentionDiscountPercent") as string) || "10",
    10
  );
  const reasonOptions = (formData.get("reasonOptions") as string) || "";

  await db.cancelSettings.upsert({
    where: { shop },
    create: {
      shop,
      cancellationWindowMinutes: cancellationWindowMinutes || 60,
      allowCancellation,
      allowAddressEdit,
      autoRestock,
      autoRefund,
      retentionDiscountEnabled,
      retentionDiscountCode,
      retentionDiscountPercent,
      reasonOptions,
    },
    update: {
      cancellationWindowMinutes: cancellationWindowMinutes || 60,
      allowCancellation,
      allowAddressEdit,
      autoRestock,
      autoRefund,
      retentionDiscountEnabled,
      retentionDiscountCode,
      retentionDiscountPercent,
      reasonOptions,
    },
  });

  return json({ success: true });
};

export default function SmartCancelDashboard() {
  const { settings, actions, metrics } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";

  // Form State
  const [windowMinutes, setWindowMinutes] = useState(
    String(settings.cancellationWindowMinutes)
  );
  const [allowCancel, setAllowCancel] = useState(settings.allowCancellation);
  const [allowAddress, setAllowAddress] = useState(settings.allowAddressEdit);
  const [autoRestock, setAutoRestock] = useState(settings.autoRestock);
  const [autoRefund, setAutoRefund] = useState(settings.autoRefund);
  const [retentionEnabled, setRetentionEnabled] = useState(
    settings.retentionDiscountEnabled
  );
  const [retentionCode, setRetentionCode] = useState(
    settings.retentionDiscountCode || "KEEP10"
  );
  const [retentionPercent, setRetentionPercent] = useState(
    String(settings.retentionDiscountPercent || 10)
  );
  const [reasons, setReasons] = useState(settings.reasonOptions);

  const windowOptions = [
    { label: "15 Minutes", value: "15" },
    { label: "30 Minutes", value: "30" },
    { label: "1 Hour (Recommended)", value: "60" },
    { label: "2 Hours", value: "120" },
    { label: "6 Hours", value: "360" },
    { label: "12 Hours", value: "720" },
    { label: "24 Hours", value: "1440" },
  ];

  const handleSave = useCallback(() => {
    const formData = new FormData();
    formData.append("cancellationWindowMinutes", windowMinutes);
    formData.append("allowCancellation", String(allowCancel));
    formData.append("allowAddressEdit", String(allowAddress));
    formData.append("autoRestock", String(autoRestock));
    formData.append("autoRefund", String(autoRefund));
    formData.append("retentionDiscountEnabled", String(retentionEnabled));
    formData.append("retentionDiscountCode", retentionCode);
    formData.append("retentionDiscountPercent", retentionPercent);
    formData.append("reasonOptions", reasons);

    submit(formData, { method: "POST" });
  }, [
    windowMinutes,
    allowCancel,
    allowAddress,
    autoRestock,
    autoRefund,
    retentionEnabled,
    retentionCode,
    retentionPercent,
    reasons,
    submit,
  ]);

  const rows = actions.map((act) => [
    act.orderName,
    <Badge
      tone={
        act.actionType === "CANCEL"
          ? "critical"
          : "info"
      }
      key={`type-${act.id}`}
    >
      {act.actionType === "CANCEL" ? "Cancellation" : "Address Edit"}
    </Badge>,
    act.reason || act.details || "Customer self-serve",
    new Date(act.createdAt).toLocaleString(),
    <Badge
      tone={act.status === "SUCCESS" ? "success" : "critical"}
      key={`status-${act.id}`}
    >
      {act.status}
    </Badge>,
  ]);

  const quotaProgress = Math.min(
    100,
    Math.round((metrics.usedActions / metrics.limitActions) * 100)
  );

  return (
    <Page>
      <TitleBar title="SmartCancel — Self-Serve Order Edit & Cancel">
        <button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </TitleBar>

      <BlockStack gap="500">
        <Banner title="Self-Service Portal Active" tone="success">
          <p>
            SmartCancel empowers your customers to correct shipping addresses
            and cancel accidental orders within your specified time lock.
          </p>
        </Banner>

        {/* Quick Stats Grid */}
        <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm" tone="subdued">
                Orders Cancelled
              </Text>
              <Text as="p" variant="headingLg">
                {metrics.totalCancels}
              </Text>
              <Text as="span" variant="bodySm" tone="subdued">
                Saved support tickets
              </Text>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm" tone="subdued">
                Addresses Corrected
              </Text>
              <Text as="p" variant="headingLg">
                {metrics.totalAddressEdits}
              </Text>
              <Text as="span" variant="bodySm" tone="subdued">
                Prevented return-to-sender costs
              </Text>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm" tone="subdued">
                Self-Service Window
              </Text>
              <Text as="p" variant="headingLg">
                {windowMinutes} min
              </Text>
              <Text as="span" variant="bodySm" tone="subdued">
                Before auto-lock
              </Text>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm" tone="subdued">
                Monthly Usage
              </Text>
              <Text as="p" variant="headingLg">
                {metrics.usedActions} / {metrics.limitActions}
              </Text>
              <ProgressBar progress={quotaProgress} size="small" tone={quotaProgress > 80 ? "critical" : "primary"} />
            </BlockStack>
          </Card>
        </InlineGrid>

        <Layout>
          {/* Main Policy Settings */}
          <Layout.Section>
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Policy Rules & Time Locks
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Configure the timeframe and rules for when customers are allowed to modify or cancel their orders before fulfillment.
                  </Text>
                  <Divider />

                  <Select
                    label="Cancellation & Edit Window"
                    options={windowOptions}
                    value={windowMinutes}
                    onChange={(val) => setWindowMinutes(val)}
                    helpText="Orders older than this timeframe cannot be edited or cancelled by the customer."
                  />

                  <Checkbox
                    label="Allow order cancellation"
                    checked={allowCancel}
                    onChange={(newVal) => setAllowCancel(newVal)}
                    helpText="Permits customers to cancel orders within the time lock window."
                  />

                  <Checkbox
                    label="Allow shipping address correction"
                    checked={allowAddress}
                    onChange={(newVal) => setAllowAddress(newVal)}
                    helpText="Permits customers to update their address without support intervention."
                  />

                  <Checkbox
                    label="Automatically restock cancelled inventory"
                    checked={autoRestock}
                    onChange={(newVal) => setAutoRestock(newVal)}
                    helpText="Returns product inventory back to your Shopify store immediately upon cancellation."
                  />

                  <Checkbox
                    label="Automatically issue refund"
                    checked={autoRefund}
                    onChange={(newVal) => setAutoRefund(newVal)}
                    helpText="Refunds payment back to original payment gateway via Shopify Payments."
                  />
                </BlockStack>
              </Card>

              {/* Retention & Cancellation Survey */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Order Retention & Cancellation Survey
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Collect valuable merchant insights on why orders are cancelled, or offer a discount to save the order before it is cancelled.
                  </Text>
                  <Divider />

                  <Checkbox
                    label="Enable Retention Discount Offer"
                    checked={retentionEnabled}
                    onChange={(val) => setRetentionEnabled(val)}
                    helpText="When a customer clicks Cancel, offer them a discount if they decide to keep their order."
                  />

                  {retentionEnabled && (
                    <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
                      <TextField
                        label="Retention Discount Code"
                        value={retentionCode}
                        onChange={(val) => setRetentionCode(val)}
                        autoComplete="off"
                        helpText="Shopify discount code to show the customer."
                      />
                      <TextField
                        label="Discount Percentage (%)"
                        type="number"
                        value={retentionPercent}
                        onChange={(val) => setRetentionPercent(val)}
                        autoComplete="off"
                      />
                    </InlineGrid>
                  )}

                  <TextField
                    label="Cancellation Survey Reasons (comma-separated)"
                    value={reasons}
                    onChange={(val) => setReasons(val)}
                    multiline={3}
                    autoComplete="off"
                    helpText="Options displayed in the cancellation reason dropdown."
                  />
                </BlockStack>
              </Card>

              {/* Recent Activity Log */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Recent Customer Self-Serve Actions
                  </Text>
                  {actions.length === 0 ? (
                    <Box padding="400">
                      <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                        No cancellation or address edit requests recorded yet.
                      </Text>
                    </Box>
                  ) : (
                    <DataTable
                      columnContentTypes={["text", "text", "text", "text", "text"]}
                      headings={["Order", "Action", "Reason / Details", "Date", "Status"]}
                      rows={rows}
                    />
                  )}
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          {/* Right Sidebar: Setup & Plan */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Storefront Integration
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    SmartCancel integrates directly into your customer order confirmation and status pages.
                  </Text>
                  <Divider />
                  <Text as="p" variant="bodySm">
                    <strong>1. Theme App Block:</strong>
                    <br />
                    Add the <em>SmartCancel Self-Serve</em> block to your Order Status page or Customer Account template in your Theme Editor.
                  </Text>
                  <Text as="p" variant="bodySm">
                    <strong>2. Instant Protection:</strong>
                    <br />
                    Orders are automatically protected by your {windowMinutes}-minute countdown lock.
                  </Text>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Subscription & Limits
                  </Text>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Current Plan:
                    </Text>
                    <Badge tone="success">{metrics.plan} Plan</Badge>
                  </InlineStack>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Free plan includes 25 monthly self-service actions. Upgrade to Growth or Pro for unlimited actions and automated retention workflows.
                  </Text>
                  <Button variant="primary" fullWidth url="/app/billing">
                    View Upgrade Plans
                  </Button>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
