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

setupAuth();