(function () {
  function getModal(id) {
    return document.getElementById(id);
  }

  // Globally available modal opener/closer functions
  window.openSmartCancelModal = function () {
    const modal = getModal("smartcancel-cancel-modal");
    if (modal) modal.classList.add("active");
  };

  window.closeSmartCancelModal = function () {
    const modal = getModal("smartcancel-cancel-modal");
    if (modal) modal.classList.remove("active");
  };

  window.openSmartAddressModal = function () {
    const modal = getModal("smartcancel-address-modal");
    if (modal) modal.classList.add("active");
  };

  window.closeSmartAddressModal = function () {
    const modal = getModal("smartcancel-address-modal");
    if (modal) modal.classList.remove("active");
  };

  window.confirmOrderCancellation = function () {
    const root = document.querySelector(".smartcancel-container");
    const orderId = root?.getAttribute("data-order-id");
    const orderName = root?.getAttribute("data-order-name");
    const customerEmail = root?.getAttribute("data-customer-email");
    const reasonSelect = document.getElementById("smartcancel-reason-select");
    const reason = reasonSelect ? reasonSelect.value : "Customer cancelled";

    // Demo Mode Handling (inside Theme Editor preview or test pages without an order)
    if (!orderId) {
      alert("✅ [Demo Preview Mode] Order cancellation simulated successfully!\n\nOn live customer orders, this immediately cancels the order, restocks inventory, and processes refund via Shopify Admin API.");
      window.closeSmartCancelModal();
      return;
    }

    const btn =
      document.getElementById("smartcancel-confirm-cancel-btn") ||
      document.getElementById("smartcancel-submit-cancel-btn");
    if (btn) {
      btn.disabled = true;
      btn.innerText = "Processing Cancellation...";
    }

    fetch("/apps/smartcancel/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        orderName,
        customerEmail,
        reason,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          alert("Your order has been successfully cancelled and refunded.");
          window.location.reload();
        } else {
          alert("Cancellation failed: " + (res.error || "Please contact store support."));
          if (btn) {
            btn.disabled = false;
            btn.innerText = "Confirm Cancellation";
          }
        }
      })
      .catch((err) => {
        alert("Error processing cancellation. Please contact support.");
        if (btn) {
          btn.disabled = false;
          btn.innerText = "Confirm Cancellation";
        }
      });
  };

  window.confirmCancellation = window.confirmOrderCancellation;

  window.confirmAddressUpdate = function () {
    const root = document.querySelector(".smartcancel-container");
    const orderId = root?.getAttribute("data-order-id");
    const orderName = root?.getAttribute("data-order-name");
    const customerEmail = root?.getAttribute("data-customer-email");

    const getVal = (id1, id2) =>
      document.getElementById(id1)?.value ||
      document.getElementById(id2)?.value ||
      "";

    const shippingAddress = {
      name: getVal("smartcancel-addr-name", "smartcancel-name"),
      address1: getVal("smartcancel-addr-1", "smartcancel-addr1"),
      address2: getVal("smartcancel-addr-2", "smartcancel-addr2"),
      city: getVal("smartcancel-addr-city", "smartcancel-city"),
      zip: getVal("smartcancel-addr-zip", "smartcancel-zip"),
      province: getVal("smartcancel-addr-province", "smartcancel-province"),
      country: getVal("smartcancel-addr-country", "smartcancel-country"),
    };

    if (!shippingAddress.address1 || !shippingAddress.city || !shippingAddress.zip) {
      alert("Please fill in Street Address, City, and Postal/ZIP code.");
      return;
    }

    // Demo Mode Handling (inside Theme Editor preview or test pages without an order)
    if (!orderId) {
      alert("✅ [Demo Preview Mode] Shipping address updated successfully!\n\nOn live customer orders, this immediately updates the shipping address in Shopify.");
      window.closeSmartAddressModal();
      return;
    }

    const btn = document.getElementById("smartcancel-submit-address-btn");
    if (btn) {
      btn.disabled = true;
      btn.innerText = "Updating Address...";
    }

    fetch("/apps/smartcancel/edit-address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        orderName,
        customerEmail,
        shippingAddress,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          alert("Your shipping address has been updated successfully!");
          window.location.reload();
        } else {
          alert("Failed to update address: " + (res.error || "Please contact support."));
          if (btn) {
            btn.disabled = false;
            btn.innerText = "Save New Address";
          }
        }
      })
      .catch((err) => {
        alert("Error updating address. Please contact store support.");
        if (btn) {
          btn.disabled = false;
          btn.innerText = "Save New Address";
        }
      });
  };

  function initSmartCancel() {
    const root = document.querySelector(".smartcancel-container");
    if (!root) return;

    const orderId = root.getAttribute("data-order-id");
    if (!orderId) return;

    // Fetch eligibility from App Proxy
    fetch(`/apps/smartcancel/eligibility?order_id=${encodeURIComponent(orderId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.warn("[SmartCancel]", data.error);
          return;
        }
        renderPortal(data);
      })
      .catch((err) => {
        console.error("[SmartCancel] Failed to load eligibility:", err);
      });

    function renderPortal(data) {
      const badgeElem = root.querySelector(".smartcancel-badge");
      const actionsElem = root.querySelector(".smartcancel-actions");

      if (!data.eligibleForCancel && !data.eligibleForAddressEdit) {
        if (badgeElem) {
          badgeElem.className = "smartcancel-badge expired";
          badgeElem.innerHTML = data.cancelDisabledReason || "Self-service window closed";
        }
        if (actionsElem) actionsElem.style.display = "none";
        return;
      }

      // Update remaining time countdown
      if (data.remainingMinutes > 0 && badgeElem) {
        badgeElem.className =
          data.remainingMinutes <= 15
            ? "smartcancel-badge warning"
            : "smartcancel-badge";
        badgeElem.innerHTML = `
          <span class="smartcancel-pulse"></span>
          <span>${data.remainingMinutes} minutes left to edit or cancel</span>
        `;
      }

      // Populate cancellation survey reasons
      const reasonSelect = document.getElementById("smartcancel-reason-select");
      if (reasonSelect && data.reasons) {
        reasonSelect.innerHTML = data.reasons
          .map((r) => `<option value="${r}">${r}</option>`)
          .join("");
      }

      // Show/hide retention offer
      const retentionBanner = document.getElementById("smartcancel-retention-banner");
      if (retentionBanner) {
        if (data.retentionOffer && data.retentionOffer.enabled) {
          retentionBanner.style.display = "block";
          const codeElem = document.getElementById("smartcancel-retention-code");
          if (codeElem) codeElem.innerText = data.retentionOffer.code;
        } else {
          retentionBanner.style.display = "none";
        }
      }

      // Populate current shipping address in modal
      if (data.shippingAddress) {
        const setVal = (id, v) => {
          const el = document.getElementById(id);
          if (el && v) el.value = v;
        };
        setVal("smartcancel-addr-1", data.shippingAddress.address1);
        setVal("smartcancel-addr1", data.shippingAddress.address1);
        setVal("smartcancel-addr-2", data.shippingAddress.address2);
        setVal("smartcancel-addr2", data.shippingAddress.address2);
        setVal("smartcancel-addr-city", data.shippingAddress.city);
        setVal("smartcancel-city", data.shippingAddress.city);
        setVal("smartcancel-addr-zip", data.shippingAddress.zip);
        setVal("smartcancel-zip", data.shippingAddress.zip);
        setVal("smartcancel-addr-province", data.shippingAddress.province);
        setVal("smartcancel-province", data.shippingAddress.province);
        setVal("smartcancel-addr-country", data.shippingAddress.country);
        setVal("smartcancel-country", data.shippingAddress.country);
      }

      // Toggle button visibilities
      const cancelBtn = document.getElementById("smartcancel-open-cancel-btn");
      if (cancelBtn) {
        cancelBtn.style.display = data.eligibleForCancel ? "inline-flex" : "none";
      }

      const editBtn = document.getElementById("smartcancel-open-address-btn");
      if (editBtn) {
        editBtn.style.display = data.eligibleForAddressEdit ? "inline-flex" : "none";
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSmartCancel);
  } else {
    initSmartCancel();
  }
})();
