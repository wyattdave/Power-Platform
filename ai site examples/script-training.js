/* script-training.js - Training page logic */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  createPageNavigator('training.html');
  initCardReveal();
});

/* Staggered reveal of course cards */
function initCardReveal() {
  const aCards = document.querySelectorAll('.course-card');

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
    eCard.style.transform = 'translateY(30px)';
    eCard.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ' + (iIndex * 0.1) + 's, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ' + (iIndex * 0.1) + 's';
    oObserver.observe(eCard);
  });
}
