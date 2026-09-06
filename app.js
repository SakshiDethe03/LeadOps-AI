/**
 * LeadOps AI - CRM Lead Generation Frontend Application
 * Handles form validation, dispatch to Make.com Webhook, 
 * and handles pure success/error confirmation view toggles.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM View Panels
  const viewForm = document.getElementById('view-form');
  const viewLoading = document.getElementById('view-loading');
  const viewSuccess = document.getElementById('view-success');
  const viewError = document.getElementById('view-error');

  // DOM Header Status Elements
  const modeBadge = document.getElementById('mode-badge');
  const modeDot = document.getElementById('mode-dot');
  const modeText = document.getElementById('mode-text');

  // DOM Elements
  const leadForm = document.getElementById('lead-form');
  const inputName = document.getElementById('lead-name');
  const inputEmail = document.getElementById('lead-email');
  const inputCompany = document.getElementById('lead-company');
  const inputRequirement = document.getElementById('lead-requirement');
  const emailSampleHint = document.getElementById('email-sample-hint');
  const emailInputWrapper = document.getElementById('email-input-wrapper');

  const btnSubmit = document.getElementById('btn-submit');
  const btnSample = document.getElementById('btn-sample');
  const btnReset = document.getElementById('btn-reset');
  const btnRetry = document.getElementById('btn-retry');

  let SAMPLE_EMAIL = "demo@example.com";
  let isSampleLoaded = false;

  // Initialize Header Status Badge State
  setModeBadgeState('ready');

  // Dynamic Header Status Badge Controller
  function setModeBadgeState(state) {
    if (!modeBadge || !modeText) return;

    modeBadge.className = 'mode-badge';

    if (state === 'ready') {
      modeBadge.classList.add('ready-mode');
      if (modeDot) {
        modeDot.textContent = '';
        modeDot.style.display = 'inline-block';
      }
      modeText.textContent = "Make.com Workflow Connected";
    } else if (state === 'processing') {
      modeBadge.classList.add('processing-mode');
      if (modeDot) {
        modeDot.textContent = '';
        modeDot.style.display = 'inline-block';
      }
      modeText.textContent = "Processing with Make.com";
    } else if (state === 'completed') {
      modeBadge.classList.add('completed-mode');
      if (modeDot) {
        modeDot.textContent = '✓';
        modeDot.style.display = 'inline';
      }
      modeText.textContent = "Make.com Workflow Completed";
    } else if (state === 'error') {
      modeBadge.classList.add('error-mode');
      if (modeDot) {
        modeDot.textContent = '';
        modeDot.style.display = 'inline-block';
      }
      modeText.textContent = "Make.com Connection Error";
    }
  }

  // Quick Sample Lead Filler (⚡ Try Sample Lead)
  btnSample.addEventListener('click', () => {
    inputName.value = "Sarah Jenkins";
    inputEmail.value = SAMPLE_EMAIL;
    inputCompany.value = "Enterprise Tech Solutions";
    inputRequirement.value = "We need an AI CRM lead qualification pipeline for our 45-person sales team. We handle 3,000+ monthly inbound leads and require instant lead scoring, priority tagging, and automated email draft generation.";

    isSampleLoaded = true;
    clearValidationErrors();
    updateEmailSampleHint();
    showToast("Sample lead data loaded!");
  });

  // Real-time Input Error Reset & Email Hint Update
  [inputName, inputEmail, inputCompany, inputRequirement].forEach(input => {
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (group) group.classList.remove('has-error');

      if (input === inputEmail && isSampleLoaded) {
        updateEmailSampleHint();
      }
    });
  });

  function updateEmailSampleHint() {
    if (!emailSampleHint) return;

    const currentVal = inputEmail.value.trim();

    if (!isSampleLoaded) {
      emailSampleHint.style.display = 'none';
      if (emailInputWrapper) emailInputWrapper.classList.remove('highlight-email');
      return;
    }

    if (currentVal === SAMPLE_EMAIL) {
      emailSampleHint.className = 'info-hint demo-notice';
      emailSampleHint.innerHTML = `
        <span style="font-size: 1.1rem; line-height: 1;">💡</span>
        <div>
          <strong style="display: block; margin-bottom: 2px;">Demo data loaded</strong>
          <span>Replace the sample email with your own email address to receive the actual follow-up email.</span>
        </div>
      `;
      emailSampleHint.style.display = 'flex';
      if (emailInputWrapper) emailInputWrapper.classList.add('highlight-email');
    } else if (currentVal.length > 0) {
      emailSampleHint.className = 'info-hint user-notice';
      emailSampleHint.innerHTML = `
        <span style="font-weight: 700; line-height: 1;">✓</span>
        <div>
          <strong>Using your email</strong> — you'll receive the follow-up email.
        </div>
      `;
      emailSampleHint.style.display = 'flex';
      if (emailInputWrapper) emailInputWrapper.classList.remove('highlight-email');
    } else {
      emailSampleHint.style.display = 'none';
      if (emailInputWrapper) emailInputWrapper.classList.remove('highlight-email');
    }
  }

  // Form Submit Handler
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      name: inputName.value.trim(),
      email: inputEmail.value.trim(),
      company: inputCompany.value.trim(),
      requirement: inputRequirement.value.trim()
    };

    // Step 1: Disable submit button & update status badge to "Processing with Make.com"
    btnSubmit.disabled = true;
    setModeBadgeState('processing');
    showView('loading');

    try {
      if (!CONFIG.MAKE_WEBHOOK_URL || CONFIG.MAKE_WEBHOOK_URL === "YOUR_MAKE_WEBHOOK_URL") {
        throw new Error("Make.com Webhook URL is not configured in config.js");
      }

      // Step 2: Send POST request to Make.com Webhook
      const response = await fetch(CONFIG.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Step 3: Check for 2xx HTTP success response
      if (response.ok) {
        setModeBadgeState('completed');
        showView('success');
      } else {
        throw new Error(`Webhook returned HTTP error ${response.status}`);
      }

    } catch (err) {
      console.error("Lead submission error:", err);
      setModeBadgeState('error');
      showView('error');
    } finally {
      btnSubmit.disabled = false;
    }
  });

  // Reset Button ("Submit Another Request")
  btnReset.addEventListener('click', () => {
    leadForm.reset();
    isSampleLoaded = false;
    updateEmailSampleHint();
    clearValidationErrors();
    setModeBadgeState('ready');
    showView('form');
  });

  // Retry Button ("Try Again")
  btnRetry.addEventListener('click', () => {
    setModeBadgeState('ready');
    showView('form');
  });

  // Helper: Switch Active Panel View
  function showView(viewName) {
    viewForm.style.display = 'none';
    viewLoading.style.display = 'none';
    viewSuccess.style.display = 'none';
    viewError.style.display = 'none';

    if (viewName === 'form') {
      viewForm.style.display = 'block';
    } else if (viewName === 'loading') {
      viewLoading.style.display = 'flex';
    } else if (viewName === 'success') {
      viewSuccess.style.display = 'flex';
    } else if (viewName === 'error') {
      viewError.style.display = 'flex';
    }
  }

  // Form Validation Logic
  function validateForm() {
    clearValidationErrors();
    let isValid = true;

    // Name Validation
    if (!inputName.value.trim()) {
      showFieldError('group-name');
      isValid = false;
    }

    // Email Validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!inputEmail.value.trim() || !emailPattern.test(inputEmail.value.trim())) {
      showFieldError('group-email');
      isValid = false;
    }

    // Company Validation
    if (!inputCompany.value.trim()) {
      showFieldError('group-company');
      isValid = false;
    }

    // Requirement Validation
    if (!inputRequirement.value.trim()) {
      showFieldError('group-requirement');
      isValid = false;
    }

    return isValid;
  }

  function showFieldError(groupId) {
    const grp = document.getElementById(groupId);
    if (grp) grp.classList.add('has-error');
  }

  function clearValidationErrors() {
    document.querySelectorAll('.form-group').forEach(grp => grp.classList.remove('has-error'));
  }

  // Toast System
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, match => {
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
      return map[match];
    });
  }
});
