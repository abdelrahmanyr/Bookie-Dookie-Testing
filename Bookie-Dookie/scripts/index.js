document.addEventListener("DOMContentLoaded", function() {
    const headerElements = document.getElementsByTagName("header");
    if (headerElements.length > 0) {
        const header = headerElements[0];
        const body = document.body;
        header.style.height = body.scrollHeight + "px"; 
        header.style.position = "absolute"; // Ensure header is positioned relative
        console.log(header.style.height);
    }
});

function searchBar() {
    
    const searchBar = document.getElementsByClassName("search_bar");
    const searchForm = document.getElementsByClassName("search_form");
    searchForm[0].style.display = "flex";
    searchBar[0].remove();

}

let csrf = null;
let cookies = document.cookie.split(";");
cookies.forEach(element => {
    let key = element.split("=")[0].trim();
    let value = element.split("=")[1];
    if (key === "csrftoken") {
        csrf = value;
    }
});


document.addEventListener("DOMContentLoaded", function() {
    // Check user state from backend
    $.ajax({
        url: 'http://127.0.0.1:8000/users/get_user_role/', // Change to your actual endpoint
        method: 'GET',
        xhrFields: { withCredentials: true },
        headers: {
            'X-CSRFToken': csrf
        },
        success: function(user) {
            // User is logged in, update UI
            loggedIn(user);
        },
        error: function() {
            // User is not logged in, show login/signup
            showLoggedOutUI();
        }
    });
});

function loggedIn(user) {
    // Hide the "Sign Up" and "Log In" buttons
    const loginButton = document.querySelector(".login_btn");
    const signupButton = document.querySelector(".signup_btn");
    const createAccountButton = document.querySelector(".create_account");

    if (loginButton) loginButton.style.display = "none";
    if (signupButton) signupButton.style.display = "none";
    if (createAccountButton) createAccountButton.style.display = "none";


            
    const searchBar = document.getElementsByClassName("search_bar")[0];
    const searchForm = document.getElementsByClassName("search_form")[0];
    searchForm.style.display = "flex";
    const searchParent = document.getElementsByClassName("icons")[0];
    searchParent.removeChild(searchBar);
    // const searchBarForm = document.createElement("form");
    // searchBarForm.className = "search_bar";
    // searchBarForm.innerHTML = `
    //                 <input type="text" placeholder="Search for books...">
    //                 <button type="submit"><img src="icons/search_vec.svg" alt="Search"></button>
    //                 `;
    // searchParent.insertBefore(searchBarForm, searchParent.children[0]);

    const profileDiv = document.createElement("div");
    profileDiv.className = "profile_menu";
    
    profileDiv.innerHTML = `
    <div class="profile_btn">
        <img src="icons/profile.svg" alt="Profile Icon" class="profile_icon" onclick="toggleDropdown()">
    </div>
    <div class="profile_dropdown" id="profileDropdown">
        <ul>
            <li>
                <a href="mybooks.html">
                    <div class="menu_item">
                        <span>My Books</span>
                        <img src="assets/ph_books.png" alt="Books Icon">
                    </div>
                </a>
            </li>
            <div class="line"></div>
            <li>
                <a href="wishlist.html">
                    <div class="menu_item">
                        <span>Wishlist</span>
                        <img src="assets/mynaui_heart-solid.png" alt="Wishlist Icon">
                    </div>
                </a>
            </li>
            <div class="line"></div>
            <li>
                <a onclick="logout()">
                    <div class="menu_item">
                        <span>Log Out</span>
                        <img src="assets/Vector.png" alt="Log Out Icon">
                    </div>
                </a>
            </li>
        </ul>
    </div>
    `;

    searchParent.appendChild(profileDiv)
}

function logout() {
    $.ajax({
        url: 'http://127.0.0.1:8000/users/logout/', // Change to your actual endpoint
        method: 'POST',
        xhrFields: { withCredentials: true },
        headers: {
            'X-CSRFToken': csrf
        },
        success: function() {
            // Successfully logged out, redirect to login page
            window.location.href = "index.html";
            showLoggedOutUI();
        },
        error: function() {
            // Handle error if needed
            alert("Error logging out. Please try again.");
        }
    });
}

function showLoggedOutUI() {
    // Show login/signup, hide profile menu, etc.
    const loginButton = document.querySelector(".login_btn");
    const signupButton = document.querySelector(".signup_btn");
    const createAccountButton = document.querySelector(".create_account");
    if (loginButton) loginButton.style.display = "";
    if (signupButton) signupButton.style.display = "";
    if (createAccountButton) createAccountButton.style.display = "";
    // Optionally remove/hide profile menu if present
    const profileMenu = document.querySelector(".profile_menu");
    if (profileMenu) profileMenu.style.display = "none";
}

function toggleDropdown() {
    const menu = document.getElementsByClassName("profile_dropdown")[0];
    menu.classList.toggle("show");
}