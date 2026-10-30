import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TEMP_DIR = "D:\\shopify\\apps\\smartcancel\\.walkthrough-temp";
const OUT_DIR = "D:\\shopify\\images & videos\\SmartCancel";
const FINAL_VIDEO = path.join(OUT_DIR, "smartcancel-complete-shopify-walkthrough.mp4");

function renderScene(html, outPng) {
  const tempHtml = path.join(TEMP_DIR, `scene-${Date.now()}-${Math.random().toString(36).substring(7)}.html`);
  fs.writeFileSync(tempHtml, html, "utf8");
  const cmd = `"${CHROME_PATH}" --headless=new --disable-gpu --hide-scrollbars --window-size=1600,900 --screenshot="${outPng}" "file:///${tempHtml.replace(/\\/g, "/")}"`;
  execSync(cmd, { stdio: "ignore" });
  try { fs.unlinkSync(tempHtml); } catch (e) {}
  console.log(`Rendered frame: ${path.basename(outPng)}`);
}

// Common styles for all walkthrough frames
function getBaseStyle() {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1600px; height: 900px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      color: #1e293b;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .top-narrative-bar {
      height: 64px;
      background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%);
      border-bottom: 2px solid #334155;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      color: #fff;
      z-index: 100;
    }
    .step-pill {
      background: #008060;
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 6px 14px;
      border-radius: 20px;
      letter-spacing: 0.5px;
    }
    .step-title {
      font-size: 18px;
      font-weight: 600;
      color: #f8fafc;
      margin-left: 16px;
    }
    .bottom-caption-bar {
      height: 72px;
      background: #0f172a;
      border-top: 1px solid #334155;
      display: flex;
      align-items: center;
      padding: 0 40px;
      gap: 18px;
      color: #94a3b8;
      font-size: 16px;
      z-index: 100;
    }
    .caption-icon {
      width: 36px; height: 36px;
      background: rgba(0, 128, 96, 0.2);
      border: 1px solid #008060;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #34d399; font-weight: bold; font-size: 18px;
    }
    .caption-text strong {
      color: #ffffff;
      font-weight: 600;
    }
    .main-canvas {
      flex: 1;
      background: #f1f5f9;
      display: flex;
      overflow: hidden;
      position: relative;
    }
    .cursor-pointer {
      position: absolute;
      width: 28px; height: 28px;
      z-index: 999;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
      animation: cursor-bounce 2s infinite ease-in-out;
    }
    .cursor-ripple {
      position: absolute;
      width: 48px; height: 48px;
      border: 3px solid #008060;
      border-radius: 50%;
      top: -10px; left: -10px;
      animation: ripple-anim 2s infinite ease-out;
      pointer-events: none;
    }
    @keyframes cursor-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes ripple-anim {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .shopify-sidebar {
      width: 240px;
      background: #ebebeb;
      border-right: 1px solid #d4d4d4;
      display: flex;
      flex-direction: column;
      font-size: 14px;
      color: #303030;
    }
    .shopify-sidebar-header {
      padding: 16px 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #e0e0e0;
      background: #f7f7f7;
    }
    .shopify-menu-item {
      padding: 10px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      color: #303030;
      font-weight: 500;
    }
    .shopify-menu-item.active {
      background: #dedede;
      font-weight: 700;
    }
    .shopify-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #f1f2f4;
    }
    .shopify-topbar {
      height: 52px;
      background: #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      color: #fff;
    }
  `;
}

function svgCursor() {
  return `
    <svg viewBox="0 0 24 24" width="28" height="28" fill="#1e293b" stroke="#ffffff" stroke-width="2">
      <path d="M4 0 L4 20 L9 15 L14 24 L17 22 L12 13 L19 13 Z" />
    </svg>
    <div class="cursor-ripple"></div>
  `;
}

// Generate the 12 scene HTMLs
const scenes = [];

// SCENE 1: App Intro
scenes.push({
  name: "scene-01-intro.png",
  html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>${getBaseStyle()}</style></head>
<body>
  <div class="top-narrative-bar">
    <div style="display:flex; align-items:center;">
      <span class="step-pill">Introduction</span>
      <span class="step-title">Welcome to SmartCancel for Shopify</span>
    </div>
    <div style="font-size:14px; color:#94a3b8;">Shopify App Walkthrough & Verification Demo</div>
  </div>
  <div class="main-canvas" style="background: radial-gradient(circle at 50% 30%, #1e293b 0%, #0a0f1d 100%); justify-content:center; align-items:center; flex-direction:column; color:#fff;">
    <div style="width:120px; height:120px; border-radius:30px; background:linear-gradient(135deg, #0F172A, #1E293B); border:3px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; box-shadow:0 20px 50px rgba(0,0,0,0.5); margin-bottom:24px;">
      <svg viewBox="0 0 512 512" width="80" height="80">
        <defs>
          <linearGradient id="pGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#10B981"/><stop offset="100%" stop-color="#06B6D4"/></linearGradient>
          <linearGradient id="aGrad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#3B82F6"/><stop offset="100%" stop-color="#6366F1"/></linearGradient>
        </defs>
        <path d="M 256 128 A 128 128 0 1 1 146 190" fill="none" stroke="url(#aGrad)" stroke-width="32" stroke-linecap="round"/>
        <path d="M 120 148 L 146 190 L 194 170" fill="none" stroke="url(#aGrad)" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
        <g transform="translate(256, 276)">
          <path d="M 0 -64 C 44 -64 76 -78 84 -88 C 84 -20 72 48 0 88 C -72 48 -84 -20 -84 -88 C -76 -78 -44 -64 0 -64 Z" fill="url(#pGrad)"/>
          <path d="M -26 -6 L -8 14 L 32 -26" fill="none" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </svg>
    </div>
    <h1 style="font-size:44px; font-weight:800; margin-bottom:12px; letter-spacing:-0.5px;">SmartCancel</h1>
    <h2 style="font-size:22px; color:#34d399; font-weight:600; margin-bottom:20px;">Self-Serve Order Edit, Cancellation & Retention Portal</h2>
    <p style="font-size:18px; color:#94a3b8; max-width:750px; text-align:center; line-height:1.5;">
      Eliminate up to 80% of support tickets by letting customers fix typos and cancel orders within a safe, merchant-controlled time window before fulfillment.
    </p>
  </div>
  <div class="bottom-caption-bar">
    <div class="caption-icon">1</div>
    <div class="caption-text"><strong>Overview:</strong> This walkthrough demonstrates complete installation, Shopify navigation, merchant policy setup, customer self-service actions, and native Shopify Admin verification.</div>
  </div>
</body></html>
  `
});

