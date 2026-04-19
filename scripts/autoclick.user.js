// ==UserScript==
// @name         Click Eyes in First Dialog
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Chỉ click icon mắt trong div role="dialog" đầu tiên tìm thấy
// @author       Xtea
// @match       https://his.choray.vn/*
// @match       http://his.choray.vn/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const EYE_PATH = "M12 6.5c3.8 0 7.2 2.1 8.8 5.5-1.6 3.4-5 5.5-8.8 5.5-3.8 0-7.2-2.1-8.8-5.5 1.6-3.4 5-5.5 8.8-5.5zm0-2C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zm0 5c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5zm0-2c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5z";

    function clickAllInFirstDialog() {
        const dialog = document.querySelector('div[role="dialog"]');
        if (!dialog) return;

        const eyes = dialog.querySelectorAll(`path[d="${EYE_PATH}"]`);
        let clickedCount = 0;

        eyes.forEach(path => {
            const target = path.closest('button') || path.closest('svg');

            // Tối ưu: Chỉ click nếu chưa được đánh dấu
            if (target && !target.hasAttribute('data-gm-done')) {
                ['mousedown', 'mouseup', 'click'].forEach(type => {
                    target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }));
                });
                target.setAttribute('data-gm-done', 'true');
                clickedCount++;
            }
        });

        if (clickedCount > 0) {
            console.log(`[Tampermonkey] Đã xử lý ${clickedCount} icon.`);
            // Tối ưu: Nếu bạn muốn click xong là thôi hẳn, hãy bỏ comment dòng dưới:
            // observer.disconnect();
        }
    }

    // Tối ưu: Sử dụng MutationObserver với cấu hình nhẹ nhất
    const observer = new MutationObserver((mutations) => {
        // Chỉ chạy khi có thêm/bớt phần tử, không chạy khi đổi màu sắc/class
        for (let mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                clickAllInFirstDialog();
                break;
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    clickAllInFirstDialog();
})();
