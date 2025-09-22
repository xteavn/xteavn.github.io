// ==UserScript==
// @name        Tự động ký HIS
// @namespace   http://www.xtea.vn/
// @version     1.5
// @description Tự động ký tờ điều trị và phiếu máu trên HIS
// @author      Xtea
// @icon        https://www.xtea.vn/favicon.ico
// @match       https://his.choray.vn/*
// @match       http://his.choray.vn/*
// @grant       none
// @run-at      document-idle
// @downloadURL https://app.xtea.vn/scripts/autosign.user.js
// @updateURL   https://app.xtea.vn/scripts/autosign.user.js
// ==/UserScript==

(function() {
    'use strict';

    // === CHỨC NĂNG 1: TỰ ĐỘNG XÓA THAM SỐ KHỎI URL ===
    function removeUrlParameter() {
        const url = window.location.href;
        const param1 = '&lichSuKyId=';
        const param2 = '?lichSuKyId=';
        let newUrl = '';

        if (url.includes(param1)) {
            newUrl = url.substring(0, url.indexOf(param1)) + url.substring(url.indexOf(param1) + param1.length);
        } else if (url.includes(param2)) {
            newUrl = url.substring(0, url.indexOf(param2)) + url.substring(url.indexOf(param2) + param2.length);
        }

        if (newUrl && newUrl !== url) {
            window.location.replace(newUrl);
            return true;
        }
        return false;
    }

    // Kiểm tra xem URL hiện tại có phải là EMR_BA077 không
    const isBA077 = window.location.href.includes('EMR_BA077');

    // Chỉ xóa tham số URL nếu là trang EMR_BA077
    if (isBA077) {
        if (removeUrlParameter()) {
            return;
        }
    }

    // === CHỨC NĂNG 2: TỰ ĐỘNG TÌM VÀ NHẤN NÚT KÝ ===
    const buttonText = 'Xác nhận ký BÁC SĨ ĐIỀU TRỊ';

    let checkTimer = null;
    let targetName = '';

    function checkAndClickButton(observer) {
        let found = false;

        if (isBA077) {
            // Đầu tiên, thử lấy tên bác sĩ nếu chưa tìm thấy
            if (!targetName) {
                const usernameDiv = document.querySelector('div.username');
                if (usernameDiv) {
                    targetName = usernameDiv.textContent.trim();
                    console.log("Đã tìm thấy tên bác sĩ từ trang:", targetName);
                } else {
                    console.log("Đang chờ thẻ tên bác sĩ (.username) xuất hiện...");
                    // Nếu không tìm thấy tên, quay lại và đợi lần kiểm tra MutationObserver tiếp theo
                    return;
                }
            }

            console.log("Đang tìm kiếm nút ký cho:", targetName);
            const nameElements = document.querySelectorAll('b');
            nameElements.forEach(nameElement => {
                if (nameElement.textContent.trim().includes(targetName)) {
                    console.log("Đã tìm thấy tên bác sĩ trên trang ký.");
                    const signSpan = nameElement.closest('.sign');
                    if (signSpan) {
                        const confirmButton = signSpan.querySelector('button');
                        if (confirmButton && confirmButton.textContent.trim().includes(buttonText)) {
                            console.log("Tìm thấy nút xác nhận. Đang tiến hành nhấp.");
                            confirmButton.click();
                            console.log("Đã click vào nút xác nhận.");
                            found = true;
                        }
                    }
                }
            });
        } else { // EMR_BA111
            console.log("Đang tìm kiếm nút ký trên trang EMR_BA111...");
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                if (button.textContent.trim().includes(buttonText)) {
                    console.log("Tìm thấy nút ký. Đang tiến hành nhấp.");
                    button.click();
                    console.log("Đã click vào nút ký.");
                    found = true;
                }
            });
        }

        if (found && observer) {
            console.log("Đã hoàn thành. Ngắt kết nối MutationObserver.");
            observer.disconnect();
        }
    }

    // Sử dụng MutationObserver để theo dõi thay đổi trên trang
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

    // Kiểm tra ban đầu
    checkAndClickButton();

})();
