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

let csrf = null;
let cookies = document.cookie.split(";");
cookies.forEach(element => {
    let key = element.split("=")[0].trim();
    let value = element.split("=")[1];
    if (key === "csrftoken") {
        csrf = value;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const addBookForm = document.querySelector(".add_books"); // Use querySelector for a single form
    
    if (!addBookForm) {
        console.error("Add Book form not found!");
        return;
    }

    addBookForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent the default form submission
        const params = new URLSearchParams(window.location.search);
        const id = params.get("book_id");
        if (!id) {
            // Get form values
            const title = document.getElementById("book_title").value;
            const author = document.getElementById("author_name").value;
            const genre = document.getElementById("book_category").value;
            const coverUrl = document.getElementById("cover_url").value;
            const description = document.getElementById("book_description").value;
    
            // Create a new book object
            const newBook = {
                title: title,
                author: author,
                category: genre,
                cover_url: coverUrl, // Correct variable name
                description:description,
            };
    
        
            $.ajax({
                url: 'http://127.0.0.1:8000/books/add_book/', // Change to your actual endpoint
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(newBook),
                headers: {
                    'X-CSRFToken': csrf
                },
                xhrFields: { withCredentials: true },
                
                success: function(response) {
                    showAlert("Book added successfully!");
                    closeAlert();
                // window.location.href = "admin_books.html";
                },
                error: function(xhr) {
                    showAlert("Failed to add book to the database.");
                closeAlert();
                }
            });
            console.log("New Book:", newBook); // Debugging log
            
        }
        
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const addBookForm = document.querySelector(".add_books");
    if (!addBookForm) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("book_id");
    console.log(id);

    // If editing, fetch book data from the database and populate form fields
    if (id) {
        console.log("Editing book with ID:", id);
        $.ajax({
            url: `http://127.0.0.1:8000/books/get_book/?book_id=${id}`,
            method: "GET",
            contentType: 'application/json',
            headers: {
                'X-CSRFToken': csrf
            },
            xhrFields: { withCredentials: true },

            success: function(book) {
                if (document.getElementById("book_id")) document.getElementById("book_id").value = book.id || "";
                document.getElementById("book_title").value = book.title || "";
                document.getElementById("author_name").value = book.author || "";
                document.getElementById("book_category").value = book.category || book.genre || "";
                document.getElementById("cover_url").value = book.image_url || book.cover_url || "";
                document.getElementById("book_description").value = book.description || "";
            },
            error: function() {
                alert("Failed to fetch book data from database.");
            }
        });
    }
    else {
        return;
    }


    // Handle form submission for add/edit
    addBookForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const bookData = {
            title: document.getElementById("book_title").value,
            author: document.getElementById("author_name").value,
            category: document.getElementById("book_category").value,
            cover_url: document.getElementById("cover_url").value,
            description: document.getElementById("book_description").value,
        };
        console.log('bookData', bookData);
        if (id) {
            // Update existing book
            console.log('🚀🚀🚀🚀')
            $.ajax({
                url: `http://127.0.0.1:8000/books/edit_book/?book_id=${id}`,
                method: "PUT",
                contentType: 'application/json',
                data: JSON.stringify(bookData),
                headers: {
                    'X-CSRFToken': csrf
                },
                xhrFields: { withCredentials: true },
                success: function() {
                    alert("Book updated successfully!");
                    window.location.href = "admin_books.html";
                },
                error: function() {
                    console.error("Error updating book:", error);
                    alert("Failed to update book in the database.");
                }
            });
        }
    });
});