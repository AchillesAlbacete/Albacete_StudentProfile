(function () {
    "use strict";

    var API_BASE_URL = window.STUDENT_PROFILE_API_BASE_URL;
    var studentId = localStorage.getItem("authenticated_student_id");
    var token = localStorage.getItem("student_profile_token");
    var isProfilePage = /(?:^|\/)index\.html$/.test(window.location.pathname) || window.location.pathname.endsWith("/");

    if (!isProfilePage) {
        document.body.style.visibility = "hidden";
        if (!studentId || !token) {
            window.location.replace("index.html");
            return;
        }

        fetch(`${API_BASE_URL}/session`, {
            headers: { "Authorization": "Bearer " + token }
        }).then(async function (response) {
            if (!response.ok) throw new Error("Session expired");
            var session = await response.json();
            if (session.studentId !== studentId) throw new Error("Session does not match the signed-in account");
            document.body.style.visibility = "visible";
        }).catch(function () {
            localStorage.removeItem("authenticated_student_id");
            localStorage.removeItem("student_profile_token");
            window.location.replace("index.html");
        });
    }

    document.addEventListener("click", function (event) {
        var target = event.target;
        if (!(target instanceof Element)) return;

        var logoutButton = target.closest('[data-action="logout"]');
        if (!logoutButton) return;

        fetch(`${API_BASE_URL}/logout`, {
            method: "POST",
            headers: { "Authorization": "Bearer " + (localStorage.getItem("student_profile_token") || "") }
        }).finally(function () {
            localStorage.removeItem("authenticated_student_id");
            localStorage.removeItem("student_profile_token");
            window.location.replace("index.html");
        });
    });
}());