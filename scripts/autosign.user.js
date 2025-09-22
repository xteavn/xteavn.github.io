// ==UserScript==
// @name        Tự động ký HIS
// @namespace   http://www.xtea.vn/
// @version     1.2
// @description Tự động ký tờ điều trị và phiếu máu trên HIS
// @author      Xtea
// @icon        https://www.xtea.vn/favicon.ico
// @match       his.choray.vn*
// @grant       none
// @run-at      document-start
// @downloadURL https://app.xtea.vn/scripts/autosign.user.js
// @updateURL   https://app.xtea.vn/scripts/autosign.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Lấy đường dẫn hiện tại của trang
    const currentUrl = window.location.href;

    // --- XỬ LÝ CHO TRƯỜNG HỢP 1: Tờ điều trị EMR_BA077 ---
    if (currentUrl.includes('EMR_BA077')) {

        // Chức năng 1: Xóa tham số 'lichSuKyId' khỏi URL
        const param1 = '&lichSuKyId=';
        const param2 = '?lichSuKyId=';
        let newUrl = '';

        if (currentUrl.includes(param1)) {
            newUrl = currentUrl.replace(param1, '&');
        } else if (currentUrl.includes(param2)) {
            newUrl = currentUrl.replace(param2, '?');
        }

        if (newUrl && newUrl !== currentUrl) {
            window.location.replace(newUrl);
            return;
        }

        // Chức năng 2: Tìm và ký tự động với tên
        let targetName = '';
        const usernameDiv = document.querySelector('div.username');
        if (usernameDiv) {
            targetName = usernameDiv.textContent.trim();
        }

        const buttonText = 'Xác nhận ký BÁC SĨ ĐIỀU TRỊ';
        let checkTimer = null;

        function checkAndClickButton(observer) {
            if (!targetName) return;
            console.log("Đang tìm kiếm nút ký cho:", targetName);
            const nameElements = document.querySelectorAll('b');
            let found = false;

            nameElements.forEach(nameElement => {
                if (nameElement.textContent.trim().includes(targetName)) {
                   // console.log("Tìm thấy tên bác sĩ:", targetName);
                    const signSpan = nameElement.closest('.sign');
                    if (signSpan) {
                        const confirmButton = signSpan.querySelector('button');
                        if (confirmButton && confirmButton.textContent.trim().includes(buttonText)) {
                            //console.log("Tìm thấy nút xác nhận. Đang nhấp.");
                            confirmButton.click();
                            //console.log("Đã click vào nút xác nhận.");
                            found = true;
                        }
                    }
                }
            });

            if (found && observer) {
                observer.disconnect();
            }
        }

        const observer = new MutationObserver((mutationsList, obs) => {
            if (checkTimer) {
                clearTimeout(checkTimer);
            }
            checkTimer = setTimeout(() => {
                checkAndClickButton(obs);
            }, 500);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        checkAndClickButton();
    }

    // --- XỬ LÝ CHO TRƯỜNG HỢP 2: Tờ điều trị EMR_BA111 ---
    else if (currentUrl.includes('EMR_BA111')) {
        const targetButtonText = 'Xác nhận ký BÁC SĨ ĐIỀU TRỊ';
        let checkTimer = null;

        function checkAndClickButton(observer) {
            console.log("Đang tìm kiếm nút ký...");
            const buttons = document.querySelectorAll('button');
            let found = false;

            buttons.forEach(button => {
                if (button.textContent.trim().includes(targetButtonText)) {
                    //console.log("Tìm thấy nút ký. Đang nhấp.");
                    button.click();
                    //console.log("Đã click vào nút ký.");
                    found = true;
                }
            });

            if (found && observer) {
                observer.disconnect();
            }
        }

        const observer = new MutationObserver((mutationsList, obs) => {
            if (checkTimer) {
                clearTimeout(checkTimer);
            }
            checkTimer = setTimeout(() => {
                checkAndClickButton(obs);
            }, 500);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        checkAndClickButton();
    }

    // Các trường hợp khác có thể thêm vào đây
    // else if (currentUrl.includes('...')) {
    //    ...
    // }

})();
