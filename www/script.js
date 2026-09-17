(function () {
    "use strict";

    var storageKey = "studentProfile";
    var initialized = false;
    var defaultProfile = {
        fullName: "Achilles A. Albacete",
        course: "BS Information Technology",
        yearLevel: "3rd Year",
        aboutMe: "I am a third-year Information Technology student at Ateneo de Cagayan - Xavier University. I enjoy learning how technology works, building useful web experiences, and solving problems with patience and curiosity.",
        skills: "HTML, CSS, JavaScript, Web Development"
    };

    function readProfile() {
        var savedProfile = localStorage.getItem(storageKey);

        if (!savedProfile) {
            return Object.assign({}, defaultProfile);
        }

        try {
            return Object.assign({}, defaultProfile, JSON.parse(savedProfile));
        } catch (error) {
            localStorage.removeItem(storageKey);
            return Object.assign({}, defaultProfile);
        }
    }

    function setMessage(message, isSuccess) {
        var errorContainer = document.getElementById("error-message");
        errorContainer.textContent = message;
        errorContainer.classList.toggle("success-message", Boolean(isSuccess));
    }

    function renderProfile(profile) {
        document.getElementById("display-name").textContent = profile.fullName;
        document.getElementById("display-course").textContent = profile.course;
        document.getElementById("display-year").textContent = profile.yearLevel;
        document.getElementById("display-about").textContent = profile.aboutMe;
        document.getElementById("display-skills").textContent = profile.skills || "No skills listed yet.";
        document.querySelector(".profile-pic").alt = "Profile picture of " + profile.fullName;
    }

    function openEditForm() {
        var profile = readProfile();

        document.getElementById("input-name").value = profile.fullName;
        document.getElementById("input-course").value = profile.course;
        document.getElementById("input-year").value = profile.yearLevel;
        document.getElementById("input-about").value = profile.aboutMe;
        document.getElementById("input-skills").value = profile.skills;
        setMessage("");
        document.getElementById("profile-view-section").classList.add("hidden");
        document.getElementById("profile-edit-section").classList.remove("hidden");
        document.getElementById("input-name").focus();
    }

    function closeEditForm() {
        setMessage("");
        document.getElementById("profile-edit-section").classList.add("hidden");
        document.getElementById("profile-view-section").classList.remove("hidden");
    }

    function saveProfile(event) {
        event.preventDefault();

        var fullName = document.getElementById("input-name").value.trim();
        var course = document.getElementById("input-course").value.trim();
        var yearLevel = document.getElementById("input-year").value.trim();
        var aboutMe = document.getElementById("input-about").value.trim();
        var skills = document.getElementById("input-skills").value.trim();

        if (!fullName) {
            setMessage("Please enter your full name.");
            document.getElementById("input-name").focus();
            return;
        }
        if (!course) {
            setMessage("Please enter your course or program.");
            document.getElementById("input-course").focus();
            return;
        }
        if (!yearLevel) {
            setMessage("Please enter your year level.");
            document.getElementById("input-year").focus();
            return;
        }
        if (!aboutMe) {
            setMessage("Please enter your About Me description.");
            document.getElementById("input-about").focus();
            return;
        }

        var updatedProfile = { fullName: fullName, course: course, yearLevel: yearLevel, aboutMe: aboutMe, skills: skills };

        try {
            localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
        } catch (error) {
            setMessage("The profile could not be saved on this device.");
            return;
        }

        renderProfile(updatedProfile);
        closeEditForm();
    }

    function initProfile() {
        if (initialized) {
            return;
        }

        initialized = true;
        renderProfile(readProfile());
        document.getElementById("btn-edit").addEventListener("click", openEditForm);
        document.getElementById("btn-cancel").addEventListener("click", closeEditForm);
        document.getElementById("edit-profile-form").addEventListener("submit", saveProfile);
    }

    document.addEventListener("DOMContentLoaded", initProfile);
    document.addEventListener("deviceready", initProfile, false);
}());
