document.addEventListener('DOMContentLoaded', function() {
  // Get all tab buttons
  const tabButtons = document.querySelectorAll('.form-tab');
  const tabContents = document.querySelectorAll('.form-content');
  
  // Add click event listener to each tab button
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Show the corresponding content
      const contentId = button.getAttribute('data-tab');
      document.getElementById(contentId).classList.add('active');
    });
  });

  // Luhn algorithm for card validation
  function isValidCardNumber(number) {
    number = number.replace(/\D/g, '');
    let sum = 0, shouldDouble = false;
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return number.length >= 13 && number.length <= 19 && (sum % 10 === 0);
  }

  function isValidExpiry(expiry) {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [mm, yy] = expiry.split('/').map(Number);
    if (mm < 1 || mm > 12) return false;
    const now = new Date();
    const year = 2000 + yy;
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth() + 1;
    return (year > thisYear) || (year === thisYear && mm >= thisMonth);
  }

  function isValidCVC(cvc) {
    return /^\d{3,4}$/.test(cvc);
  }

  // Confirmation modal for donation card info
  function createCardModal() {
    if (document.getElementById('card-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'card-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';

    modal.innerHTML = `
      <div style="background:#fff;padding:30px 25px 20px 25px;border-radius:8px;max-width:350px;width:100%;box-shadow:0 4px 16px rgba(0,0,0,0.15);position:relative;">
        <h3 style="margin-top:0;">Enter Card Information</h3>
        <div style="font-size:0.98em;color:#555;margin-bottom:10px;">
          <ul style="padding-left:18px;margin:0 0 10px 0;">
            <li>No spaces for the card number.</li>
          </ul>
        </div>
        <form id="card-form" autocomplete="off">
          <label for="card-number">Card Number:</label><br>
          <input type="text" id="card-number" name="card-number" maxlength="19" required style="width:100%;margin-bottom:10px;" inputmode="numeric" pattern="[0-9]*" autocomplete="cc-number"><br>
          <label for="card-expiry">Expiry (MM/YY):</label><br>
          <div style="position:relative;width:100%;">
            <input type="text" id="card-expiry" name="card-expiry" maxlength="5" required
              style="width:100%;margin-bottom:10px;padding-left:38px;letter-spacing:1px;color:#222;background:transparent;box-sizing:border-box;"
              placeholder="" inputmode="numeric" pattern="[0-9/]*" autocomplete="cc-exp">
            <span id="expiry-placeholder" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;font-size:1em;">
              <span style="color:#aaa;">MM</span><span style="color:#000;">/</span><span style="color:#aaa;">YY</span>
            </span>
          </div>
          <label for="card-cvc">CVC:</label><br>
          <input type="text" id="card-cvc" name="card-cvc" maxlength="4" required style="width:100%;margin-bottom:15px;" inputmode="numeric" pattern="[0-9]*" autocomplete="cc-csc"><br>
          <div id="card-error" style="color:#d32f2f;font-size:0.95em;margin-bottom:10px;display:none;"></div>
          <button type="submit" style="width:100%;">Submit Payment</button>
        </form>
        <button id="close-card-modal" style="position:absolute;top:10px;right:10px;background:none;border:none;font-size:1.2em;cursor:pointer;">&times;</button>
      </div>
    `;
    document.body.appendChild(modal);

    // MM/YY input logic
    const expiryInput = modal.querySelector('#card-expiry');
    const expiryPlaceholder = modal.querySelector('#expiry-placeholder');
    expiryInput.addEventListener('input', function(e) {
      // Only allow numbers and auto-insert slash
      let v = expiryInput.value.replace(/[^0-9]/g, '');
      if (v.length > 4) v = v.slice(0, 4);
      if (v.length >= 3) {
        expiryInput.value = v.slice(0,2) + '/' + v.slice(2);
      } else {
        expiryInput.value = v;
      }
      // Hide placeholder if user types
      expiryPlaceholder.style.display = expiryInput.value.length ? 'none' : 'block';
    });
    expiryInput.addEventListener('focus', function() {
      expiryPlaceholder.style.display = expiryInput.value.length ? 'none' : 'block';
    });
    expiryInput.addEventListener('blur', function() {
      expiryPlaceholder.style.display = expiryInput.value.length ? 'none' : 'block';
    });
    // Prevent non-numeric input
    expiryInput.addEventListener('keydown', function(e) {
      if (
        !(
          (e.key >= '0' && e.key <= '9') ||
          e.key === 'Backspace' ||
          e.key === 'Delete' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight' ||
          e.key === 'Tab'
        )
      ) {
        e.preventDefault();
      }
    });

    // Prevent spaces and non-numeric in card number
    const cardNumberInput = modal.querySelector('#card-number');
    cardNumberInput.addEventListener('input', function(e) {
      cardNumberInput.value = cardNumberInput.value.replace(/\D/g, '');
    });
    cardNumberInput.addEventListener('keydown', function(e) {
      if (
        !(
          (e.key >= '0' && e.key <= '9') ||
          e.key === 'Backspace' ||
          e.key === 'Delete' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight' ||
          e.key === 'Tab'
        )
      ) {
        e.preventDefault();
      }
    });

    // Prevent non-numeric in CVC
    const cvcInput = modal.querySelector('#card-cvc');
    cvcInput.addEventListener('input', function(e) {
      cvcInput.value = cvcInput.value.replace(/\D/g, '');
    });
    cvcInput.addEventListener('keydown', function(e) {
      if (
        !(
          (e.key >= '0' && e.key <= '9') ||
          e.key === 'Backspace' ||
          e.key === 'Delete' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight' ||
          e.key === 'Tab'
        )
      ) {
        e.preventDefault();
      }
    });

    document.getElementById('close-card-modal').onclick = function() {
      modal.remove();
    };

    document.getElementById('card-form').onsubmit = function(e) {
      e.preventDefault();
      const number = document.getElementById('card-number').value.trim();
      const expiry = document.getElementById('card-expiry').value.trim();
      const cvc = document.getElementById('card-cvc').value.trim();
      const errorDiv = document.getElementById('card-error');
      errorDiv.style.display = 'none';

      if (!isValidCardNumber(number)) {
        errorDiv.textContent = 'Please enter a valid card number.';
        errorDiv.style.display = 'block';
        return;
      }
      if (!isValidExpiry(expiry)) {
        errorDiv.textContent = 'Please enter a valid expiry date (MM/YY).';
        errorDiv.style.display = 'block';
        return;
      }
      if (!isValidCVC(cvc)) {
        errorDiv.textContent = 'Please enter a valid CVC (3 or 4 digits).';
        errorDiv.style.display = 'block';
        return;
      }
      modal.remove();
      showSuccess('Thank you for your donation! Your payment was received.');
    };
  }

  // Show success/confirmation message
  function showSuccess(message) {
    // Remove any existing
    let prev = document.getElementById('form-success-message');
    if (prev) prev.remove();
    const msg = document.createElement('div');
    msg.id = 'form-success-message';
    msg.style.background = '#e6ffe6';
    msg.style.color = '#256029';
    msg.style.border = '1px solid #b2e6b2';
    msg.style.padding = '15px';
    msg.style.margin = '15px 0';
    msg.style.borderRadius = '6px';
    msg.style.textAlign = 'center';
    msg.style.fontWeight = '600';
    msg.textContent = message;
    // Insert after the forms-container or donation-section
    let container = document.querySelector('.forms-container') || document.querySelector('.donation-section');
    if (container) container.parentNode.insertBefore(msg, container.nextSibling);
    setTimeout(() => { msg.remove(); }, 5000);
  }

  // Attach handlers to forms
  document.querySelectorAll('.form-content form').forEach(form => {
    form.onsubmit = function(e) {
      e.preventDefault();
      // Donation form
      if (form.closest('#donate-form')) {
        createCardModal();
      }
      // Volunteer form
      if (form.closest('#volunteer-form')) {
        // Validation
        const name = form.querySelector('[name="name"]')?.value.trim();
        const email = form.querySelector('[name="email"]')?.value.trim();
        const phone = form.querySelector('[name="phone"]')?.value.trim();
        const interest = form.querySelector('[name="interest"]')?.value;
        const avail = form.querySelector('[name="availability"]')?.value.trim();
        let error = '';
        if (!name) error = 'Name is required.';
        else if (!email && !phone) error = 'Please provide at least an email or phone number.';
        else if (!interest) error = 'Please select an area of interest.';
        else if (!avail) error = 'Please provide your availability.';
        if (error) {
          let prev = form.querySelector('.form-error-message');
          if (!prev) {
            prev = document.createElement('div');
            prev.className = 'form-error-message';
            prev.style.color = '#d32f2f';
            prev.style.marginBottom = '10px';
            form.insertBefore(prev, form.firstChild);
          }
          prev.textContent = error;
          return;
        } else {
          let prev = form.querySelector('.form-error-message');
          if (prev) prev.remove();
        }
        showSuccess('Thank you for signing up to volunteer! We will contact you soon.');
        form.reset();
      }
    };
  });
});
