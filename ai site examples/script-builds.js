/* script-builds.js - Custom Builds page logic */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  createPageNavigator('builds.html');
  initCapReveal();
  initGlitchEffect();
});

/* Staggered reveal for capability cards */
function initCapReveal() {
  const aCards = document.querySelectorAll('.cap-card');

  const oObserver = new IntersectionObserver((aEntries) => {
    aEntries.forEach((oEntry) => {
      if (oEntry.isIntersecting) {
        oEntry.target.style.opacity = '1';
        oEntry.target.style.transform = 'translateY(0)';
        oObserver.unobserve(oEntry.target);
      }
    });
  }, { threshold: 0.1 });

  aCards.forEach((eCard, iIndex) => {
    eCard.style.opacity = '0';
    eCard.style.transform = 'translateY(24px)';
    eCard.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ' + (iIndex * 0.08) + 's, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ' + (iIndex * 0.08) + 's';
    oObserver.observe(eCard);
  });
}

/* Subtle glitch effect on hero title */
function initGlitchEffect() {
  const eTitle = document.querySelector('.build-hero h1');
  if (!eTitle) return;

  setInterval(() => {
    const bShouldGlitch = Math.random() > 0.92;
    if (bShouldGlitch) {
      eTitle.style.textShadow = '2px 0 #ff2d7b, -2px 0 #00eaff';
      setTimeout(() => {
        eTitle.style.textShadow = '';
      }, 80);
    }
  }, 2000);
}
