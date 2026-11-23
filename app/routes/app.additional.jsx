import { useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  Card,
  Layout,
  List,
  Page,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export default function InsightsAndHelpPage() {
  return (
    <Page backAction={{ content: "Dashboard", url: "/app" }}>
      <TitleBar title="Insights & Integration Guide" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  How SmartCancel Protects Your Store
                </Text>
                <Text as="p" variant="bodyMd">
                  SmartCancel eliminates up to 80% of order-related support
                  tickets by giving customers a secure, self-service window to
                  fix mistakes before order fulfillment.
                </Text>
                <List type="bullet">
                  <List.Item>
                    <strong>Address Correction:</strong> Prevents `return to
                    sender` courier charges and reshipment costs by allowing
                    customers to fix apartment numbers, street names, or typos.
                  </List.Item>
                  <List.Item>
                    <strong>Self-Service Cancellation:</strong> Automatically
                    restocks inventory in Shopify and initiates refunds without
                    manual staff intervention.
                  </List.Item>
                  <List.Item>
                    <strong>Fulfillment Safeguard:</strong> Once an order is
                    marked fulfilled or in transit, self-service cancellation
                    and address edits are instantly locked down.
                  </List.Item>
                  <List.Item>
                    <strong>Retention Saver:</strong> Recovers lost revenue by
                    offering a custom discount to customers who reconsider
                    cancelling.
                  </List.Item>
                </List>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Storefront Setup in 2 Minutes
                </Text>
                <Text as="p" variant="bodyMd">
                  Follow these simple steps to activate the self-service button
                  on your store:
                </Text>
                <List type="number">
                  <List.Item>
                    Go to{" "}
                    <strong>
                      Shopify Admin &gt; Online Store &gt; Themes &gt; Customize
                    </strong>
                    .
                  </List.Item>
                  <List.Item>
                    In the left sidebar, click the <strong>App embeds</strong> tab (third icon from top).
                  </List.Item>
                  <List.Item>
                    Locate <strong>SmartCancel Self-Serve</strong> and toggle it <strong>ON</strong>.
                  </List.Item>
                  <List.Item>
                    (Optional) If you use custom sections on your Customer Account / Order pages, you can also click <strong>Add block</strong> and select <strong>SmartCancel Block</strong>.
                  </List.Item>
                  <List.Item>
                    Click <strong>Save</strong> in the top right. SmartCancel will now automatically appear on your customer profile and order status pages!
                  </List.Item>
                </List>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Frequently Asked Questions
                </Text>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    What happens to payments when an order is cancelled?
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    If `Automatically issue refund` is checked in your
                    settings, SmartCancel uses the Shopify Admin GraphQL API to
                    execute a refund via the original gateway (e.g., Shopify
                    Payments, PayPal).
                  </Text>
                </BlockStack>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Can customers cancel orders that are already in transit?
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    No. SmartCancel checks Shopify fulfillment status in real
                    time. If the order status is FULFILLED or IN_TRANSIT, the
                    cancellation button is disabled.
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
