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


function getUsers() {
    let csrf = null;
    let cookies = document.cookie.split(";");
    cookies.forEach(element => {
        let key = element.split("=")[0].trim();
        let value = element.split("=")[1];
        if (key === "csrftoken") {
            csrf = value;
        }
    });
    return $.ajax({
        url: 'http://127.0.0.1:8000/dashboard/get_users/',
        method: 'GET',
        xhrFields: { withCredentials: true },
        headers: {
            'X-CSRFToken': csrf
        },
    });
}
function getBooks() {
    let csrf = null;
    let cookies = document.cookie.split(";");
    cookies.forEach(element => {
        let key = element.split("=")[0].trim();
        let value = element.split("=")[1];
        if (key === "csrftoken") {
            csrf = value;
        }
    });
    return $.ajax({
        url: 'http://127.0.0.1:8000/books/get_book/',
        method: 'GET',
        xhrFields: { withCredentials: true },
        headers: {
            'X-CSRFToken': csrf
        },
    });
}

// Example usage with Promise:
function updateAdminDashboard() {
    // Get users from backend (async)
    getUsers().then(function(users) {
        // Calculate total users
        const totalUsers = users.length;
        const totalUsersElement = document.querySelector(".totalusers_count");
        console.log("Users data fetched successfully:", users);
        if (totalUsersElement) totalUsersElement.innerText = totalUsers;

    }).catch(function() {
        console.error("Failed to fetch users from backend.");
    });
    getBooks().then(function(books) {
        const totalBooks = books.length;
        const totalBooksElement = document.querySelector(".totalbooks_count");
        // Calculate total borrowed books
        const totalBorrowedBooks = books.filter(book => book.book_state === false).length;
        const totalBorrowedBooksElement = document.querySelector(".totalborrowed_count");
        if (totalBooksElement) totalBooksElement.innerText = totalBooks;
        if (totalBorrowedBooksElement) totalBorrowedBooksElement.innerText = totalBorrowedBooks;
        
    });    
    }

// Call updateAdminDashboard when needed, e.g. on DOMContentLoaded for dashboard.html

let currentPage = 1; // Track the current page
const rowsPerPage = 15; // Number of rows to display per page

function populateCurrentUsersTable() {
    // Retrieve users from database
    getUsers().then(function(users) {
        users_list = users;
        
        const tableBody = document.querySelector(".records_table tbody");
    
        // Get the table body element
        if (!tableBody) {
            console.error("Table body not found!");
            return;
        }
    
        // Clear any existing rows
        tableBody.innerHTML = "";
    
        // Calculate the start and end indices for the current page
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
    
        // Get the users for the current page
        const usersToDisplay = users_list.slice(startIndex, endIndex);
    
        // Loop through users and create table rows
        usersToDisplay.forEach((user, index) => {
            const row = document.createElement("tr");
    
            row.innerHTML = `
                <td>${startIndex + index + 1}</td>
                <td>${user.first_name} ${user.last_name}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
            `;
    
            // Append the row to the table body
            tableBody.appendChild(row);
        });
    
        // Update the page info
        updatePageInfo(users_list.length);
    }).catch(function() {
        console.error("Failed to fetch users from backend.");
    });
    
}

function updatePageInfo(totalUsers) {
    const totalPages = Math.ceil(totalUsers / rowsPerPage);

    // Update the page info display
    const pageInfo = document.querySelector(".pages p");
    if (pageInfo) {
        pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
    }

    // Enable or disable the buttons based on the current page
    const prevButton = document.querySelector(".prev_button");
    const nextButton = document.querySelector(".next_button");

    if (prevButton) prevButton.disabled = currentPage === 1;
    if (nextButton) nextButton.disabled = currentPage === totalPages;
}

let currentBookPage = 1; // Track the current page for the book list table

