import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // Clean up sessions and reset billing plan to FREE so reinstall starts clean.
  try {
    await db.session.deleteMany({ where: { shop } });
    await db.cancelSettings.updateMany({
      where: { shop },
      data: {
        plan: "FREE",
        monthlyActionsLimit: 25,
      },
    });
  } catch (err) {
    console.warn(`[webhooks.app.uninstalled] Cleanup error for ${shop}:`, err?.message);
  }

  return new Response();
};
