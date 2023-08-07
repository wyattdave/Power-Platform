// ==UserScript==
// @name         Trigger Power Automate Test
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Triggers Test on ALT+t (most recent run)
// @author       David Wyatt
// @match        https://*make.powerautomate.com/*
// @icon         https://img.icons8.com/office/256/microsoft-power-automate-2020.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let keys = {
        a: false,
        t: false
    };
    let i=0;
    let iWait=10000000;
    window.addEventListener("keydown", (event) => {
        if (event.key === "Alt") {
            keys.a = true;
        }
        if (event.key === "t") {
            keys.t = true;
        }
        if (event.altKey && event.key === "t") {
            let bAuto=true;
            let bRecent=true;
            let bFirst=true;
            keys.t = false;
            keys.a = false;
            const elmTest=document.querySelector('[data-automation-id="testFlow"]');
            elmTest.click();

            let timer=setInterval(() => {

                let elmAuto=document.querySelector('[aria-label="Test Flow, Automatically"]');//console.log(elmAuto);//elmAuto.click();
                if (elmAuto && bAuto){
                    elmAuto.click();
                     bAuto=false;
                }
                let elmRecent=document.querySelector('[aria-label="With a recently used trigger."]');//elmRecent.click();
                if(!elmRecent && bRecent){
                    elmAuto.click()
                };
                if(elmRecent && bRecent){
                    elmRecent.click();
                    bRecent=false;                
                }
                let elmContainerAll=document.querySelectorAll('[class="ba-Panel-content"] [role="radiogroup"]');
                if (elmContainerAll && iWait==10000000){
                    iWait=i+20;
                };
                let elmContainer=elmContainerAll[2];
                if (elmContainer && bFirst && !bAuto && !bRecent){
                    let elmFirst=elmContainer.querySelectorAll('[type="radio"]')[0];
                    if (!elmFirst.checked || i>iWait){
                        elmFirst.click();
                        bFirst=false;
                    }
                }
                let elmPannel=document.querySelector('[class^="ms-Panel-footer"]');
                if(elmPannel){
                    let elmTestButton=elmPannel.querySelector('[aria-label="Test"]');
                    let elmSaveTestButton=elmPannel.querySelector('[aria-label="Save & Test"]');
                    if(elmTestButton && !bAuto && !bRecent && !bFirst){
                        elmTestButton.click();
                        clearInterval(timer);
                    }
                    if(elmSaveTestButton && !bAuto && !bRecent && !bFirst){
                        elmSaveTestButton.click();
                        clearInterval(timer);
                    }
                }
                i++;

                if(i==100){clearInterval(timer);}
            }, 100);
        }
    })
})();