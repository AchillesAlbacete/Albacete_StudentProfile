(function () {
    "use strict";

    var storageKey = "studentProfile";
    var defaultProfile = {
        fullName: "Achilles A. Albacete",
        course: "BS Information Technology",
        yearLevel: "3rd Year",
        about: "I am a third-year Information Technology student at Ateneo de Cagayan - Xavier University. I enjoy learning how technology works, building useful web experiences, and solving problems with patience and curiosity.",
        skills: "HTML, CSS, JavaScript, Problem-solving"
    };

    var profile = loadProfile();
    var form = document.getElementById("profile-form");
    var editPanel = document.querySelector(".edit-panel");
    var editButton = document.getElementById("edit-profile-button");
    var cancelButton = document.getElementById("cancel-edit-button");
    var formMessage = document.getElementById("form-message");

    function loadProfile() {
        var savedProfile = localStorage.getItem(storageKey);

        if (!savedProfile) {
            return defaultProfile;
        }

        try {
            return Object.assign({}, defaultProfile, JSON.parse(savedProfile));
        } catch (error) {
            return defaultProfile;
        }
    }

    function displayProfile() {
        document.getElementById("profile-heading").textContent = profile.fullName;
        document.getElementById("profile-course").textContent = profile.course;
        document.getElementById("profile-year").textContent = profile.yearLevel;
        document.getElementById("profile-about").textContent = profile.about;
        document.getElementById("profile-skills").textContent = profile.skills;
        document.querySelector(".profile-pic").alt = "Profile picture of " + profile.fullName;
    }

    function showEditor() {
        document.getElementById("full-name").value = profile.fullName;
        document.getElementById("course").value = profile.course;
        document.getElementById("year-level").value = profile.yearLevel;
        document.getElementById("about-me").value = profile.about;
        document.getElementById("skills").value = profile.skills;
        formMessage.textContent = "";
        editPanel.hidden = false;
        editButton.hidden = true;
        document.getElementById("full-name").focus();
    }

    function hideEditor() {
        editPanel.hidden = true;
        editButton.hidden = false;
        formMessage.textContent = "";
    }

    function validateForm() {
        var requiredFields = [
            { id: "full-name", message: "Please enter your full name." },
            { id: "course", message: "Please enter your course or program." },
            { id: "year-level", message: "Please enter your year level." },
            { id: "about-me", message: "Please tell us a little about yourself." }
        ];

        for (var index = 0; index < requiredFields.length; index += 1) {
            var field = document.getElementById(requiredFields[index].id);
            if (!field.value.trim()) {
                formMessage.textContent = requiredFields[index].message;
                field.focus();
                return false;
            }
        }

        return true;
    }

    function saveProfile(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        profile = {
            fullName: document.getElementById("full-name").value.trim(),
            course: document.getElementById("course").value.trim(),
            yearLevel: document.getElementById("year-level").value.trim(),
            about: document.getElementById("about-me").value.trim(),
            skills: document.getElementById("skills").value.trim() || "No skills listed yet."
        };
        localStorage.setItem(storageKey, JSON.stringify(profile));
        displayProfile();
        hideEditor();
    }

    displayProfile();
    editButton.addEventListener("click", showEditor);
    cancelButton.addEventListener("click", hideEditor);
    form.addEventListener("submit", saveProfile);
}());
