/* script-home.js - Home page logic */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  createPageNavigator('index.html');
  initScrollReveal();
  initStatCounters();
});

/* Scroll reveal for services and stats */
function initScrollReveal() {
  const aElements = document.querySelectorAll('.service-card, .services-section .section-label, .services-section .section-title');

  const oObserver = new IntersectionObserver((aEntries) => {
    aEntries.forEach((oEntry) => {
      if (oEntry.isIntersecting) {
        oEntry.target.style.opacity = '1';
        oEntry.target.style.transform = 'translateY(0)';
        oObserver.unobserve(oEntry.target);
      }
    });
  }, { threshold: 0.15 });

  aElements.forEach((eEl) => {
    eEl.style.opacity = '0';
    eEl.style.transform = 'translateY(30px)';
    eEl.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
    oObserver.observe(eEl);
  });
}

/* Animate stat numbers counting up */
function initStatCounters() {
  const aStats = document.querySelectorAll('.stat-number');

  const oObserver = new IntersectionObserver((aEntries) => {
    aEntries.forEach((oEntry) => {
      if (oEntry.isIntersecting) {
        animateCounter(oEntry.target);
        oObserver.unobserve(oEntry.target);
      }
    });
  }, { threshold: 0.5 });

  aStats.forEach((eStat) => {
    oObserver.observe(eStat);
  });
}

function animateCounter(eElement) {
  const sText = eElement.textContent;
  const iTarget = parseInt(sText, 10);
  const sSuffix = sText.replace(String(iTarget), '');

  if (isNaN(iTarget)) return;

  let iCurrent = 0;
  const iDuration = 1200;
  const iStart = performance.now();

  function step(iTimestamp) {
    const iProgress = Math.min((iTimestamp - iStart) / iDuration, 1);
    const iEased = 1 - Math.pow(1 - iProgress, 3);
    iCurrent = Math.floor(iEased * iTarget);
    eElement.textContent = iCurrent + sSuffix;

    if (iProgress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}
