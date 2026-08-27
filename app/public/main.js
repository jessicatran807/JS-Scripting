/*
Main client side code  
*/

function setupAuth() {

    let loginView = document.getElementById("login-view");
    let signupView = document.getElementById("signup-view");
    let showSignupLink = document.getElementById("show-signup-link");
    let showLoginLink = document.getElementById("show-login-link");

    signupView.style.display = "none";
    showSignupLink.addEventListener("click", (event) => {
        event.preventDefault(); 
        loginView.style.display = "none";
        signupView.style.display = "block";
    });

    showLoginLink.addEventListener("click", (event) => {
        event.preventDefault();
        signupView.style.display = "none";
        loginView.style.display = "block";
    });
}

function setupAuthForms() {
    let loginButton = document.getElementById("login-button");
    let signupButton = document.getElementById("signup-button");

    loginButton.addEventListener("click", () => {
        let email = document.getElementById("login-username-input").value;
        let password = document.getElementById("login-password-input").value;

        fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password })
        }).then((response) => {
            return response.json();
        }).then((result) => {
            let messageElem = document.getElementById("login-message");
            if (result.error) {
                messageElem.textContent = "Login failed: " + result.error;
            } else {
                messageElem.textContent = "Logged in! Go to the editor.";
                window.location = "/projects";
            }
        });
    });

    signupButton.addEventListener("click", () => {
        let email = document.getElementById("signup-username-input").value;
        let password = document.getElementById("signup-password-input").value;

        fetch("/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password })
        }).then((response) => {
            return response.json();
        }).then((result) => {
            let messageElem = document.getElementById("signup-message");
            if (result.error) {
                messageElem.textContent = "Signup failed: " + result.error;
            } else {
                messageElem.textContent = "Account created! Go to the editor.";
            }
        });
    });
}

function setupNavAuthStatus() {
    let statusElem = document.getElementById("nav-auth-status");
    statusElem.textContent = "";

    fetch("/current-user").then((response) => {
        if (response.ok) {
            return response.json().then((result) => {
                statusElem.textContent = "User: " + result.user.email + " ";

                let logoutButton = document.createElement("button");
                logoutButton.textContent = "Logout";
                logoutButton.addEventListener("click", () => {
                    fetch("/logout", { method: "POST" }).then(() => {
                        setupNavAuthStatus();
                    });
                });
                statusElem.append(logoutButton);
            });
        } else {
            statusElem.textContent = "You are not logged in";
        }
    });
}

setupNavAuthStatus();
setupAuth();
setupAuthForms();