/* script-consultancy.js - Consultancy page logic */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  createPageNavigator('consultancy.html');
  initProcessReveal();
  initExpertiseReveal();
  initCardHover();
});

/* Reveal process steps on scroll */
function initProcessReveal() {
  const aSteps = document.querySelectorAll('.process-step');

  const oObserver = new IntersectionObserver((aEntries) => {
    aEntries.forEach((oEntry) => {
      if (oEntry.isIntersecting) {
        oEntry.target.style.opacity = '1';
        oEntry.target.style.transform = 'translateY(0)';
        oObserver.unobserve(oEntry.target);
      }
    });
  }, { threshold: 0.2 });

  aSteps.forEach((eStep, iIndex) => {
    eStep.style.opacity = '0';
    eStep.style.transform = 'translateY(24px)';
    eStep.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ' + (iIndex * 0.12) + 's, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ' + (iIndex * 0.12) + 's';
    oObserver.observe(eStep);
  });
}

/* Reveal expertise items on scroll */
function initExpertiseReveal() {
  const aItems = document.querySelectorAll('.expertise-item');

  const oObserver = new IntersectionObserver((aEntries) => {
    aEntries.forEach((oEntry) => {
      if (oEntry.isIntersecting) {
        oEntry.target.style.opacity = '1';
        oEntry.target.style.transform = 'translateY(0)';
        oObserver.unobserve(oEntry.target);
      }
    });
  }, { threshold: 0.1 });

  aItems.forEach((eItem, iIndex) => {
    eItem.style.opacity = '0';
    eItem.style.transform = 'translateY(20px)';
    eItem.style.transition = 'opacity 0.5s ease ' + (iIndex * 0.08) + 's, transform 0.5s ease ' + (iIndex * 0.08) + 's';
    oObserver.observe(eItem);
  });
}

/* Stacked card subtle hover parallax */
function initCardHover() {
  const eVisual = document.querySelector('.con-hero-visual');
  if (!eVisual) return;

  const aCards = eVisual.querySelectorAll('.hero-stack-card');

  eVisual.addEventListener('mousemove', (oEvent) => {
    const oRect = eVisual.getBoundingClientRect();
    const iX = (oEvent.clientX - oRect.left) / oRect.width - 0.5;
    const iY = (oEvent.clientY - oRect.top) / oRect.height - 0.5;

    aCards.forEach((eCard, iIndex) => {
      const iIntensity = (iIndex + 1) * 4;
      eCard.style.transform = 'rotate(' + (-3 + iIndex * 3.5) + 'deg) translate(' + (iX * iIntensity) + 'px, ' + (iY * iIntensity) + 'px)';
    });
  });

  eVisual.addEventListener('mouseleave', () => {
    aCards.forEach((eCard, iIndex) => {
      eCard.style.transition = 'transform 0.5s ease';
      eCard.style.transform = 'rotate(' + (-3 + iIndex * 3.5) + 'deg)';
      setTimeout(() => {
        eCard.style.transition = '';
      }, 500);
    });
  });
}
