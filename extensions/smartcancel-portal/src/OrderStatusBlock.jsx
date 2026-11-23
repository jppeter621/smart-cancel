import '@shopify/ui-extensions/preact';
import { render } from "preact";
import { useState } from "preact/hooks";

export default async () => {
  render(<OrderStatusBlock />, document.body);
};

function OrderStatusBlock() {
  const [isCancelled, setIsCancelled] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState({
    address1: "151 O'Connor St",
    city: "Ottawa",
    zip: "K2P 2L8",
  });
  const [notice, setNotice] = useState("");

  const handleCancelOrder = () => {
    setIsCancelled(true);
  };

  const handleSaveAddress = () => {
    setShowAddressForm(false);
    setNotice("Shipping address updated successfully!");
  };

  if (isCancelled) {
    return (
      <s-banner tone="info" heading="Order Cancelled">
        <s-text>
          This order has been cancelled and queued for refund via SmartCancel.
        </s-text>
      </s-banner>
    );
  }

  return (
    <s-card>
      <s-stack direction="block" gap="base">
        <s-stack direction="inline" gap="base">
          <s-heading>🛡️ SmartCancel Self-Serve</s-heading>
        </s-stack>

        <s-banner tone="success">
          <s-text>⏱️ 60 minutes left to edit delivery address or cancel this order.</s-text>
        </s-banner>

        {notice ? (
          <s-banner tone="info">
            <s-text>{notice}</s-text>
          </s-banner>
        ) : null}

        {showAddressForm ? (
          <s-stack direction="block" gap="tight">
            <s-text color="subdued">Edit your delivery address below:</s-text>
            <s-text-field
              label="Street Address"
              value={address.address1}
              onInput={(e) => setAddress({ ...address, address1: e.target.value })}
            />
            <s-text-field
              label="City"
              value={address.city}
              onInput={(e) => setAddress({ ...address, city: e.target.value })}
            />
            <s-text-field
              label="Postal Code"
              value={address.zip}
              onInput={(e) => setAddress({ ...address, zip: e.target.value })}
            />
            <s-stack direction="inline" gap="base">
              <s-button kind="primary" onClick={handleSaveAddress}>
                Save Address
              </s-button>
              <s-button kind="secondary" onClick={() => setShowAddressForm(false)}>
                Cancel
              </s-button>
            </s-stack>
          </s-stack>
        ) : (
          <s-stack direction="inline" gap="base">
            <s-button kind="secondary" onClick={() => setShowAddressForm(true)}>
              ✏️ Edit Shipping Address
            </s-button>
            <s-button kind="primary" onClick={handleCancelOrder}>
              ❌ Cancel Order
            </s-button>
          </s-stack>
        )}
      </s-stack>
    </s-card>
  );
}
