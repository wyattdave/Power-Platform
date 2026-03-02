/* script-contact.js - Contact page logic */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  createPageNavigator('contact.html');
  initFormHandling();
  initInfoReveal();
});

/* Form submission handling */
function initFormHandling() {
  const eForm = document.getElementById('contactForm');
  if (!eForm) return;

  eForm.addEventListener('submit', (oEvent) => {
    oEvent.preventDefault();

    const bIsValid = validateForm(eForm);
    if (!bIsValid) return;

    const eButton = eForm.querySelector('.btn-copper');
    const sOriginalText = eButton.textContent;

    eButton.textContent = 'Sending...';
    eButton.disabled = true;
    eButton.style.opacity = '0.7';

    /* Simulate send - replace with real endpoint */
    setTimeout(() => {
      eButton.textContent = 'Message Sent ✓';
      eButton.style.background = '#4a8c5c';
      eButton.style.opacity = '1';

      setTimeout(() => {
        eForm.reset();
        eButton.textContent = sOriginalText;
        eButton.style.background = '';
        eButton.disabled = false;
      }, 3000);
    }, 1500);
  });
}

/* Basic form validation */
function validateForm(eForm) {
  const aRequired = eForm.querySelectorAll('[required]');
  let bValid = true;

  aRequired.forEach((eField) => {
    clearFieldError(eField);

    if (!eField.value.trim()) {
      showFieldError(eField, 'This field is required');
      bValid = false;
    } else if (eField.type === 'email' && !isValidEmail(eField.value)) {
      showFieldError(eField, 'Please enter a valid email');
      bValid = false;
    }
  });

  return bValid;
}

function isValidEmail(sEmail) {
  const oPattern = new RegExp('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');
  return oPattern.test(sEmail);
}

function showFieldError(eField, sMessage) {
  eField.style.borderColor = '#c44a4a';

  const eError = document.createElement('span');
  eError.className = 'field-error';
  eError.textContent = sMessage;
  eError.style.cssText = 'color:#c44a4a;font-size:12px;margin-top:4px;display:block;';

  eField.parentElement.appendChild(eError);
}

function clearFieldError(eField) {
  eField.style.borderColor = '';
  const eExisting = eField.parentElement.querySelector('.field-error');
  if (eExisting) {
    eExisting.remove();
  }
}

/* Reveal info cards */
function initInfoReveal() {
  const aCards = document.querySelectorAll('.contact-info-card');

  const oObserver = new IntersectionObserver((aEntries) => {
    aEntries.forEach((oEntry) => {
      if (oEntry.isIntersecting) {
        oEntry.target.style.opacity = '1';
        oEntry.target.style.transform = 'translateY(0)';
        oObserver.unobserve(oEntry.target);
      }
    });
  }, { threshold: 0.2 });

  aCards.forEach((eCard, iIndex) => {
    eCard.style.opacity = '0';
    eCard.style.transform = 'translateY(20px)';
    eCard.style.transition = 'opacity 0.6s ease ' + (iIndex * 0.12) + 's, transform 0.6s ease ' + (iIndex * 0.12) + 's';
    oObserver.observe(eCard);
  });
}