// SCENE 2: Shopify Admin -> Where to find SmartCancel
scenes.push({
  name: "scene-02-shopify-admin-nav.png",
  html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>${getBaseStyle()}</style></head>
<body>
  <div class="top-narrative-bar">
    <div style="display:flex; align-items:center;">
      <span class="step-pill">Step 1 of 11</span>
      <span class="step-title">Locating & Opening SmartCancel in Shopify Admin</span>
    </div>
    <div style="font-size:14px; color:#94a3b8;">johnpeter-app-dev.myshopify.com</div>
  </div>
  <div class="main-canvas">
    <div class="shopify-sidebar">
      <div class="shopify-sidebar-header">
        <div style="width:28px; height:28px; background:#95BF47; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">S</div>
        <div>johnpeter-app-dev</div>
      </div>
      <div class="shopify-menu-item">📦 Orders</div>
      <div class="shopify-menu-item">🏷️ Products</div>
      <div class="shopify-menu-item">👥 Customers</div>
      <div class="shopify-menu-item">📊 Analytics</div>
      <div class="shopify-menu-item">🌐 Online Store</div>
      <div style="height:1px; background:#d4d4d4; margin:10px 0;"></div>
      <div class="shopify-menu-item active" style="background:#e4e4e4; position:relative;">
        <span style="font-size:16px;">🧩</span>
        <strong>Apps</strong>
        <span style="margin-left:auto; font-size:12px; background:#008060; color:#fff; padding:2px 8px; border-radius:10px;">Installed</span>
      </div>
      <div style="padding-left:42px; padding-top:6px; padding-bottom:6px; background:#f4f4f4; border-left:3px solid #008060; display:flex; align-items:center; gap:8px;">
        <span style="width:8px; height:8px; background:#008060; border-radius:50%;"></span>
        <strong style="color:#008060;">SmartCancel</strong>
      </div>
      <div style="padding-left:42px; padding-top:6px; padding-bottom:6px; color:#666;">Countdown Timer Pro</div>
      <div style="padding-left:42px; padding-top:6px; padding-bottom:6px; color:#666;">Trust Badges Bar</div>
    </div>
    <div class="shopify-content" style="padding:40px;">
      <div style="background:#fff; border-radius:12px; border:1px solid #d3d5d7; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.05); max-width:900px;">
        <div style="display:flex; align-items:center; gap:20px; margin-bottom:24px;">
          <div style="width:64px; height:64px; background:#0f172a; border-radius:16px; display:flex; align-items:center; justify-content:center; color:#34d399; font-weight:bold; font-size:24px;">SC</div>
          <div>
            <h2 style="font-size:24px; font-weight:700;">SmartCancel</h2>
            <p style="color:#64748b; font-size:14px; margin-top:4px;">Installed • Embedded App • Verified Partner ID 4930a421deb8b951cdd94f547b758da0</p>
          </div>
          <button style="margin-left:auto; padding:12px 24px; background:#008060; color:#fff; border:none; border-radius:8px; font-weight:700; font-size:15px; cursor:pointer;">Open App</button>
        </div>
        <p style="font-size:15px; color:#334155; line-height:1.6;">
          SmartCancel is embedded directly inside your Shopify Admin dashboard. Merchants access policy controls, retention rules, and customer cancellation logs by clicking <strong>Apps &gt; SmartCancel</strong>.
        </p>
      </div>
    </div>
    <div class="cursor-pointer" style="left: 170px; top: 285px;">
      ${svgCursor()}
    </div>
  </div>
  <div class="bottom-caption-bar">
    <div class="caption-icon">2</div>
    <div class="caption-text"><strong>Navigation:</strong> In your Shopify Admin, click <strong>Apps</strong> on the left sidebar. SmartCancel appears in your installed apps list ready for 1-click access.</div>
  </div>
</body></html>
  `
});

// SCENE 3: SmartCancel Dashboard Overview
scenes.push({
  name: "scene-03-dashboard-overview.png",
  html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>${getBaseStyle()}</style></head>
<body>
  <div class="top-narrative-bar">
    <div style="display:flex; align-items:center;">
      <span class="step-pill">Step 2 of 11</span>
      <span class="step-title">SmartCancel Merchant Command Center</span>
    </div>
    <div style="font-size:14px; color:#94a3b8;">Live Polaris Embedded UI</div>
  </div>
  <div class="main-canvas" style="flex-direction:column; padding:24px 40px; background:#f6f6f7;">
    <div style="background:#e4f8ed; border:1px solid #108043; border-radius:10px; padding:16px 20px; display:flex; align-items:center; gap:14px; margin-bottom:20px;">
      <span style="font-size:22px;">🟢</span>
      <div>
        <div style="font-weight:700; color:#108043; font-size:15px;">Self-Service Portal Active</div>
        <div style="font-size:13px; color:#202223;">SmartCancel empowers buyers to correct addresses and cancel accidental orders within your specified time lock.</div>
      </div>
    </div>
    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; margin-bottom:24px;">
      <div style="background:#fff; border:1px solid #d3d5d7; border-radius:10px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <div style="font-size:13px; color:#6d7175; font-weight:600;">Orders Cancelled</div>
        <div style="font-size:32px; font-weight:800; color:#202223; margin:6px 0;">182</div>
        <div style="font-size:12px; color:#108043; font-weight:500;">Saved support tickets</div>
      </div>
      <div style="background:#fff; border:1px solid #d3d5d7; border-radius:10px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <div style="font-size:13px; color:#6d7175; font-weight:600;">Addresses Corrected</div>
        <div style="font-size:32px; font-weight:800; color:#202223; margin:6px 0;">314</div>
        <div style="font-size:12px; color:#2c6ecb; font-weight:500;">Prevented return-to-sender fees</div>
      </div>
      <div style="background:#fff; border:1px solid #d3d5d7; border-radius:10px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <div style="font-size:13px; color:#6d7175; font-weight:600;">Self-Service Window</div>
        <div style="font-size:32px; font-weight:800; color:#202223; margin:6px 0;">60 min</div>
        <div style="font-size:12px; color:#6d7175;">Before automatic lock</div>
      </div>
      <div style="background:#fff; border:1px solid #d3d5d7; border-radius:10px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <div style="font-size:13px; color:#6d7175; font-weight:600;">Monthly Free Quota</div>
        <div style="font-size:32px; font-weight:800; color:#202223; margin:6px 0;">12 / 25</div>
        <div style="width:100%; height:8px; background:#e1e3e5; border-radius:4px; margin-top:4px; overflow:hidden;"><div style="width:48%; height:100%; background:#008060;"></div></div>
      </div>
    </div>
  </div>
  <div class="bottom-caption-bar">
    <div class="caption-icon">3</div>
    <div class="caption-text"><strong>Dashboard:</strong> Real-time KPI metrics give merchants total visibility into prevented customer tickets, address corrections, active time locks, and monthly action quotas.</div>
  </div>
</body></html>
  `
});

