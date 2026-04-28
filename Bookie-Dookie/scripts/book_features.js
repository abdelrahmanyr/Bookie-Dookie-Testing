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

function getWishlist(){
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
        url: 'http://127.0.0.1:8000/users/get_wishlist/',
        method: 'GET',
        headers: {
            "X-CSRFToken": csrf 
        },
        xhrFields: {
            withCredentials: true
        },
        contentType: 'application/json',
        
    });
}
function getBooks(bookId) {
    let csrf = null;
    let cookies = document.cookie.split(";");
    cookies.forEach(element => {
        let key = element.split("=")[0].trim();
        let value = element.split("=")[1];
        if (key === "csrftoken") {
            csrf = value;
        }
    });
    if(bookId === null){        
        return $.ajax({
            url: 'http://127.0.0.1:8000/books/get_book/',
            method: 'GET',
            headers: {
                "X-CSRFToken": csrf 
            },
            xhrFields: {
                withCredentials: true
            },
            contentType: 'application/json',
        });
    }
    else {
        return $.ajax({
            url: `http://127.0.0.1:8000/books/get_book/?book_id=${bookId}`,
            method: 'GET',
            headers: {
                "X-CSRFToken": csrf 
            },
            xhrFields: {
                withCredentials: true
            },
            contentType: 'application/json',
        });
        
    }

}

function getMyBooks(){
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
        url: 'http://127.0.0.1:8000/users/get_borrow/',
        method:'GET',
        headers: {
            "X-CSRFToken": csrf 
        },
        xhrFields: {
            withCredentials: true
        },
        contentType: 'application/json',
    })
}


function getBooksAndWishlist() {
    return Promise.all([getBooks(null), getWishlist()])
}

