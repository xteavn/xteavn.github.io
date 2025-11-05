// ==UserScript==
// @name        Tự động ký HIS
// @namespace   http://www.xtea.vn/
// @version     1.7
// @description Tự động ký tờ điều trị và phiếu máu trên HIS
// @author      Xtea
// @icon        https://www.xtea.vn/favicon.ico
// @match       https://his.choray.vn/*
// @match       http://his.choray.vn/*
// @grant       none
// @run-at      document-end
// @downloadURL https://app.xtea.vn/scripts/autosign.user.js
// @updateURL   https://app.xtea.vn/scripts/autosign.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Độ trễ giữa các lần click (3000ms = 3 giây)
    const CLICK_DELAY_MS = 2000;
    const buttonText = 'Xác nhận ký BÁC SĨ ĐIỀU TRỊ';

    // Hàm tạo độ trễ
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // === CHỨC NĂNG 1: TỰ ĐỘNG XÓA THAM SỐ KHỎI URL (CHỈ ÁP DỤNG CHO EMR_BA077) ===
    function removeUrlParameter() {
        const url = window.location.href;
        const param1 = '&lichSuKyId=';
        const param2 = '?lichSuKyId=';
        let newUrl = '';

        if (url.includes(param1)) {
            newUrl = url.substring(0, url.indexOf(param1));
        } else if (url.includes(param2)) {
            newUrl = url.substring(0, url.indexOf(param2));
        }

        if (newUrl && newUrl !== url) {
            window.location.replace(newUrl);
            return true;
        }
        return false;
    }

    // Kiểm tra các trang cần tự động ký
    const isBA077 = window.location.href.includes('EMR_BA077');
    const isBA111OrBA235 = window.location.href.includes('EMR_BA111') || window.location.href.includes('EMR_BA235');

    // Chỉ xóa tham số URL nếu là trang EMR_BA077
    if (isBA077) {
        if (removeUrlParameter()) {
            return; // Ngừng thực thi nếu đã chuyển hướng
        }
    }

    // === CHỨC NĂNG 2: TỰ ĐỘNG TÌM VÀ NHẤN NÚT KÝ (CÓ ĐỘ TRỄ) ===
    let checkTimer = null;
    let targetName = '';

    async function checkAndClickButton(observer) {
        const buttonsToClick = [];

        if (isBA077) {
            // Logic thu thập nút cho EMR_BA077 (Tờ điều trị)
            if (!targetName) {
                const usernameDiv = document.querySelector('div.username');
                if (usernameDiv) {
                    targetName = usernameDiv.textContent.trim();
                    console.log("EMR_BA077: Đã tìm thấy tên bác sĩ từ trang:", targetName);
                } else {
                    console.log("EMR_BA077: Đang chờ thẻ tên bác sĩ (.username) xuất hiện...");
                    return false; // Chưa tìm thấy tên, chờ lần kiểm tra tiếp theo
                }
            }

            console.log("EMR_BA077: Đang tìm kiếm nút ký cho:", targetName);
            const nameElements = document.querySelectorAll('b');
            nameElements.forEach(nameElement => {
                if (nameElement.textContent.trim().includes(targetName)) {
                    const signSpan = nameElement.closest('.sign');
                    if (signSpan) {
                        const confirmButton = signSpan.querySelector('button');
                        if (confirmButton && confirmButton.textContent.trim().includes(buttonText)) {
                            buttonsToClick.push(confirmButton);
                        }
                    }
                }
            });
        } else if (isBA111OrBA235) {
            // Logic thu thập nút cho EMR_BA111/EMR_BA235
            console.log("Đang tìm kiếm nút ký trên trang EMR_BA111/EMR_BA235...");
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                if (button.textContent.trim().includes(buttonText)) {
                    buttonsToClick.push(button);
                }
            });
        }

        // --- XỬ LÝ NHẤP NÚT CÓ ĐỘ TRỄ ---
        if (buttonsToClick.length > 0) {
            console.log(`Tìm thấy ${buttonsToClick.length} nút ký. Bắt đầu ký tự động với độ trễ ${CLICK_DELAY_MS / 1000} giây.`);

            // Dùng vòng lặp for...of để sử dụng await, đảm bảo thứ tự
            for (const button of buttonsToClick) {
                console.log("Tìm thấy nút ký. Đang tiến hành nhấp.");
                button.click();
                console.log(`Đã click. Chờ ${CLICK_DELAY_MS / 1000} giây trước lần nhấp tiếp theo...`);
                await delay(CLICK_DELAY_MS);
            }

            console.log("Đã hoàn thành tất cả các lần click. Ngắt kết nối MutationObserver.");
            // Ngắt kết nối Observer sau khi chuỗi hành động hoàn tất
            if (observer) {
                observer.disconnect();
            }
            return true;
        }

        return false;
    }

    // Sử dụng MutationObserver để theo dõi thay đổi trên trang (các phần tử có thể được tải chậm)
    const observer = new MutationObserver((mutationsList, obs) => {
        if (checkTimer) {
            clearTimeout(checkTimer);
        }
        // Đặt timeout nhỏ để tránh lặp quá nhanh, tối ưu hiệu suất.
        // Gọi hàm async checkAndClickButton.
        checkTimer = setTimeout(() => {
            checkAndClickButton(obs);
        }, 2000);
    });

    // Bắt đầu theo dõi body của trang
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Kiểm tra ban đầu phòng trường hợp các phần tử đã sẵn sàng ngay từ đầu
    checkAndClickButton(observer);

})();