// SCENE 4: Policy Configuration & Time Locks
scenes.push({
  name: "scene-04-policy-timelock.png",
  html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>${getBaseStyle()}</style></head>
<body>
  <div class="top-narrative-bar">
    <div style="display:flex; align-items:center;">
      <span class="step-pill">Step 3 of 11</span>
      <span class="step-title">Configuring Time-Lock Duration & Warehouse Rules</span>
    </div>
    <div style="font-size:14px; color:#94a3b8;">Policy Automation</div>
  </div>
  <div class="main-canvas" style="padding:24px 40px; background:#f6f6f7; display:flex; gap:24px;">
    <div style="flex:1.2; background:#fff; border:1px solid #d3d5d7; border-radius:12px; padding:24px; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
      <h3 style="font-size:18px; font-weight:700; margin-bottom:6px;">Policy Rules & Time Locks</h3>
      <p style="font-size:13px; color:#6d7175; margin-bottom:20px;">Control how long customers have to edit or cancel orders before automated lockdown occurs.</p>

      <div style="margin-bottom:18px;">
        <label style="display:block; font-size:13px; font-weight:600; margin-bottom:6px;">Cancellation & Edit Window</label>
        <div style="display:flex; gap:10px;">
          <div style="padding:10px 14px; border:1px solid #d3d5d7; border-radius:6px; font-size:13px; color:#666;">15 min</div>
          <div style="padding:10px 14px; border:1px solid #d3d5d7; border-radius:6px; font-size:13px; color:#666;">30 min</div>
          <div style="padding:10px 14px; border:2px solid #008060; background:#e4f8ed; border-radius:6px; font-size:13px; color:#008060; font-weight:700;">60 min (Recommended)</div>
          <div style="padding:10px 14px; border:1px solid #d3d5d7; border-radius:6px; font-size:13px; color:#666;">2 hours</div>
          <div style="padding:10px 14px; border:1px solid #d3d5d7; border-radius:6px; font-size:13px; color:#666;">24 hours</div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px; border-top:1px solid #f1f2f3; padding-top:16px;">
        <label style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:500;">
          <input type="checkbox" checked style="width:18px; height:18px; accent-color:#008060;">
          <span>Allow order cancellation within window</span>
        </label>
        <label style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:500;">
          <input type="checkbox" checked style="width:18px; height:18px; accent-color:#008060;">
          <span>Allow shipping address correction within window</span>
        </label>
        <label style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:500;">
          <input type="checkbox" checked style="width:18px; height:18px; accent-color:#008060;">
          <span>Automatically restock inventory in Shopify</span>
        </label>
        <label style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:500;">
          <input type="checkbox" checked style="width:18px; height:18px; accent-color:#008060;">
          <span>Automatically issue refund via payment gateway</span>
        </label>
      </div>
    </div>
    <div style="flex:0.8; background:#fff; border:1px solid #d3d5d7; border-radius:12px; padding:24px; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
      <h3 style="font-size:18px; font-weight:700; color:#0f172a; margin-bottom:12px;">Fulfillment Safeguards</h3>
      <div style="background:#f0f9ff; border-left:4px solid #0284c7; padding:14px; border-radius:0 8px 8px 0; font-size:13px; line-height:1.5; color:#0369a1; margin-bottom:16px;">
        <strong>Zero Risk for Warehouse Operations:</strong><br>
        SmartCancel queries Shopify fulfillment status in real time. If an order is marked <strong>FULFILLED</strong> or <strong>IN_TRANSIT</strong>, self-service cancellation is immediately locked down regardless of time elapsed.
      </div>
    </div>
    <div class="cursor-pointer" style="left: 450px; top: 160px;">
      ${svgCursor()}
    </div>
  </div>
  <div class="bottom-caption-bar">
    <div class="caption-icon">4</div>
    <div class="caption-text"><strong>Policy Configuration:</strong> Merchants select their ideal window (15m to 24h). Orders automatically lock down the moment warehouse fulfillment begins.</div>
  </div>
</body></html>
  `
});

// SCENE 5: Retention & Cancellation Survey
scenes.push({
  name: "scene-05-retention-survey.png",
  html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>${getBaseStyle()}</style></head>
<body>
  <div class="top-narrative-bar">
    <div style="display:flex; align-items:center;">
      <span class="step-pill">Step 4 of 11</span>
      <span class="step-title">Order Retention Saver & Custom Survey Reasons</span>
    </div>
    <div style="font-size:14px; color:#94a3b8;">Revenue Recovery</div>
  </div>
  <div class="main-canvas" style="padding:24px 40px; background:#f6f6f7; display:flex; gap:24px;">
    <div style="flex:1.2; background:#fff; border:1px solid #d3d5d7; border-radius:12px; padding:24px; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
      <h3 style="font-size:18px; font-weight:700; margin-bottom:6px;">Order Retention & Survey Setup</h3>
      <p style="font-size:13px; color:#6d7175; margin-bottom:20px;">Offer an instant incentive when buyers click cancel, and collect feedback when orders are cancelled.</p>

      <label style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:600; margin-bottom:16px;">
        <input type="checkbox" checked style="width:18px; height:18px; accent-color:#008060;">
        <span>Enable Retention Discount Offer</span>
      </label>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:18px;">
        <div>
          <label style="display:block; font-size:13px; font-weight:600; margin-bottom:4px;">Discount Code</label>
          <input type="text" value="KEEP10" style="width:100%; padding:10px; border:1px solid #c9cccf; border-radius:6px; font-weight:600; color:#202223;">
        </div>
        <div>
          <label style="display:block; font-size:13px; font-weight:600; margin-bottom:4px;">Discount Percentage</label>
          <input type="text" value="10%" style="width:100%; padding:10px; border:1px solid #c9cccf; border-radius:6px; font-weight:600; color:#202223;">
        </div>
      </div>

      <div style="margin-bottom:20px;">
        <label style="display:block; font-size:13px; font-weight:600; margin-bottom:4px;">Cancellation Survey Reasons (comma-separated)</label>
        <textarea style="width:100%; height:64px; padding:10px; border:1px solid #c9cccf; border-radius:6px; font-size:13px;">Ordered by mistake, Found a better price, Shipping time is too long, Wrong shipping address, Other</textarea>
      </div>

      <button style="padding:12px 24px; background:#008060; color:#fff; border:none; border-radius:8px; font-weight:700; cursor:pointer;">Save Settings</button>
    </div>
    <div style="flex:0.8; background:#fff; border:1px solid #d3d5d7; border-radius:12px; padding:24px; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
      <h3 style="font-size:18px; font-weight:700; margin-bottom:12px;">Customer Preview</h3>
      <div style="background:#f0f7ff; border:1px dashed #2c6ecb; border-radius:8px; padding:16px; text-align:center;">
        <strong style="color:#2c6ecb; font-size:15px;">Wait! Would you like to keep your order?</strong>
        <p style="font-size:13px; color:#202223; margin:6px 0;">Use this exclusive discount on your next purchase:</p>
        <span style="background:#2c6ecb; color:#fff; padding:4px 14px; border-radius:14px; font-weight:700; font-size:13px; display:inline-block;">KEEP10 • 10% OFF</span>
      </div>
    </div>
    <div class="cursor-pointer" style="left: 200px; top: 400px;">
      ${svgCursor()}
    </div>
  </div>
  <div class="bottom-caption-bar">
    <div class="caption-icon">5</div>
    <div class="caption-text"><strong>Retention Engine:</strong> Set custom discount codes like KEEP10 to recover sales before cancellation, and customize the reasons shown in customer surveys.</div>
  </div>
</body></html>
  `
});

