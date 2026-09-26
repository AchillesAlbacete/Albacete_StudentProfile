(function () {
    "use strict";

    // --- API CONFIGURATION ---
    var API_BASE_URL = "http://192.168.1.6:3000/api";
    
    var initialized = false;
    var currentProfileData = {}; // Stores the latest fetched data
    var defaultProfileContent = {};

    // --- AUTHENTICATION FLOW ---
    function checkAuth() {
        var studentId = localStorage.getItem("authenticated_student_id");
        var loginScreen = document.getElementById("login-screen");

        if (!studentId) {
            loginScreen.style.display = "flex";
        } else {
            loginScreen.style.display = "none";
            fetchProfile(studentId);
        }
    }

    async function handleLogin(event) {
        event.preventDefault();
        var studentId = document.getElementById("login-id").value.trim();
        var password = document.getElementById("login-password").value.trim();
        var errorDiv = document.getElementById("login-error");

        if (!studentId || !password) {
            errorDiv.textContent = "Please fill in all fields.";
            errorDiv.style.display = "block";
            return;
        }

        try {
            var response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: studentId, password: password })
            });

            var data = await response.json();

            if (!response.ok) {
                errorDiv.textContent = data.error || "Invalid student ID or password.";
                errorDiv.style.display = "block";
                return;
            }

            localStorage.setItem("authenticated_student_id", data.user.student_id);
            errorDiv.style.display = "none";
            document.getElementById("login-screen").style.display = "none";

            fetchProfile(data.user.student_id);

        } catch (error) {
            errorDiv.textContent = "Unable to connect to server. Check your network or IP address.";
            errorDiv.style.display = "block";
            console.error(error);
        }
    }

    // --- DATABASE CRUD OPERATIONS ---

    // 1. READ: Fetch profile from backend
    async function fetchProfile(studentId) {
        try {
            var response = await fetch(`${API_BASE_URL}/profile/${studentId}`);
            if (!response.ok) throw new Error("Profile not found");

            currentProfileData = await response.json();
            renderProfile(currentProfileData);
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Unable to retrieve your profile from the database.");
        }
    }

    // 2. UPDATE: Save profile to backend
    async function saveProfile(event) {
        if (event) event.preventDefault();

        var studentId = localStorage.getItem("authenticated_student_id");
        if (!studentId) return;

        // Validation
        var fullName = document.getElementById("input-name").value.trim();
        var course = document.getElementById("input-course").value.trim();
        var yearLevel = document.getElementById("input-year").value.trim();

        if (!fullName || !course || !yearLevel) {
            setMessage("Please enter Name, Course, and Year Level.", false);
            return;
        }

        // Pack ONLY the specific 'About' sub-fields together
        var aboutObj = {
            aboutMe: document.getElementById("input-about").value.trim(),
            aboutIntro: document.getElementById("input-about-intro").value.trim(),
            aboutDetails: document.getElementById("input-about-details").value.trim(),
            aboutPersonality: document.getElementById("input-about-personality").value.trim()
        };

        // NEW: Send interests, education, and goals directly as their own fields!
        var updatedPayload = {
            name: fullName,
            course: course,
            year_level: yearLevel,
            about: JSON.stringify(aboutObj),
            skills: document.getElementById("input-skills").value.trim(),
            interests: document.getElementById("input-interests").value.trim(),
            education: document.getElementById("input-education").value.trim(),
            goals: document.getElementById("input-goals").value.trim(),
            profile_picture: document.getElementById("profile-pic").src
        };

        try {
            var response = await fetch(`${API_BASE_URL}/profile/${studentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedPayload)
            });

            var result = await response.json();

            if (response.ok) {
                setMessage("Profile Updated Successfully", true);
                fetchProfile(studentId);
                setTimeout(closeEditForm, 1500); // Close form after 1.5 seconds
            } else {
                setMessage(result.error || "Unable to update profile.", false);
            }
        } catch (error) {
            console.error("Save error:", error);
            setMessage("Database connection failed.", false);
        }
    }

    // --- UI RENDERING & LOGIC ---

    function renderProfile(profile) {
        document.getElementById("display-name").textContent = profile.name || "";
        document.getElementById("display-course").textContent = profile.course || "";
        document.getElementById("display-year").textContent = profile.year_level || "";
        document.getElementById("display-skills").textContent = profile.skills || "No skills listed yet.";

        // Parse the packed 'About' JSON object for the sub-fields
        var aboutObj = {};
        try {
            aboutObj = JSON.parse(profile.about);
        } catch (e) {
            aboutObj = { aboutMe: profile.about || "" };
        }

        document.getElementById("display-about").textContent = aboutObj.aboutMe || defaultProfileContent.about;
        document.getElementById("display-about-intro").textContent = aboutObj.aboutIntro || defaultProfileContent.aboutIntro;
        document.getElementById("display-about-details").textContent = aboutObj.aboutDetails || defaultProfileContent.aboutDetails;
        document.getElementById("display-about-personality").textContent = aboutObj.aboutPersonality || defaultProfileContent.aboutPersonality;

        // NEW: Pull interests, education, and goals directly from the database columns!
        document.getElementById("display-interests").textContent = profile.interests || defaultProfileContent.interests;
        document.getElementById("display-education").textContent = profile.education || defaultProfileContent.education;
        document.getElementById("display-goals").textContent = profile.goals || defaultProfileContent.goals;

        var profileImg = document.getElementById("profile-pic");
        if (profileImg && profile.profile_picture) {
            profileImg.src = profile.profile_picture;
            profileImg.alt = "Profile picture of " + profile.name;
        }
    }

    function openEditForm() {
        document.getElementById("input-name").value = document.getElementById("display-name").textContent;
        document.getElementById("input-course").value = document.getElementById("display-course").textContent;
        document.getElementById("input-year").value = document.getElementById("display-year").textContent;
        document.getElementById("input-skills").value = document.getElementById("display-skills").textContent;

        document.getElementById("input-about").value = document.getElementById("display-about").textContent;
        document.getElementById("input-about-intro").value = document.getElementById("display-about-intro").textContent;
        document.getElementById("input-about-details").value = document.getElementById("display-about-details").textContent;
        document.getElementById("input-about-personality").value = document.getElementById("display-about-personality").textContent;
        document.getElementById("input-interests").value = document.getElementById("display-interests").textContent;
        document.getElementById("input-education").value = document.getElementById("display-education").textContent;
        document.getElementById("input-goals").value = document.getElementById("display-goals").textContent;

        setMessage("", false);
        document.getElementById("profile-view-section").classList.add("hidden");
        document.getElementById("profile-edit-section").classList.remove("hidden");
        document.getElementById("input-name").focus();
    }

    function closeEditForm() {
        setMessage("", false);
        document.getElementById("profile-edit-section").classList.add("hidden");
        document.getElementById("profile-view-section").classList.remove("hidden");
    }

    function setMessage(message, isSuccess) {
        var errorContainer = document.getElementById("error-message");
        errorContainer.textContent = message;

        if (isSuccess) {
            errorContainer.style.color = "#2e7d32";
            errorContainer.style.backgroundColor = "#e8f5e9";
        } else {
            errorContainer.style.color = "#d32f2f";
            errorContainer.style.backgroundColor = "#ffebee";
        }
    }

    // --- CAMERA INTEGRATION ---

    function openCamera() {
        if (!navigator.camera || typeof navigator.camera.getPicture !== "function") {
            alert("The camera plugin is not ready. Close and reopen the app, then try again.");
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

        try {
            navigator.camera.getPicture(onCameraSuccess, onCameraFail, cameraOptions);
        } catch (error) {
            onCameraFail(error.message);
        }
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

        var cleanData = imageData.replace(/[\r\n\s]+/g, "");
        var imageSrc = cleanData.indexOf("data:image") === 0
            ? cleanData
            : "data:image/jpeg;base64," + cleanData;

        var profileImg = document.getElementById("profile-pic");
        if (profileImg) profileImg.src = imageSrc;

        var studentId = localStorage.getItem("authenticated_student_id");
        if (studentId && currentProfileData.name) {
            currentProfileData.profile_picture = imageSrc;
            saveProfilePicture(studentId);
        }
    }

    async function saveProfilePicture(studentId) {
        try {
            var response = await fetch(`${API_BASE_URL}/profile/${studentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentProfileData)
            });

            if (response.ok) {
                console.log("Photo successfully saved to database!");
            }
        } catch (error) {
            console.error("Failed to upload photo to database:", error);
        }
    }

    // --- INITIALIZATION ---

    function initApp() {
        if (initialized) return;
        initialized = true;

        defaultProfileContent = {
            about: document.getElementById("display-about").textContent,
            aboutIntro: document.getElementById("display-about-intro").textContent,
            aboutDetails: document.getElementById("display-about-details").textContent,
            aboutPersonality: document.getElementById("display-about-personality").textContent,
            interests: document.getElementById("display-interests").textContent,
            education: document.getElementById("display-education").textContent,
            goals: document.getElementById("display-goals").textContent
        };

        document.getElementById("login-form").addEventListener("submit", handleLogin);
        document.getElementById("btn-edit").addEventListener("click", openEditForm);
        document.getElementById("btn-cancel").addEventListener("click", closeEditForm);
        document.getElementById("edit-profile-form").addEventListener("submit", saveProfile);

        checkAuth();
    }

    var changePicBtn = document.getElementById("btn-change-pic");
    if (changePicBtn) {
        changePicBtn.addEventListener("click", openCamera);
    }

    if (window.cordova) {
        document.addEventListener("deviceready", initApp, false);
    } else if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initApp, false);
    } else {
        initApp();
    }
}());