function populateBookListTable() {

    getBooks().then(function(books){
        const tableBody = document.querySelector(".records_table tbody");

        console.log("Books data fetched successfully:", books);
        // Clear any existing rows
        tableBody.innerHTML = "";
    
        // Calculate the start and end indices for the current page
        const startIndex = (currentBookPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        console.log(startIndex, " ", endIndex);
    
        // Get the books for the current page
        const booksToDisplay = books.slice(startIndex, endIndex);
        console.log("Books to display:", booksToDisplay);
        // Loop through books and create table rows
        booksToDisplay.forEach((book, index) => {
            const row = document.createElement("tr");
            console.log('🚀🚀🚀🚀🚀🚀🚀');
            // Determine the book status
            const bookStatus = book.book_state === true ? "On Shelf" : "Borrowed";
            const bookStatusClass = book.book_state === true ? "inshelf" : "borrowed";
    
            row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.category}</td>
            <td><div class = "${bookStatusClass}">${bookStatus}</div></td>
            <td class="action-buttons">
                <button class="edit-btn">
                    <img src="icons/edit.svg" alt="Edit" class="action-icon">
                </button>
                <button class="delete-btn">
                    <img src="icons/delete.svg" alt="Delete" class="action-icon">
                </button>
            </td>
    
        `;
    
        // Append the row to the table body
        tableBody.appendChild(row);
    });
    
    const deleteButtons = document.querySelectorAll(".delete-btn");
    const editButtons = document.querySelectorAll(".edit-btn");

    deleteButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        const bookId = booksToDisplay[index].id;
        console.log("Book ID to delete:", bookId);
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
            url: `http://127.0.0.1:8000/books/delete_book/?book_id=${bookId}`,
            method: "DELETE",
            contentType: 'application/json',
            headers: {
                'X-CSRFToken': csrf
            },
            xhrFields: { withCredentials: true },
            success: function() {
                showAlert(`Book deleted successfully!`);
                closeAlert();
                populateBookListTable();
            },
            error: function() {
                alert("Failed to delete book from database.");
            }
        });
    });
});

    editButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            const bookId = booksToDisplay[index].id;
            // Redirect to add_books.html with the book ID as a query parameter
            window.location.href = `add_books.html?book_id=${bookId}`;
        });
    });

    // Update the page info for the book list table
    updateBookPageInfo(books.length);


    }).catch(function() {
        console.error("Failed to fetch books from backend.");
    }
    );

}

function updateBookPageInfo(totalBooks) {
    const totalPages = Math.ceil(totalBooks / rowsPerPage);

    // Update the page info display
    const pageInfo = document.querySelector(".pages p");
    if (pageInfo) {
        pageInfo.innerText = `Page ${currentBookPage} of ${totalPages}`;
    }

    // Enable or disable the buttons based on the current page
    const prevButton = document.querySelector(".left_arrow");
    const nextButton = document.querySelector(".right_arrow");

    if (prevButton) prevButton.disabled = currentBookPage === 1;
    if (nextButton) nextButton.disabled = currentBookPage === totalPages;
}

// Attach event listeners to the pagination buttons
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("admin_books.html")) {
        console.log("Admin Books page loaded!");
        populateBookListTable(); // Populate the book list table

        const prevButton = document.querySelector(".left_arrow");
        const nextButton = document.querySelector(".right_arrow");

        if (prevButton) {
            prevButton.addEventListener("click", () => {
                getBooks().then(function(books) {
                    const totalPages = Math.ceil(books.length / rowsPerPage);
                    if (currentBookPage > 1) {
                        currentBookPage--;
                        populateBookListTable();
                    }
                });
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", () => {
                getBooks().then(function(books) {
                    const totalPages = Math.ceil(books.length / rowsPerPage);
                    if (currentBookPage < totalPages) {
                        currentBookPage++;
                        populateBookListTable();
                    }
                });
            });
        }
    }
});


// Attach event listeners to the existing buttons
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("dashboard.html")) {
        console.log("Admin Dashboard loaded!");
        updateAdminDashboard();
        populateCurrentUsersTable(); // Populate the current users table

        // Attach event listeners to the pagination buttons
        const prevButton = document.querySelector(".left_arrow");
        const nextButton = document.querySelector(".right_arrow");
    
        if (prevButton) {
            prevButton.addEventListener("click", () => {
                if (currentPage > 1) {
                    currentPage--;
                    populateCurrentUsersTable();
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", () => {
                const users = JSON.parse(localStorage.getItem("users")) || [];
                const totalPages = Math.ceil(users.length / rowsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    populateCurrentUsersTable();
                }
            });
        }
        
    }
});


