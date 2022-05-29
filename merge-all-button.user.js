// ==UserScript==
// @name                Merge All Button for GitLab
// @name:zh-CN          GitLab一键合并按钮
// @namespace           https://greasyfork.org/users/692574
// @version             0.0.99
// @description         Add a button to GitLab dashboard page to merge all merge requests 
// @description:zh-CN   在GitLab仪表盘界面添加一个合并所有请求的按钮
// @author              Chase Choi
// @license             MIT
// @match               https://gitlab.com/dashboard/merge_requests*
// @require             https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant               GM.xmlHttpRequest
// ==/UserScript==

const SUCCESS = 200;
const BASE_URL = window.location.origin;
const ACCESS_TOKEN = '<YOUR_ACCESS_TOKEN>';

(function() {
    'use strict';
    
    // Update DOM
    const mergeAllElement = `
        <div class="gl-ml-3">
            <a class="btn gl-button btn-confirm merge-all-btn">Merge All</a>
        </div>
    `;
    $(`${mergeAllElement}`).insertAfter($('.filter-dropdown-container'));
    $('.merge-all-btn').css('background-color', '#3C824E');

    // get merge request list
    let elements = $('li.merge-request .issuable-info .issuable-reference');
    if (elements.length) {
        elements.each(function () {
            const mergeRequestReference = $(this).text();
            if (mergeRequestReference.length) {
                const projectNamespace = mergeRequestReference.split('!')[0].trim().replace('/', '%2F');
                const mergeRequestID = mergeRequestReference.split('!')[1];
                console.log(projectNamespace, mergeRequestID);
                startMerge(projectNamespace, mergeRequestID);
            }
        });
    }
})();

function startMerge(projectNamespace, mergeRequestID) {
    GM.xmlHttpRequest({
        method: "GET",
        url: `${BASE_URL}/api/v4/projects/${projectNamespace}`,
        headers: {
            "Authorization": `Bearer ${ACCESS_TOKEN}`
        },
        onload: function (response) {
            if (response.status == SUCCESS) {
                const projectInfo = JSON.parse(response.responseText);
                console.log(`project ID: ${projectInfo.id}; merge request ID: ${mergeRequestID}`);
                performMergeAction(projectInfo.id, mergeRequestID);
            }
        }
    });
}

function performMergeAction(projectID, mergeRequestID) {
    GM.xmlHttpRequest({
        method: "PUT",
        url: `${BASE_URL}/api/v4/projects/${projectID}/merge_requests/${mergeRequestID}/merge`,
        headers: {
            "Authorization": `Bearer ${ACCESS_TOKEN}`
        },
        onload: function (response) {
            if (response.status == SUCCESS) {
                console.log("Merged successfully!");
            }
        }
    });
}