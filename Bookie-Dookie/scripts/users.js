function showAlert(message) {
    const alertDiv = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.innerText = message;
    alertDiv.classList.remove('hidden');
}

function closeAlert() {
    const alertDiv = document.getElementById('customAlert');
    alertDiv.classList.add('hidden');
}


document.addEventListener('DOMContentLoaded', function() {
    const signUpForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    if (signUpForm) {
        document.getElementById('sign_bnt').addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default form submission

            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const email = document.getElementById('email').value;
            const userName = document.getElementById('user-name').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPass').value;
            const role = document.getElementById('roleToggle').checked;
            // Check if the password is at least 8 characters long
            if (password.length < 8) {
                alert("Password must be at least 8 characters long.");
                return;
            }
            // check if the email is valid
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                alert("Please enter a valid email address.");
                //closeAlert();
                return;
            }
            // confirm password
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                //closeAlert();
                return;
            }
            signUpUser(firstName, lastName, email, userName, password, role);
        });
    }

    function signUpUser(firstName, lastName, email, userName, password, role) {
        const user = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            username: userName,
            password: password,
            is_staff: role,

        };
        let csrf = null;
        let cookies = document.cookie.split(";");
        cookies.forEach(element => {
            let key = element.split("=")[0].trim();
            let value = element.split("=")[1];
            if (key === "csrftoken") {
                csrf = value;
            }
        }); 
        $.ajax({
            url: 'http://127.0.0.1:8000/users/signup/',
            method:'POST',
            contentType: 'application/json',
            headers: {
                "X-CSRFToken": csrf 
            },
            xhrFields: {
                withCredentials: true
            },
            contentType: 'application/json',
            data: JSON.stringify(user),
            xhrFields: {
                withCredentials: true
            },
            success: function (response) {
                    console.log('🚀🚀🚀🚀')
                    alert("Registration successful! You can now log in.");
                    window.location.href = "login.html";
                },
                error: function (xhr) {
                    let msg = "Registration failed.";
                    if (xhr.responseJSON && xhr.responseJSON.detail) {
                        msg = xhr.responseJSON.detail;
                    }
                    alert(msg);
                }     
        });
        console.log('🎂🎂🎂🎂🎂🎂')
    }
    if (loginForm) {
        document.getElementById("login_bnt").addEventListener("click", function(event) {
            event.preventDefault(); // Prevent the default form submission
            const userName = document.getElementById("Username").value;
            const password = document.getElementById("password").value;
            signInUser(userName, password);
        });
    }

    function signInUser(userName, password) {
        const user = {
            username: userName,
            password: password
        };

        if (user) {
            let csrf = null;
            let cookies = document.cookie.split(";");
            cookies.forEach(element => {
                let key = element.split("=")[0].trim();
                let value = element.split("=")[1];
                if (key === "csrftoken") {
                    csrf = value;
                }
            });
            $.ajax({
                url: 'http://127.0.0.1:8000/users/login/',
                method: 'POST',
                headers: {
                    "X-CSRFToken": csrf 
                },
                xhrFields: {
                    withCredentials: true
                },
                contentType: 'application/json',
                data: JSON.stringify(user),
                xhrFields: {
                    withCredentials: true
                },
                success: function (response) {
                    if (response.is_staff === 1 || response.is_staff === true) {
                        window.location.href = "dashboard.html";
                    } else {
                        window.location.href = "index.html";
                    }
                },
                error: function (xhr) {
                    let msg = "Invalid username or password.";
                    if (xhr.responseJSON && xhr.responseJSON.detail) {
                        msg = xhr.responseJSON.detail;
                    }
                    alert(msg);
                }
            });
        } 
        else {
            alert('Invalid username or password!');
            
        }
    }
});

