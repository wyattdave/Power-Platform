/* nav.js - Page navigator component */
function createPageNavigator(sActivePage) {
  const aPages = [
    { sName: 'Home', sHref: 'index.html' },
    { sName: 'Training', sHref: 'training.html' },
    { sName: 'Consultancy', sHref: 'consultancy.html' },
    { sName: 'Custom Builds', sHref: 'builds.html' },
    { sName: 'Contact', sHref: 'contact.html' }
  ];

  const eNav = document.createElement('nav');
  eNav.className = 'page-navigator';
  eNav.setAttribute('aria-label', 'Page navigation');

  aPages.forEach((oPage, iIndex) => {
    if (iIndex > 0) {
      const eDivider = document.createElement('span');
      eDivider.className = 'page-nav-divider';
      eDivider.setAttribute('aria-hidden', 'true');
      eNav.appendChild(eDivider);
    }

    const eLink = document.createElement('a');
    eLink.className = 'page-nav-link';
    eLink.href = oPage.sHref;
    eLink.textContent = oPage.sName;

    const bIsActive = oPage.sHref === sActivePage;
    if (bIsActive) {
      eLink.classList.add('active');
      eLink.setAttribute('aria-current', 'page');
    }

    eNav.appendChild(eLink);
  });

  document.body.appendChild(eNav);
}
