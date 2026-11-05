(function () {
  function initSmartCancel() {
    const root = document.querySelector(".smartcancel-container");
    if (!root) return;

    const orderId = root.getAttribute("data-order-id");
    const orderName = root.getAttribute("data-order-name");
    const customerEmail = root.getAttribute("data-customer-email");

    if (!orderId) return;

    const badgeElem = root.querySelector(".smartcancel-badge");
    const actionsElem = root.querySelector(".smartcancel-actions");
    const cancelModal = document.getElementById("smartcancel-cancel-modal");
    const addressModal = document.getElementById("smartcancel-address-modal");

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
        setInputValue("smartcancel-addr1", data.shippingAddress.address1);
        setInputValue("smartcancel-addr2", data.shippingAddress.address2);
        setInputValue("smartcancel-city", data.shippingAddress.city);
        setInputValue("smartcancel-zip", data.shippingAddress.zip);
        setInputValue("smartcancel-province", data.shippingAddress.province);
        setInputValue("smartcancel-country", data.shippingAddress.country);
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

    function setInputValue(id, val) {
      const el = document.getElementById(id);
      if (el && val) el.value = val;
    }

    // Modal Triggers
    window.openSmartCancelModal = function () {
      if (cancelModal) cancelModal.classList.add("active");
    };

    window.closeSmartCancelModal = function () {
      if (cancelModal) cancelModal.classList.remove("active");
    };

    window.openSmartAddressModal = function () {
      if (addressModal) addressModal.classList.add("active");
    };

    window.closeSmartAddressModal = function () {
      if (addressModal) addressModal.classList.remove("active");
    };

    // Confirm Cancellation Action
    window.confirmOrderCancellation = function () {
      const btn = document.getElementById("smartcancel-submit-cancel-btn");
      const reasonSelect = document.getElementById("smartcancel-reason-select");
      const reason = reasonSelect ? reasonSelect.value : "Customer cancelled";

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

    // Confirm Shipping Address Update Action
    window.confirmAddressUpdate = function () {
      const btn = document.getElementById("smartcancel-submit-address-btn");
      const shippingAddress = {
        address1: document.getElementById("smartcancel-addr1")?.value || "",
        address2: document.getElementById("smartcancel-addr2")?.value || "",
        city: document.getElementById("smartcancel-city")?.value || "",
        zip: document.getElementById("smartcancel-zip")?.value || "",
        province: document.getElementById("smartcancel-province")?.value || "",
        country: document.getElementById("smartcancel-country")?.value || "",
      };

      if (!shippingAddress.address1 || !shippingAddress.city || !shippingAddress.zip) {
        alert("Please fill in Street Address, City, and Postal/ZIP code.");
        return;
      }

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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSmartCancel);
  } else {
    initSmartCancel();
  }
})();
