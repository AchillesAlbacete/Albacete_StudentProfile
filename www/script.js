(function () {
    "use strict";

    var storageKey = "studentProfile";
    var initialized = false;
    
    var defaultProfile = {
        fullName: "Achilles A. Albacete",
        course: "BS Information Technology",
        yearLevel: "3rd Year",
        aboutMe: "I am a third-year Information Technology student at Ateneo de Cagayan - Xavier University. I enjoy learning how technology works, building useful web experiences, and solving problems with patience and curiosity.",
        skills: "HTML, CSS, JavaScript, Web Development",
        aboutIntro: "I am Achilles A. Albacete, a third-year Bachelor of Science in Information Technology student at Ateneo de Cagayan - Xavier University.",
        aboutDetails: "I have lived in Cagayan de Oro City for nearly 11 years. During that time, I have learned to value discipline, determination, and continuous learning. College has taught me how to adapt, persevere, and stay focused when the workload becomes overwhelming. I enjoy quiet moments, thoughtful reflection, and learning new things independently, especially when they involve technology and digital systems.",
        aboutPersonality: "I am naturally an introvert, but I am curious and motivated to improve myself. I chose BSIT because it is practical and future-oriented, giving me opportunities to explore networking, web development, system processes, and technology-driven problem solving. Along the way, I am also developing patience, teamwork, resilience, and confidence.",
        interests: "Reading manhwa and manga; Learning how client and server devices work; Playing airsoft.",
        education: "Currently pursuing a Bachelor of Science in Information Technology at Ateneo de Cagayan - Xavier University.",
        goals: "My long-term goal is to become a dependable software developer who contributes to meaningful projects and solves real-world problems. I want to keep growing in web development, networking, and system design while building a career grounded in responsibility, collaboration, and service.",
        profilePic: "Image/264047587.png" 
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
        document.getElementById("display-about-intro").textContent = profile.aboutIntro;
        document.getElementById("display-about-details").textContent = profile.aboutDetails;
        document.getElementById("display-about-personality").textContent = profile.aboutPersonality;
        document.getElementById("display-interests").textContent = profile.interests;
        document.getElementById("display-education").textContent = profile.education;
        document.getElementById("display-goals").textContent = profile.goals;
        
        var profileImg = document.getElementById("profile-pic");
        if (profileImg) {
            profileImg.src = profile.profilePic;
            profileImg.alt = "Profile picture of " + profile.fullName;
        }
    }

    function openEditForm() {
        var profile = readProfile();

        document.getElementById("input-name").value = profile.fullName;
        document.getElementById("input-course").value = profile.course;
        document.getElementById("input-year").value = profile.yearLevel;
        document.getElementById("input-about").value = profile.aboutMe;
        document.getElementById("input-skills").value = profile.skills;
        document.getElementById("input-about-intro").value = profile.aboutIntro;
        document.getElementById("input-about-details").value = profile.aboutDetails;
        document.getElementById("input-about-personality").value = profile.aboutPersonality;
        document.getElementById("input-interests").value = profile.interests;
        document.getElementById("input-education").value = profile.education;
        document.getElementById("input-goals").value = profile.goals;
        
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

        if (!fullName) { setMessage("Please enter your full name."); document.getElementById("input-name").focus(); return; }
        if (!course) { setMessage("Please enter your course or program."); document.getElementById("input-course").focus(); return; }
        if (!yearLevel) { setMessage("Please enter your year level."); document.getElementById("input-year").focus(); return; }
        if (!aboutMe) { setMessage("Please enter your About Me description."); document.getElementById("input-about").focus(); return; }

        var aboutIntro = document.getElementById("input-about-intro").value.trim();
        var aboutDetails = document.getElementById("input-about-details").value.trim();
        var aboutPersonality = document.getElementById("input-about-personality").value.trim();
        var interests = document.getElementById("input-interests").value.trim();
        var education = document.getElementById("input-education").value.trim();
        var goals = document.getElementById("input-goals").value.trim();

        if (!aboutIntro || !aboutDetails || !aboutPersonality || !interests || !education || !goals) {
            setMessage("Please complete all About Me, Interests, Education, and Goals fields.");
            return;
        }

        var currentProfile = readProfile();

        var updatedProfile = {
            fullName: fullName,
            course: course,
            yearLevel: yearLevel,
            aboutMe: aboutMe,
            skills: skills,
            aboutIntro: aboutIntro,
            aboutDetails: aboutDetails,
            aboutPersonality: aboutPersonality,
            interests: interests,
            education: education,
            goals: goals,
            profilePic: currentProfile.profilePic 
        };

        try {
            localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
        } catch (error) {
            setMessage("The profile could not be saved on this device.");
            return;
        }

        renderProfile(updatedProfile);
        closeEditForm();
    }

    function openCamera() {
        if (!navigator.camera) {
            alert("Camera hardware is not accessible on this device.");
            return;
        }

        var cameraOptions = {
            quality: 50,                                      
            destinationType: Camera.DestinationType.DATA_URL, 
            sourceType: Camera.PictureSourceType.CAMERA,     
            encodingType: Camera.EncodingType.JPEG,           
            mediaType: Camera.MediaType.PICTURE,             
            correctOrientation: true,                         
            targetWidth: 500,                                 
            targetHeight: 500,                                
            saveToPhotoAlbum: false                          
        };

        navigator.camera.getPicture(onCameraSuccess, onCameraFail, cameraOptions);
    }

    function onCameraFail(message) {
        var msg = (message || "").toLowerCase();
        
        if (msg.includes("cancel") || msg.includes("no image") || msg.includes("has rejected")) {
            console.log("User cancelled camera capture.");
            return;
        }
        
        alert("Unable to access the camera. Please check your device permissions. Error: " + message);
    }

    function onCameraSuccess(imageData) {
    if (!imageData) return;

    // Remove linebreaks and whitespace inserted by Android native camera
    var cleanData = imageData.replace(/[\r\n\s]+/g, "");

    // Prevent duplicating "data:image/jpeg;base64," if it already exists
    var imageSrc = cleanData.indexOf("data:image") === 0 
        ? cleanData 
        : "data:image/jpeg;base64," + cleanData;

    var profileImg = document.getElementById("profile-pic");
    if (profileImg) {
        profileImg.src = imageSrc;
    }

    var currentProfile = readProfile();
    currentProfile.profilePic = imageSrc;

    try {
        localStorage.setItem(storageKey, JSON.stringify(currentProfile));
        console.log("Photo successfully saved and updated!");
    } catch (error) {
        console.error("LocalStorage save error:", error);
    }
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

        var changePicBtn = document.getElementById("btn-change-pic");
        if (changePicBtn) {
            changePicBtn.addEventListener("click", openCamera);
        }
    }

    document.addEventListener("DOMContentLoaded", initProfile);
    document.addEventListener("deviceready", initProfile, false);
}());