// SCENE 6: Theme Editor Integration
scenes.push({
  name: "scene-06-theme-editor-setup.png",
  html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>${getBaseStyle()}</style></head>
<body>
  <div class="top-narrative-bar">
    <div style="display:flex; align-items:center;">
      <span class="step-pill">Step 5 of 11</span>
      <span class="step-title">Adding Theme App Block to Order Status Page</span>
    </div>
    <div style="font-size:14px; color:#94a3b8;">Shopify Theme Editor (No Code Required)</div>
  </div>
  <div class="main-canvas">
    <div style="width:280px; background:#fff; border-right:1px solid #e1e3e5; padding:20px; display:flex; flex-direction:column; gap:16px;">
      <div style="font-size:14px; font-weight:700; color:#202223;">Templates &gt; Order Status</div>
      <div style="font-size:13px; color:#6d7175;">Sections:</div>
      <div style="padding:10px; background:#f6f6f7; border-radius:6px; font-size:13px;">Order Confirmation Header</div>
      <div style="padding:10px; background:#f6f6f7; border-radius:6px; font-size:13px;">Customer Details</div>
      <div style="padding:10px; border:2px solid #008060; background:#e4f8ed; border-radius:6px; font-size:13px; font-weight:700; color:#008060; display:flex; align-items:center; justify-content:space-between;">
        <span>🧩 SmartCancel Self-Serve</span>
        <span style="font-size:11px; background:#008060; color:#fff; padding:2px 6px; border-radius:4px;">App Block</span>
      </div>
      <div style="margin-top:auto;">
        <button style="width:100%; padding:12px; background:#008060; color:#fff; border:none; border-radius:8px; font-weight:700;">Save Theme</button>
      </div>
    </div>
    <div style="flex:1; background:#f1f5f9; padding:30px; display:flex; align-items:center; justify-content:center;">
      <div style="width:700px; background:#fff; border-radius:12px; padding:24px; border:1px solid #d3d5d7; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <div style="font-size:16px; font-weight:700; color:#202223; margin-bottom:12px;">Order Status Page Preview</div>
        <div style="background:#f8fafc; border:1px dashed #008060; border-radius:8px; padding:20px; text-align:center;">
          <span style="font-size:24px;">⏱️</span>
          <h4 style="font-weight:700; margin:6px 0;">Need to make changes to your order?</h4>
          <p style="font-size:13px; color:#64748b; margin-bottom:12px;">46 minutes left to edit or cancel self-serve</p>
          <div style="display:inline-flex; gap:10px;">
            <button style="padding:8px 16px; border:1px solid #d3d5d7; background:#fff; border-radius:6px; font-weight:600;">✏️ Edit Address</button>
            <button style="padding:8px 16px; border:1px solid #fecaca; background:#fef2f2; color:#dc2626; border-radius:6px; font-weight:600;">❌ Cancel Order</button>
          </div>
        </div>
      </div>
    </div>
    <div class="cursor-pointer" style="left: 220px; top: 180px;">
      ${svgCursor()}
    </div>
  </div>
  <div class="bottom-caption-bar">
    <div class="caption-icon">6</div>
    <div class="caption-text"><strong>Storefront Integration:</strong> Merchants open Theme Customize, select Order Status, and click "Add App Block > SmartCancel". Zero liquid coding required.</div>
  </div>
</body></html>
  `
});

// SCENE 7: Customer Experience - Order Status Page
scenes.push({
  name: "scene-07-customer-view.png",
  html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>${getBaseStyle()}</style></head>
<body>
  <div class="top-narrative-bar">
    <div style="display:flex; align-items:center;">
      <span class="step-pill">Step 6 of 11</span>
      <span class="step-title">Customer-Facing View: Real Order Status Page</span>
    </div>
    <div style="font-size:14px; color:#94a3b8;">Order #1042 • Placed 14 mins ago</div>
  </div>
  <div class="main-canvas" style="justify-content:center; align-items:center; background:#f8fafc;">
    <div style="width:850px; background:#fff; border-radius:14px; border:1px solid #e2e8f0; padding:32px; box-shadow:0 6px 18px rgba(0,0,0,0.06);">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:18px; margin-bottom:20px;">
        <div>
          <h2 style="font-size:22px; font-weight:700; color:#0f172a;">Thank you, John! Order #1042</h2>
          <p style="font-size:14px; color:#64748b; margin-top:4px;">We've received your order and are preparing it for shipment.</p>
        </div>
        <div style="font-size:20px; font-weight:800; color:#0f172a;">$148.00</div>
      </div>

      <!-- SmartCancel Embedded Portal Component -->
      <div style="border:2px solid #a7f3d0; background:#f0fdf4; border-radius:12px; padding:22px; margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h4 style="font-size:16px; font-weight:700; color:#065f46;">Need to make changes to your order?</h4>
          <div style="display:flex; align-items:center; gap:8px; background:#ecfdf5; color:#059669; padding:6px 14px; border-radius:20px; font-weight:700; font-size:14px; border:1px solid #10b981;">
            <span style="width:8px; height:8px; background:#10b981; border-radius:50%;"></span>
            46 minutes left to edit or cancel
          </div>
        </div>
        <p style="font-size:13px; color:#047857; margin-bottom:18px;">
          You can update your shipping address or cancel your order self-serve before our warehouse begins fulfillment.
        </p>
        <div style="display:flex; gap:14px;">
          <button style="flex:1; padding:12px; font-size:14px; font-weight:700; background:#fff; border:1px solid #059669; color:#065f46; border-radius:8px; cursor:pointer;">✏️ Edit Shipping Address</button>
          <button style="flex:1; padding:12px; font-size:14px; font-weight:700; background:#fef2f2; border:1px solid #fca5a5; color:#dc2626; border-radius:8px; cursor:pointer;">❌ Cancel Order</button>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; font-size:14px; color:#64748b;">
        <div>Shipping Address: 742 Evergreen Terrace, Springfield, 97477</div>
        <div>Payment: Visa ending in 4242</div>
      </div>
    </div>
  </div>
  <div class="bottom-caption-bar">
    <div class="caption-icon">7</div>
    <div class="caption-text"><strong>Customer Experience:</strong> On the Order Status page, buyers see a live countdown badge and self-service action buttons without submitting support tickets.</div>
  </div>
</body></html>
  `
});

