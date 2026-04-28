import pytest

from Books.models import Book
from Users.models import User


@pytest.mark.django_db
def test_add_book_saves_data(auth_client):
    # Arrange
    payload = {
        "title": "Refactoring",
        "author": "Martin Fowler",
        "category": "Software",
        "cover_url": "https://example.com/refactoring.jpg",
        "description": "Improving the design of existing code.",
    }

    # Act
    response = auth_client.post("/books/add_book/", payload, format="json")

    # Assert
    assert response.status_code == 201
    assert Book.objects.count() == 1
    book = Book.objects.first()
    assert book.title == payload["title"]
    assert book.author == payload["author"]
    assert book.category == payload["category"]
    assert book.cover_url == payload["cover_url"]
    assert book.description == payload["description"]


@pytest.mark.django_db
def test_edit_book_updates_fields(auth_client, book):
    # Arrange
    payload = {
        "title": "Clean Code 2nd",
        "author": "Robert C. Martin",
        "category": "Software",
        "cover_url": "https://example.com/clean-code-2.jpg",
        "description": "Updated edition.",
    }

    # Act
    response = auth_client.put(
        f"/books/edit_book/?book_id={book.id}", payload, format="json"
    )

    # Assert
    assert response.status_code == 200
    book.refresh_from_db()
    assert book.title == payload["title"]
    assert book.cover_url == payload["cover_url"]
    assert book.description == payload["description"]


@pytest.mark.django_db
def test_delete_book_removes_record(auth_client, book):
    # Arrange
    book_id = book.id

    # Act
    response = auth_client.delete(f"/books/delete_book/?book_id={book_id}")

    # Assert
    assert response.status_code == 200
    assert Book.objects.filter(id=book_id).exists() is False


@pytest.mark.django_db
def test_signup_rejects_duplicate_username(api_client):
    # Arrange
    payload = {
        "first_name": "Sam",
        "last_name": "Tester",
        "email": "sam@example.com",
        "username": "sam",
        "password": "password123",
        "is_staff": False,
    }
    api_client.post("/users/signup/", payload, format="json")

    # Act
    response = api_client.post("/users/signup/", payload, format="json")

    # Assert
    assert response.status_code == 400
    assert User.objects.filter(username="sam").count() == 1


@pytest.mark.django_db
def test_add_book_allows_duplicates_with_case_variations(auth_client):
    # Arrange
    payload_one = {
        "title": "Dune",
        "author": "Frank Herbert",
        "category": "Sci-Fi",
        "cover_url": "https://example.com/dune.jpg",
        "description": "Classic science fiction.",
    }
    payload_two = {
        "title": "  DUNE ",
        "author": "frank herbert",
        "category": "sci-fi",
        "cover_url": "https://example.com/dune-2.jpg",
        "description": "Duplicate with spacing/case changes.",
    }

    # Act
    response_one = auth_client.post("/books/add_book/", payload_one, format="json")
    response_two = auth_client.post("/books/add_book/", payload_two, format="json")

    # Assert
    assert response_one.status_code == 201
    assert response_two.status_code == 201
    assert Book.objects.count() == 2


@pytest.mark.django_db
def test_add_book_rejects_overlong_fields(auth_client):
    # Arrange
    payload = {
        "title": "T" * 101,
        "author": "A" * 101,
        "category": "C" * 101,
        "cover_url": "h" * 201,
        "description": "Valid description.",
    }

    # Act
    response = auth_client.post("/books/add_book/", payload, format="json")

    # Assert
    assert response.status_code == 400


@pytest.mark.django_db
def test_add_book_accepts_max_length_fields(auth_client):
    # Arrange
    payload = {
        "title": "T" * 100,
        "author": "A" * 100,
        "category": "C" * 100,
        "cover_url": "h" * 200,
        "description": "Boundary length fields.",
    }

    # Act
    response = auth_client.post("/books/add_book/", payload, format="json")

    # Assert
    assert response.status_code == 201
    assert Book.objects.filter(title=payload["title"]).exists() is True


@pytest.mark.django_db
def test_add_book_accepts_special_characters(auth_client):
    # Arrange
    payload = {
        "title": "C++ Primer: 5th Edition",
        "author": "Lippman, #1",
        "category": "Dev/Tools",
        "cover_url": "https://example.com/cpp-primer.jpg",
        "description": "Symbols: !@#$%^&*()_+[]{}|;:,.<>?",
    }

    # Act
    response = auth_client.post("/books/add_book/", payload, format="json")

    # Assert
    assert response.status_code == 201
    assert Book.objects.filter(title=payload["title"]).exists() is True


@pytest.mark.django_db
def test_add_book_rejects_whitespace_only_fields(auth_client):
    # Arrange
    payload = {
        "title": "   ",
        "author": "  ",
        "category": " ",
        "cover_url": "https://example.com/blank.jpg",
        "description": " ",
    }

    # Act
    response = auth_client.post("/books/add_book/", payload, format="json")

    # Assert
    assert response.status_code == 400


@pytest.mark.django_db
def test_edit_book_partial_payload_returns_400(auth_client, book):
    # Arrange
    payload = {"title": "Partial Update"}

    # Act
    response = auth_client.put(
        f"/books/edit_book/?book_id={book.id}", payload, format="json"
    )

    # Assert
    assert response.status_code == 400


@pytest.mark.django_db
def test_add_book_large_description_succeeds(auth_client):
    # Arrange
    payload = {
        "title": "Large Payload",
        "author": "Load Tester",
        "category": "Performance",
        "cover_url": "https://example.com/large.jpg",
        "description": "X" * 5000,
    }

    # Act
    response = auth_client.post("/books/add_book/", payload, format="json")

    # Assert
    assert response.status_code == 201
    book = Book.objects.get(title="Large Payload")
    assert len(book.description) == 5000