// Function to display books on the page
function displayBooks(books, wishlist) {
    const booksContainer = document.querySelector("#available_books");
    if (!booksContainer) {
        console.error("Books container not found!");
        return;
    }

    if (books.length === 0) {
        booksContainer.remove();
        return;
    }
    else {
        const errorMessage = document.querySelector(".noBook");
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    booksContainer.innerHTML = ""; // Clear any existing content

    books.forEach((book) => {
        const bookElement = document.createElement("div");
        bookElement.className = "frame";
        bookElement.id = book.id;

        
        // const isInWishlist = wishlist.includes(book);
        const isInWishlist = wishlist.some(wishBook => wishBook.id === book.id);

        const buttonClass = book.book_state === true ? "borrow_button" : "borrowed_button";
        const buttonText = book.book_state === true ? "Borrow" : "Borrowed";
        const heartClass = isInWishlist ? "heart-fill" : "heart-nofill";
        const heartIcon = isInWishlist ? "icons/heart_fill.svg" : "icons/heart_nofill.svg";

        bookElement.innerHTML = `
            <img src="${book.cover_url}" alt="${book.title}" class="book_image clickable">
            <div class="book_details">
                <h2 class="book_title clickable">${book.title}</h2>
                <p class="author">${book.author}</p>
                <p class="genre">${book.category}</p>
            </div>
            <div class="borrowed-container">
                <div class="borrowed">
                    <button class="${buttonClass}">${buttonText}</button>
                </div>
                <div class="heart-button">
                    <button class="${heartClass}">
                        <img src="${heartIcon}" alt="heart">
                    </button>
                </div>
            </div>
        `;

        // Add click event for book image and title
        bookElement.querySelector(".book_image").addEventListener("click", () => navigateToBookDetails(book));
        bookElement.querySelector(".book_title").addEventListener("click", () => navigateToBookDetails(book));

        booksContainer.appendChild(bookElement);
    });
}

function navigateToBookDetails(book) {
    // Redirect to the book_details.html page with the book id as a URL parameter
    window.location.href = `book_details.html?book_id=${book.id}`;
}




function displayMyBooks(books) {
    const myBooksContainer = document.querySelector(".section1");
    if (!myBooksContainer) {
        console.error("My Books container not found!");
        return;
    }

    myBooksContainer.innerHTML = ""; // Clear any existing content

    books.forEach((book_obj) => {
        const book = book_obj.book;
        const bookElement = document.createElement("div");
        bookElement.className = "frame";
        bookElement.id = book.id; // Set the book ID for reference

        // Parse and format the borrow date
        const borrowDateObj = new Date(book_obj.borrow_date);
        const borrowDateFormatted = borrowDateObj.toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Calculate return date (14 days after borrow date)
        const returnDateObj = new Date(borrowDateObj);
        returnDateObj.setDate(returnDateObj.getDate() + 14);
        const returnDateFormatted = returnDateObj.toLocaleDateString('en-GB');

        bookElement.innerHTML = `
            <img src="${book.cover_url}" alt="${book.title}" class="book_image">
            <div class="book_details">
                <h2 class="book_title">${book.title}</h2>
                <p class="author">${book.author}</p>
                <p class="genre">${book.category}</p>
            </div>
            <div class="divider"></div>
            <div class="borrowdate">
                <h2>Borrow Date</h2>
                <p class="date"><br>${borrowDateFormatted}</p>
            </div>
            <div class="divider"></div>
            <div class="returndate">
                <h2>Return Date</h2>
                <p class="date">${returnDateFormatted}<br></p>
                <button alt="Return Book" class="return_btn">
                    Return
                </button>
            </div>
        `;

        bookElement.querySelector(".return_btn").addEventListener("click", () => {
            returnBook(book.id);
        });
        myBooksContainer.appendChild(bookElement);
    });
}

// Function to display the wishlist on the page
function displayWishlist(books, wishlist) {
    const wishlistContainer = document.querySelector("#wishlist_books");
    if (!wishlistContainer) {
        console.error("Wishlist container not found!");
        return;
    }
    if (wishlist.length === 0) {
        wishlistContainer.remove("#wishlist_books");
        return;
    }
    else {
        const errorMessage = document.querySelector(".noBook");
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // Filter books to only include those in the wishlist

    wishlistContainer.innerHTML = ""; // Clear any existing content

    wishlist.forEach((book) => {
        const bookElement = document.createElement("div");
        bookElement.className = "frame";
        bookElement.id = book.id; // Set the book ID for reference

        // Determine the button class and text based on the book_state
        const buttonClass = book.book_state === true ? "borrow_button" : "borrowed_button";
        const buttonText = book.book_state === true ? "Borrow" : "Borrowed";

        // Heart icon should always be filled in wishlist
        const heartClass = "heart-fill";
        const heartIcon = "icons/heart_fill.svg";

        bookElement.innerHTML = `
            <img src="${book.cover_url}" alt="${book.title}" class="book_image clickable">
            <div class="book_details">
                <h2 class="book_title clickable">${book.title}</h2>
                <p class="author">${book.author}</p>
                <p class="genre">${book.category}</p>
            </div>
            <div class="borrowed-container">
                <div class="borrowed">
                    <button class="${buttonClass}">${buttonText}</button>
                </div>
                <div class="heart-button">
                    <button class="${heartClass}">
                        <img src="${heartIcon}" alt="heart">
                    </button>
                </div>
            </div>
        `;

        // Add click event for book image and title
        bookElement.querySelector(".book_image").addEventListener("click", () => navigateToBookDetails(book));
        bookElement.querySelector(".book_title").addEventListener("click", () => navigateToBookDetails(book));

        wishlistContainer.appendChild(bookElement);
    });
}


// Function to handle the return book button click
function returnBook(bookId) {
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
        url: `http://127.0.0.1:8000/users/return/?book_id=${bookId}`,
        method: 'DELETE', // or 'PUT' or 'DELETE' depending on your backend
        headers: {
            "X-CSRFToken": csrf
        },
        xhrFields: {
            withCredentials: true
        },
        contentType: 'application/json',
        success: function(response) {
            showAlert("Book returned successfully!");
            // Refresh the borrowed books list
            getMyBooks().then((books) => {
                displayMyBooks(books);
            });
        },
        error: function(xhr, status, error) {
            showAlert("Error returning the book!");
        }
    });
}



document.addEventListener('DOMContentLoaded', function () {
    const booksContainer = document.querySelector("#available_books");
    const wishlistContainer = document.querySelector("#wishlist_books");
    
    // Event listener for books and wishlist containers
    if (booksContainer || wishlistContainer) {
        const container = booksContainer || wishlistContainer;
        
        container.addEventListener('click', function (event) {
            // Handle borrow button click
            if (event.target.classList.contains('borrow_button')) {
                const bookId = event.target.closest('.frame').id;
                borrowBook(bookId)
            }
            
            // Handle wishlist button click
            if (event.target.classList.contains('heart-nofill') || event.target.classList.contains('heart-fill')) {
                const bookId = event.target.closest('.frame').id;
                let wish = null;
                if (event.target.classList.contains('heart-nofill')) {
                    wish = 0;
                }
                else if (event.target.classList.contains('heart-fill')) {
                    wish = 1;
                }
                toggleWishlist(bookId, wish);
            }
        });
    }
});