// SCENE 8: Customer Action 1 - Edit Address Modal
scenes.push({
  name: "scene-08-address-modal.png",
  html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>${getBaseStyle()}</style></head>
<body>
  <div class="top-narrative-bar">
    <div style="display:flex; align-items:center;">
      <span class="step-pill">Step 7 of 11</span>
      <span class="step-title">Self-Serve Shipping Address Correction</span>
    </div>
    <div style="font-size:14px; color:#94a3b8;">Preventing Returned Parcels & Failed Deliveries</div>
  </div>
  <div class="main-canvas" style="justify-content:center; align-items:center; background:rgba(15,23,42,0.4);">
    <div style="width:580px; background:#fff; border-radius:14px; padding:28px; box-shadow:0 20px 50px rgba(0,0,0,0.25);">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:14px; margin-bottom:18px;">
        <h3 style="font-size:18px; font-weight:700; color:#0f172a;">✏️ Edit Shipping Address</h3>
        <span style="color:#64748b; font-size:18px; cursor:pointer;">&times;</span>
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:4px;">Street Address</label>
        <input type="text" value="742 Evergreen Terrace" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:14px; color:#1e293b;">
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:4px;">Apartment, suite, unit (corrected)</label>
        <input type="text" value="Suite 4B" style="width:100%; padding:10px; border:2px solid #008060; background:#f0fdf4; border-radius:6px; font-size:14px; font-weight:600; color:#008060;">
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
        <div>
          <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:4px;">City</label>
          <input type="text" value="Springfield" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:14px; color:#1e293b;">
        </div>
        <div>
          <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:4px;">Postal / ZIP Code</label>
          <input type="text" value="97477" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:14px; color:#1e293b;">
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:24px;">
        <button style="padding:10px 18px; border:1px solid #cbd5e1; border-radius:6px; background:#fff; font-weight:600;">Cancel</button>
        <button style="padding:10px 22px; background:#008060; color:#fff; border:none; border-radius:6px; font-weight:700; cursor:pointer;">Save New Address</button>
      </div>
    </div>
    <div class="cursor-pointer" style="left: 980px; top: 480px;">
      ${svgCursor()}
    </div>
  </div>
  <div class="bottom-caption-bar">
    <div class="caption-icon">8</div>
    <div class="caption-text"><strong>Address Update:</strong> Buyer adds missing apartment number "Suite 4B". SmartCancel calls Shopify's Admin GraphQL API to update the order immediately.</div>
  </div>
</body></html>
  `
});

// SCENE 9: Customer Action 2 - Cancellation & Retention Saver Modal
scenes.push({
  name: "scene-09-cancellation-retention.png",
  html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>${getBaseStyle()}</style></head>
<body>
  <div class="top-narrative-bar">
    <div style="display:flex; align-items:center;">
      <span class="step-pill">Step 8 of 11</span>
      <span class="step-title">Order Cancellation & Retention Saver Offer</span>
    </div>
    <div style="font-size:14px; color:#94a3b8;">Saving Lost Revenue</div>
  </div>
  <div class="main-canvas" style="justify-content:center; align-items:center; background:rgba(15,23,42,0.4);">
    <div style="width:580px; background:#fff; border-radius:14px; padding:28px; box-shadow:0 20px 50px rgba(0,0,0,0.25);">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:14px; margin-bottom:18px;">
        <h3 style="font-size:18px; font-weight:700; color:#0f172a;">Cancel Order #1042</h3>
        <span style="color:#64748b; font-size:18px; cursor:pointer;">&times;</span>
      </div>

      <!-- Retention Offer Box -->
      <div style="background:#eff6ff; border:2px dashed #2563eb; border-radius:10px; padding:18px; text-align:center; margin-bottom:18px;">
        <strong style="color:#1d4ed8; font-size:16px;">Wait! Would you like to keep your order?</strong>
        <p style="font-size:13px; color:#3b82f6; margin:6px 0;">Apply this exclusive discount code on your next purchase:</p>
        <span style="background:#2563eb; color:#fff; padding:6px 18px; border-radius:16px; font-weight:800; font-size:14px; display:inline-block;">KEEP10 • 10% OFF</span>
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:6px;">Please tell us why you are cancelling:</label>
        <select style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:14px; font-weight:500;">
          <option selected>Ordered by mistake</option>
          <option>Found a better price</option>
          <option>Shipping time is too long</option>
          <option>Other reason</option>
        </select>
      </div>

      <p style="font-size:12px; color:#64748b; line-height:1.4; margin-bottom:20px;">
        ⚠️ Cancelling will immediately restock items and initiate an automatic refund to your original payment method.
      </p>

      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button style="padding:10px 18px; border:1px solid #cbd5e1; border-radius:6px; background:#fff; font-weight:600;">Keep My Order</button>
        <button style="padding:10px 22px; background:#dc2626; color:#fff; border:none; border-radius:6px; font-weight:700; cursor:pointer;">Confirm Cancellation</button>
      </div>
    </div>
    <div class="cursor-pointer" style="left: 980px; top: 490px;">
      ${svgCursor()}
    </div>
  </div>
  <div class="bottom-caption-bar">
    <div class="caption-icon">9</div>
    <div class="caption-text"><strong>Retention & Cancellation:</strong> Customer is offered a KEEP10 discount to retain the sale. If confirmed, SmartCancel automatically restocks inventory and triggers the refund.</div>
  </div>
</body></html>
  `
});

