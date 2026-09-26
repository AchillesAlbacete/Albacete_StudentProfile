(function () {
    "use strict";

    // --- API CONFIGURATION ---
    var API_BASE_URL = window.STUDENT_PROFILE_API_BASE_URL;
    
    var initialized = false;
    var currentProfileData = {}; // Stores the latest fetched data
    var defaultProfileContent = {};

    function authHeaders() {
        return {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("student_profile_token")
        };
    }

    function clearAuthentication() {
        localStorage.removeItem("authenticated_student_id");
        localStorage.removeItem("student_profile_token");
    }

    // --- AUTHENTICATION FLOW ---
    function checkAuth() {
        var studentId = localStorage.getItem("authenticated_student_id");
        var loginScreen = document.getElementById("login-screen");

        var token = localStorage.getItem("student_profile_token");
        if (!studentId || !token) {
            loginScreen.style.display = "flex";
            return;
        }

        fetch(`${API_BASE_URL}/session`, { headers: authHeaders() })
            .then(async function (response) {
                if (!response.ok) throw new Error("Your session has expired. Please log in again.");
                var session = await response.json();
                if (session.studentId !== studentId) throw new Error("Your session is not valid for this profile.");
                loginScreen.style.display = "none";
                await fetchProfile(studentId);
            })
            .catch(function (error) {
                clearAuthentication();
                loginScreen.style.display = "flex";
                document.getElementById("login-error").textContent = error.message;
                document.getElementById("login-error").style.display = "block";
            });
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

            // Store the server-issued session token for protected API requests.
            localStorage.setItem("authenticated_student_id", data.user.student_id);
            localStorage.setItem("student_profile_token", data.token);
            errorDiv.style.display = "none";
            document.getElementById("login-screen").style.display = "none";

            await fetchProfile(data.user.student_id);

        } catch (error) {
            errorDiv.textContent = "Unable to connect to server. Check your network or IP address.";
            errorDiv.style.display = "block";
            console.error(error);
        }
    }

    async function handleRegister(event) {
        event.preventDefault();
        var errorDiv = document.getElementById("register-error");
        var account = {
            studentId: document.getElementById("register-id").value.trim(),
            password: document.getElementById("register-password").value,
            name: document.getElementById("register-name").value.trim(),
            course: document.getElementById("register-course").value.trim(),
            yearLevel: document.getElementById("register-year").value.trim()
        };

        try {
            var response = await fetch(`${API_BASE_URL}/students`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(account)
            });
            var result = await response.json();
            if (!response.ok) throw new Error(result.error || "Unable to create student account.");

            document.getElementById("login-id").value = account.studentId;
            document.getElementById("login-password").value = "";
            document.getElementById("register-panel").classList.add("hidden");
            document.getElementById("login-form").style.display = "block";
            document.getElementById("show-register").style.display = "block";
            document.getElementById("login-error").textContent = "Account created. Log in with your new credentials.";
            document.getElementById("login-error").style.display = "block";
        } catch (error) {
            errorDiv.textContent = error.message || "Unable to connect to server.";
            errorDiv.style.display = "block";
        }
    }

    // --- DATABASE CRUD OPERATIONS ---

    // 1. READ: Fetch profile from backend
    async function fetchProfile(studentId) {
        try {
            var response = await fetch(`${API_BASE_URL}/profile/${studentId}`, { headers: authHeaders() });
            if (response.status === 401) {
                clearAuthentication();
                document.getElementById("login-screen").style.display = "flex";
                return false;
            }
            if (!response.ok) throw new Error("Unable to retrieve your profile. Please try again.");

            currentProfileData = await response.json();
            renderProfile(currentProfileData);
            return true;
        } catch (error) {
            console.error("Fetch error:", error);
            var loginError = document.getElementById("login-error");
            loginError.textContent = "Unable to retrieve your profile. Please try again.";
            loginError.style.display = "block";
            document.getElementById("login-screen").style.display = "flex";
            return false;
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

        var requiredProfileFields = [
            fullName,
            course,
            yearLevel,
            document.getElementById("input-about").value.trim(),
            document.getElementById("input-about-intro").value.trim(),
            document.getElementById("input-about-details").value.trim(),
            document.getElementById("input-about-personality").value.trim(),
            document.getElementById("input-interests").value.trim(),
            document.getElementById("input-education").value.trim(),
            document.getElementById("input-goals").value.trim()
        ];
        if (requiredProfileFields.some(function (value) { return !value; })) {
            setMessage("Complete all required profile fields before saving.", false);
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
                headers: authHeaders(),
                body: JSON.stringify(updatedPayload)
            });

            var result = await response.json();

            if (response.ok) {
                setMessage("Profile Updated Successfully", true);
                await fetchProfile(studentId);
                setTimeout(closeEditForm, 1500); // Close form after 1.5 seconds
            } else {
                setMessage(result.error || "Unable to update profile.", false);
            }
        } catch (error) {
            console.error("Save error:", error);
            setMessage("Database connection failed.", false);
        }
    }

    async function deleteProfile() {
        var studentId = localStorage.getItem("authenticated_student_id");
        if (!studentId || !window.confirm("Delete this student account and its profile permanently?")) return;

        try {
            var response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
                method: "DELETE",
                headers: authHeaders()
            });
            var result = response.status === 204 ? {} : await response.json();
            if (!response.ok) throw new Error(result.error || "Unable to delete student profile.");
            clearAuthentication();
            window.location.replace("index.html");
        } catch (error) {
            setMessage(error.message || "Unable to delete student profile.", false);
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
                headers: authHeaders(),
                body: JSON.stringify(currentProfileData)
            });

            if (response.ok) {
                console.log("Photo successfully saved to database!");
            } else {
                alert("Unable to save your profile picture. Please try again.");
            }
        } catch (error) {
            console.error("Failed to upload photo to database:", error);
            alert("Unable to save your profile picture. Please try again.");
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
        document.getElementById("register-form").addEventListener("submit", handleRegister);
        document.getElementById("show-register").addEventListener("click", function () {
            document.getElementById("login-form").style.display = "none";
            document.getElementById("show-register").style.display = "none";
            document.getElementById("register-panel").classList.remove("hidden");
        });
        document.getElementById("show-login").addEventListener("click", function () {
            document.getElementById("register-panel").classList.add("hidden");
            document.getElementById("register-error").style.display = "none";
            document.getElementById("login-form").style.display = "block";
            document.getElementById("show-register").style.display = "block";
        });
        document.getElementById("btn-edit").addEventListener("click", openEditForm);
        document.getElementById("btn-cancel").addEventListener("click", closeEditForm);
        document.getElementById("edit-profile-form").addEventListener("submit", saveProfile);
        document.getElementById("btn-delete-profile").addEventListener("click", deleteProfile);

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