function borrowBook(bookId) {
    const booksContainer = document.querySelector("#available_books");
    const wishlistContainer = document.querySelector("#wishlist_books");
    
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
        url: `http://127.0.0.1:8000/users/borrow/?book_id=${bookId}`,
        method: 'POST',
        headers: {
            "X-CSRFToken": csrf 
        },
        xhrFields: {
            withCredentials: true
        },
        contentType: 'application/json',
        success: function(response) {
            showAlert("Book borrowed successfully!");
            // Books and wishlist update
            if (booksContainer) {
                getBooksAndWishlist().then(([books, wishlist]) => {
                    displayBooks(books, wishlist);
                });
            }
            if (wishlistContainer) {
                getBooksAndWishlist().then(([books, wishlist]) => {
                    displayWishlist(books, wishlist);
                });
            }
            // Book details update
            if (window.location.pathname.includes("book_details.html")) {
                Promise.all([getBooks(bookId), getWishlist()]).then(([updatedBook, updatedWishlist]) => {
                    renderBookDetails(updatedBook, updatedWishlist);
                });
            }
        },
        error: function(xhr, status, error) {
            // Handle error response
            console.error("Error borrowing book:", error);
            showAlert("You need to Login First!");
        }
    })
    
}

function toggleWishlist(bookId, wish) {
    const booksContainer = document.querySelector("#available_books");
    const wishlistContainer = document.querySelector("#wishlist_books")
    let csrf = null;
    let cookies = document.cookie.split(";");
    cookies.forEach(element => {
        let key = element.split("=")[0].trim();
        let value = element.split("=")[1];
        if (key === "csrftoken") {
            csrf = value;
        }
    });
    
    if (wish === 0) {
        $.ajax({
            url: `http://127.0.0.1:8000/users/wishlist/?book_id=${bookId}`,
            method: 'POST',
            headers: {
                "X-CSRFToken": csrf 
            },
            xhrFields: {
                withCredentials: true
            },
            contentType: 'application/json',
            success: function(response) {
                // Handle success response
                showAlert("Book added to wishlist successfully!");
                // Refresh the displayed books or wishlist
                if (booksContainer) {
                    getBooksAndWishlist().then(([books, wishlist]) => {
                        displayBooks(books, wishlist);
                    });
                }
                if (wishlistContainer) {
                    getBooksAndWishlist().then(([books, wishlist]) => {
                        displayWishlist(books, wishlist);
                    });
                }
                if (window.location.pathname.includes("book_details.html")) {
                    Promise.all([getBooks(bookId), getWishlist()]).then(([updatedBook, updatedWishlist]) => {
                        renderBookDetails(updatedBook, updatedWishlist);
                    });
                }
            },
            error: function(xhr, status, error) {
                // Handle error response
                console.error("Error liking book:", error);
                showAlert("You need to Login First!");
            }
        })
    }
    else if (wish === 1) {
        $.ajax({
            url: `http://127.0.0.1:8000/users/remove_wishlist/?book_id=${bookId}`,
            method: 'DELETE',
            headers: {
                "X-CSRFToken": csrf 
            },
            xhrFields: {
                withCredentials: true
            },
            contentType: 'application/json',
            success: function(response) {
                // Handle success response
                showAlert("Book removed from wishlist successfully!");
                // Refresh the displayed books or wishlist
                if (booksContainer) {
                    getBooksAndWishlist().then(([books, wishlist]) => {
                        displayBooks(books, wishlist);
                    });
                }
                if (wishlistContainer) {
                    getBooksAndWishlist().then(([books, wishlist]) => {
                        displayWishlist(books, wishlist);
                    });
                }
                // --- ADD THIS BLOCK ---
                if (window.location.pathname.includes("book_details.html")) {
                    Promise.all([getBooks(bookId), getWishlist()]).then(([updatedBook, updatedWishlist]) => {
                        renderBookDetails(updatedBook, updatedWishlist);
                    });
                }
            },
            error: function(xhr, status, error) {
                // Handle error response
                console.error("Error unliking book:", error);
                showAlert("Error removing book from wishlist!");
            }
        })
    }
}


function searchBooks(query, books, wishlist) {
    const booksContainer = document.querySelector("#available_books");
    if (!booksContainer) {
        console.error("Books container not found!");
        return;
    }
    
    const lowerCaseQuery = query.toLowerCase();
    
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(lowerCaseQuery) ||
        book.category.toLowerCase().includes(lowerCaseQuery) ||
        book.author.toLowerCase().includes(lowerCaseQuery)
    );
    
    getWishlist().then((wishlist) => {
        displayBooks(filteredBooks, wishlist);
    });
}