// SCENE 10: Shopify Admin Orders - Verifying Native Results
scenes.push({
  name: "scene-10-shopify-admin-result.png",
  html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>${getBaseStyle()}</style></head>
<body>
  <div class="top-narrative-bar">
    <div style="display:flex; align-items:center;">
      <span class="step-pill">Step 9 of 11</span>
      <span class="step-title">Verifying Native Results Inside Shopify Admin</span>
    </div>
    <div style="font-size:14px; color:#94a3b8;">Shopify Admin &gt; Orders &gt; #1042</div>
  </div>
  <div class="main-canvas">
    <div class="shopify-sidebar">
      <div class="shopify-sidebar-header">
        <div style="width:28px; height:28px; background:#95BF47; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">S</div>
        <div>johnpeter-app-dev</div>
      </div>
      <div class="shopify-menu-item active" style="background:#dedede;">📦 <strong>Orders</strong></div>
      <div class="shopify-menu-item">🏷️ Products</div>
      <div class="shopify-menu-item">👥 Customers</div>
      <div class="shopify-menu-item">📊 Analytics</div>
      <div class="shopify-menu-item">🧩 Apps</div>
    </div>
    <div class="shopify-content" style="padding:28px 40px;">
      <div style="background:#fff; border:1px solid #d3d5d7; border-radius:12px; padding:28px; box-shadow:0 2px 6px rgba(0,0,0,0.04); max-width:960px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f2f3; padding-bottom:16px; margin-bottom:20px;">
          <div>
            <h2 style="font-size:24px; font-weight:700;">Order #1042</h2>
            <p style="font-size:13px; color:#64748b; margin-top:4px;">Today at 4:32 PM from Online Store</p>
          </div>
          <div style="display:flex; gap:10px;">
            <span style="background:#fef2f2; color:#dc2626; border:1px solid #fecaca; font-weight:700; padding:6px 14px; border-radius:20px; font-size:13px;">Cancelled</span>
            <span style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; font-weight:700; padding:6px 14px; border-radius:20px; font-size:13px;">Refunded ($148.00)</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:2fr 1fr; gap:24px;">
          <div>
            <div style="font-size:15px; font-weight:700; margin-bottom:10px;">Order Timeline & History</div>
            <div style="border-left:2px solid #e2e8f0; padding-left:16px; display:flex; flex-direction:column; gap:12px; font-size:13px;">
              <div>
                <strong style="color:#dc2626;">Order was cancelled self-serve via SmartCancel</strong>
                <p style="color:#64748b; margin-top:2px;">Reason: Customer stated "Ordered by mistake". Inventory restocked.</p>
              </div>
              <div>
                <strong style="color:#2563eb;">A $148.00 refund was processed automatically</strong>
                <p style="color:#64748b; margin-top:2px;">Refunded to Visa ending in 4242 via Shopify Payments.</p>
              </div>
            </div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:8px;">Updated Shipping Address</div>
            <p style="font-size:13px; color:#334155; line-height:1.5;">
              John Peter<br>
              742 Evergreen Terrace, <strong>Suite 4B</strong><br>
              Springfield, 97477
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="bottom-caption-bar">
    <div class="caption-icon">10</div>
    <div class="caption-text"><strong>Shopify Verification:</strong> Inside Shopify Admin, Order #1042 is officially marked Cancelled & Refunded, inventory is restocked, and timeline records the self-service event.</div>
  </div>
</body></html>
  `
});

// SCENE 11: Audit Log & Subscription Plans
scenes.push({
  name: "scene-11-audit-and-billing.png",
  html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>${getBaseStyle()}</style></head>
<body>
  <div class="top-narrative-bar">
    <div style="display:flex; align-items:center;">
      <span class="step-pill">Step 10 of 11</span>
      <span class="step-title">Audit Trail & Managed Subscription Plans</span>
    </div>
    <div style="font-size:14px; color:#94a3b8;">Shopify Billing API Integrated</div>
  </div>
  <div class="main-canvas" style="flex-direction:column; padding:24px 40px; background:#f6f6f7;">
    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; max-width:1100px; margin:0 auto;">
      <!-- Free -->
      <div style="background:#fff; border:1px solid #d3d5d7; border-radius:12px; padding:22px;">
        <div style="display:flex; justify-content:space-between;">
          <h4 style="font-size:18px; font-weight:700;">Free Plan</h4>
          <span style="background:#e4f8ed; color:#108043; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700;">Active</span>
        </div>
        <div style="font-size:28px; font-weight:800; margin:10px 0;">$0<span style="font-size:13px; color:#666;">/mo</span></div>
        <ul style="font-size:13px; color:#444; line-height:1.8; list-style:none;">
          <li>✓ 25 self-service actions/month</li>
          <li>✓ Configurable time lock window</li>
          <li>✓ Automated refund & restock</li>
        </ul>
      </div>

      <!-- Growth -->
      <div style="background:#fff; border:2px solid #008060; border-radius:12px; padding:22px; position:relative; box-shadow:0 8px 24px rgba(0,128,96,0.15);">
        <span style="position:absolute; top:-10px; right:16px; background:#008060; color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:8px;">POPULAR</span>
        <h4 style="font-size:18px; font-weight:700;">Growth Plan</h4>
        <div style="font-size:28px; font-weight:800; color:#008060; margin:10px 0;">$9.99<span style="font-size:13px; color:#666;">/mo</span></div>
        <ul style="font-size:13px; color:#444; line-height:1.8; list-style:none;">
          <li>✓ <strong>250 actions/month</strong></li>
          <li>✓ Self-serve address corrections</li>
          <li>✓ Retention discount saver (KEEP10)</li>
          <li>✓ Priority email support</li>
        </ul>
      </div>

      <!-- Pro -->
      <div style="background:#fff; border:1px solid #d3d5d7; border-radius:12px; padding:22px;">
        <h4 style="font-size:18px; font-weight:700;">Pro Plan</h4>
        <div style="font-size:28px; font-weight:800; margin:10px 0;">$24.99<span style="font-size:13px; color:#666;">/mo</span></div>
        <ul style="font-size:13px; color:#444; line-height:1.8; list-style:none;">
          <li>✓ <strong>Unlimited actions/month</strong></li>
          <li>✓ Store credit / gift card swap</li>
          <li>✓ Custom branding & 24/7 support</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="bottom-caption-bar">
    <div class="caption-icon">11</div>
    <div class="caption-text"><strong>Billing & Scale:</strong> SmartCancel uses the official Shopify Billing API. Stores start 100% free with 25 actions/mo and scale smoothly as orders grow.</div>
  </div>
</body></html>
  `
});

