export const meta = () => [
  { title: "SmartCancel - Privacy Policy" },
  { name: "description", content: "Privacy Policy and GDPR Compliance for SmartCancel Shopify Application" },
];

export default function PrivacyPolicy() {
  return (
    <div style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", maxWidth: "800px", margin: "40px auto", padding: "0 20px", color: "#202223", lineHeight: "1.6" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Privacy Policy for SmartCancel</h1>
      <p style={{ color: "#6d7175", fontSize: "14px", marginBottom: "24px" }}>Last updated: November 11, 2026</p>

      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>1. Overview</h2>
        <p>
          SmartCancel ("we", "our", or "the App") provides self-service order cancellation, address correction, and customer retention tools for Shopify merchants. We are committed to protecting merchant and customer data privacy in full compliance with the European Union General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and Shopify Partner requirements.
        </p>
      </section>

      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>2. Data We Collect</h2>
        <p>To operate self-service cancellation and address updates, we collect only the minimum required information authorized through Shopify access scopes:</p>
        <ul>
          <li><strong>Merchant Information:</strong> Store domain, shop email, and app configuration settings.</li>
          <li><strong>Order & Shipping Information:</strong> Order ID, customer email address, and shipping address details solely to facilitate customer-requested address edits or cancellations within the merchant-defined cancellation window.</li>
        </ul>
        <p>We do not collect or store customer payment card credentials, passwords, or unrelated personal information.</p>
      </section>

      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>3. Data Retention & Security</h2>
        <p>
          Data is transmitted securely over HTTPS with TLS 1.3 encryption and stored in PostgreSQL databases with automated connection pooling and encryption at rest. Audit logs of customer-initiated cancellations and address modifications are maintained for merchant analytics and can be purged upon request.
        </p>
      </section>

      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>4. GDPR & Mandatory Compliance Webhooks</h2>
        <p>
          SmartCancel implements Shopify's mandatory GDPR compliance webhooks:
        </p>
        <ul>
          <li><strong>Customer Data Request:</strong> Provides all customer data associated with the requester within 30 days.</li>
          <li><strong>Customer Data Redact:</strong> Deletes customer-associated survey responses and action history upon receipt.</li>
          <li><strong>Shop Data Redact:</strong> Completely purges all store settings, sessions, and logs 48 hours after app uninstallation.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>5. Contact Us</h2>
        <p>
          If you have questions regarding this Privacy Policy or wish to request data erasure, please contact our support team at:
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:jppeter621@gmail.com" style={{ color: "#008060" }}>jppeter621@gmail.com</a>
        </p>
      </section>
    </div>
  );
}