// Search Bar!!!
document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.querySelector(".search_form");
    if (!searchBar) return;
    
    // Books page
    if (window.location.pathname.includes("books.html")) {
        getBooksAndWishlist().then(([books, wishlist]) => {
            displayBooks(books, wishlist);
            searchBar.addEventListener("input", (event) => {
                const query = event.target.value.toLowerCase();
                const filteredBooks = books.filter(book =>
                    book.title.toLowerCase().includes(query) ||
                    book.category.toLowerCase().includes(query) ||
                    book.author.toLowerCase().includes(query)
                );
                displayBooks(filteredBooks, wishlist);
            });
        });
    }
    
    // Wishlist page
    if (window.location.pathname.includes("wishlist.html")) {
        getBooksAndWishlist().then(([books, wishlist]) => {
            displayWishlist(books, wishlist);
            searchBar.addEventListener("input", (event) => {
                const query = event.target.value.toLowerCase();
                // Filter only wishlist books
                const filteredWishlist = wishlist.filter(book =>
                    book.title.toLowerCase().includes(query) ||
                    book.category.toLowerCase().includes(query) ||
                    book.author.toLowerCase().includes(query)
                );
                displayWishlist(books, filteredWishlist);
            });
        });
    }
    
    // MyBooks page
    if (window.location.pathname.includes("mybooks.html")) {
        getMyBooks().then((books) => {
            displayMyBooks(books);
            searchBar.addEventListener("input", (event) => {
                const query = event.target.value.toLowerCase();
                const filteredBooks = books.filter(book_obj => {
                    const book = book_obj.book;
                    return (
                        book.title.toLowerCase().includes(query) ||
                        book.category.toLowerCase().includes(query) ||
                        book.author.toLowerCase().includes(query)
                    );
                });
                
                displayMyBooks(filteredBooks);
            });
        });
    }
});

function renderBookDetails(selectedBook, wishlist) {
    const bookDetailsContainer = document.querySelector("#frame_details");
    const descriptionContainer = document.querySelector(".description");

    if (!selectedBook || !bookDetailsContainer) {
        bookDetailsContainer.innerHTML = "<p>No book details available. Please select a book.</p>";
        return;
    }

    // Render book details
    bookDetailsContainer.innerHTML = `
        <img src="${selectedBook.cover_url}" alt="${selectedBook.title}" class="book_image">
        <div class="book_details">
            <h2 class="book-name">${selectedBook.title}</h2>
            <p class="author">${selectedBook.author}</p>
            <p class="genre">${selectedBook.category}</p>
        </div>
        <div class="borrowed-container">
            <div class="borrowed">
                <button id="borrowBtn" class="${selectedBook.book_state === false ? "borrowed_button" : "borrow_button"}">
                    ${selectedBook.book_state === false ? "Borrowed" : "Borrow"}
                </button>
            </div>
            <div class="heart-button">
                <button id="heartBtn" class="${wishlist.some(wishBook => wishBook.id === selectedBook.id) ? "heart-fill" : "heart-nofill"}">
                    <img id="heartImg" src="${wishlist.some(wishBook => wishBook.id === selectedBook.id) ? "icons/heart_fill.svg" : "icons/heart_nofill.svg"}" alt="heart">
                </button>
            </div>
        </div>
    `;

    // Render description
    if (descriptionContainer) {
        descriptionContainer.innerHTML = `
            <p class="genre">ID</p>
            <h2>${selectedBook.id}</h2>
            <p class="genre">Description</p>
            <p>${selectedBook.description}</p>
        `;
    }

    // Button logic (always re-attach after rendering)
    const borrowBtn = bookDetailsContainer.querySelector("#borrowBtn");
    const heartBtn = bookDetailsContainer.querySelector("#heartBtn");
    const heartImg = bookDetailsContainer.querySelector("#heartImg");

    borrowBtn.addEventListener("click", function () {
        if (borrowBtn.classList.contains("borrow_button")) {
            borrowBook(selectedBook.id);
            // After borrow, re-fetch and re-render (event listeners will be re-attached)
            Promise.all([getBooks(selectedBook.id), getWishlist()]).then(([updatedBook, updatedWishlist]) => {
                renderBookDetails(updatedBook, updatedWishlist);
            });
        }
    });

    heartBtn.addEventListener("click", function () {
        const isInWishlist = heartBtn.classList.contains("heart-fill");
        let wish = isInWishlist ? 1 : 0;
        toggleWishlist(selectedBook.id, wish);
        // After toggle, re-fetch and re-render (event listeners will be re-attached)
        Promise.all([getBooks(selectedBook.id), getWishlist()]).then(([updatedBook, updatedWishlist]) => {
            renderBookDetails(updatedBook, updatedWishlist);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("book_details.html")) {
        const params = new URLSearchParams(window.location.search);
        const bookId = params.get("book_id");

        // Initial render
        Promise.all([
            getBooks(bookId),
            getWishlist()
        ]).then(([selectedBook, wishlist]) => {
            renderBookDetails(selectedBook, wishlist);
        });
    }
});