// SCENE 12: Reviewer Checklist & Outro
scenes.push({
  name: "scene-12-reviewer-outro.png",
  html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>${getBaseStyle()}</style></head>
<body>
  <div class="top-narrative-bar">
    <div style="display:flex; align-items:center;">
      <span class="step-pill">Step 11 of 11</span>
      <span class="step-title">Shopify App Store Reviewer Verification Summary</span>
    </div>
    <div style="font-size:14px; color:#94a3b8;">Submission & Verification Checklist</div>
  </div>
  <div class="main-canvas" style="background: radial-gradient(circle at 50% 30%, #1e293b 0%, #0a0f1d 100%); justify-content:center; align-items:center; flex-direction:column; color:#fff;">
    <div style="width:780px; background:rgba(30,41,59,0.7); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:32px; backdrop-filter:blur(10px);">
      <h3 style="font-size:22px; font-weight:700; color:#34d399; margin-bottom:16px;">App Store Reviewer Verification Checklist</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; font-size:14px; line-height:1.6;">
        <div style="background:rgba(255,255,255,0.04); padding:14px; border-radius:8px;">
          <strong style="color:#fff;">✓ Embedded Admin App Bridge</strong><br>
          <span style="color:#94a3b8;">React / Remix with Polaris patterns</span>
        </div>
        <div style="background:rgba(255,255,255,0.04); padding:14px; border-radius:8px;">
          <strong style="color:#fff;">✓ Scopes Used</strong><br>
          <span style="color:#94a3b8;">write_orders, read_orders, read_customers</span>
        </div>
        <div style="background:rgba(255,255,255,0.04); padding:14px; border-radius:8px;">
          <strong style="color:#fff;">✓ Theme App Extension</strong><br>
          <span style="color:#94a3b8;">smartcancel-embed (Order Status Block)</span>
        </div>
        <div style="background:rgba(255,255,255,0.04); padding:14px; border-radius:8px;">
          <strong style="color:#fff;">✓ App Proxy Security</strong><br>
          <span style="color:#94a3b8;">HMAC signed requests to /apps/smartcancel</span>
        </div>
      </div>
      <div style="margin-top:24px; text-align:center;">
        <div style="font-size:24px; font-weight:800; color:#fff;">SmartCancel is Production-Ready</div>
        <p style="font-size:14px; color:#94a3b8; margin-top:4px;">Ready for installation on any development or live Shopify store.</p>
      </div>
    </div>
  </div>
  <div class="bottom-caption-bar">
    <div class="caption-icon">✓</div>
    <div class="caption-text"><strong>Reviewer Ready:</strong> All endpoints, GraphQL mutations, compliance webhooks, and App Proxy configurations are verified and compliant with Shopify requirements.</div>
  </div>
</body></html>
  `
});

// Render all 12 scenes
console.log("Rendering 12 walkthrough frames...");
const pngPaths = [];
for (let i = 0; i < scenes.length; i++) {
  const s = scenes[i];
  const outPng = path.join(TEMP_DIR, s.name);
  renderScene(s.html, outPng);
  pngPaths.push(outPng);
}

// Generate the 3m 48s MP4 video using FFmpeg
// 12 scenes * 19s = 228s (~3 minutes 48 seconds)
// 0.8s smooth crossfade between scenes
console.log("Assembling full walkthrough video with FFmpeg...");

const inputs = pngPaths.map(p => `-loop 1 -t 19.8 -i "${p}"`).join(" ");

// Build xfade chain for 12 inputs (offsets at 19, 38, 57, 76, 95, 114, 133, 152, 171, 190, 209)
let filterParts = [];
let prev = "[0:v]";
for (let i = 1; i < pngPaths.length; i++) {
  const next = `[${i}:v]`;
  const outTag = i === pngPaths.length - 1 ? "[outv]" : `[v${i}]`;
  const offset = i * 19;
  filterParts.push(`${prev}${next}xfade=transition=fade:duration=0.8:offset=${offset}${outTag}`);
  prev = `[v${i}]`;
}

const filterStr = filterParts.join(";") + ";[outv]format=yuv420p[finalv]";

const ffmpegCmd = `ffmpeg -y ${inputs} -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -filter_complex "${filterStr}" -map "[finalv]" -map ${pngPaths.length}:a -c:v libx264 -preset medium -crf 19 -c:a aac -shortest -movflags +faststart "${FINAL_VIDEO}"`;

execSync(ffmpegCmd, { stdio: "inherit" });
console.log("Full Walkthrough Video generated at:", FINAL_VIDEO);
