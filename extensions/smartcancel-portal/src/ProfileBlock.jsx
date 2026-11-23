import '@shopify/ui-extensions/preact';
import { render } from "preact";

export default async () => {
  render(<ProfileBlock />, document.body);
};

function ProfileBlock() {
  return (
    <s-card>
      <s-stack direction="block" gap="base">
        <s-stack direction="inline" gap="base">
          <s-heading>🛡️ SmartCancel Order Protection</s-heading>
        </s-stack>
        <s-banner tone="success">
          <s-text>Self-service cancellation and address edits are active on all your recent orders.</s-text>
        </s-banner>
        <s-text color="subdued">
          You can modify shipping addresses or cancel eligible orders directly within 60 minutes of purchase.
        </s-text>
      </s-stack>
    </s-card>
  );
}
