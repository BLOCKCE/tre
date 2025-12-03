// ==UserScript==
// @name         Force Function Return Value (Debug)
// @match        https://assessment.trelson.com/student/kiosk
// @version      1.2
// @description  yes
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {

    const inject = () => {

        const log = (...x) =>
            console.log("%c[TM]", "color:#0f0;font-weight:bold", ...x);

        /* ----------------------------------
           Fake Extension for chrome.runtime.sendMessage
        ----------------------------------*/

        // Create fake chrome.runtime.sendMessage
        const TARGET = "pobjggkcklnkigkdcmbkghbjpggedbjl";

        // Fake the chrome.runtime.sendMessage function
        const originalSendMessage = chrome.runtime ? chrome.runtime.sendMessage : undefined;

        if (typeof chrome.runtime === "undefined") {
            chrome.runtime = {};
        }

        chrome.runtime.sendMessage = function (extensionId, msg, callback) {


            if (extensionId === TARGET) {
                const fakeResponse = "no";


                if (typeof callback === "function") {
                    callback(fakeResponse);
                }

                return Promise.resolve(fakeResponse);
            }

            // If it's a different extension ID, fallback to the original behavior
            if (originalSendMessage) {
                return originalSendMessage.apply(chrome.runtime, arguments);
            }

            return Promise.resolve(null);
        };

        /* ----------------------------------
           Intercept Response of XMLHttpRequest (POST Only)
        ----------------------------------*/
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method, url) {
            this._isPost = method.toUpperCase() === "POST";
            return originalOpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function (body) {

            if (!this._isPost) {
                return originalSend.apply(this, arguments);
            }


            const xhr = this;

            this.addEventListener("readystatechange", function () {
                if (xhr.readyState === 4) {


                    Object.defineProperty(xhr, "responseText", {
                        value: "HELLO"
                    });

                    Object.defineProperty(xhr, "response", {
                        value: "HELLO"
                    });
                }
            });

            return originalSend.apply(this, arguments);
        };


    };

    // Inject the script into the page
    const script = document.createElement("script");
    script.textContent = "(" + inject.toString() + ")();";
    document.documentElement.appendChild(script);
    script.remove();

})();
