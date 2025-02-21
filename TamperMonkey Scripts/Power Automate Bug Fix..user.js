// ==UserScript==
// @name         Power Automate Bug Fix
// @namespace    http://powerdevbox.com
// @version      2025-01-16
// @description  Fix Classic UI Beta Mode Bug
// @author       David Wyatt
// @match        https://make.powerautomate.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=azure.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
console.log("Crrated by David Wyatt");
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    const eSwitch=document.getElementById("switchDesigner");
      const bNew=eSwitch.getAttribute('aria-checked') === 'true';
      console.log(bNew);
    if (mutation.type === 'childList' && !bNew) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          try{
            const eBug=document.evaluate('//*[contains(@id,"ModalFocusTrapZone")]/div[2]',document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue
            if(eBug){
              eBug.style="overflow: visible";
            }
          }catch(err){
          }
        }
      });
    }
  }
});
const config = { childList: true, subtree: true };

  observer.observe(document.body, config);
})();