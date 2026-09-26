(function () {
    "use strict";

    document.addEventListener("click", function (event) {
        var target = event.target;
        if (!(target instanceof Element)) return;

        var logoutButton = target.closest('[data-action="logout"]');
        if (!logoutButton) return;

        localStorage.removeItem("authenticated_student_id");
        window.location.replace("index.html");
    });
}());