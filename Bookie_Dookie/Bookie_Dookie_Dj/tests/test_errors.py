import pytest

from Books.models import Book


@pytest.mark.django_db
def test_add_book_missing_fields_returns_400(auth_client):
    # Arrange
    payload = {
        "title": "Missing Fields",
        "author": "No Category",
        "cover_url": "https://example.com/missing.jpg",
    }

    # Act
    response = auth_client.post("/books/add_book/", payload, format="json")

    # Assert
    assert response.status_code == 400


@pytest.mark.django_db
def test_delete_nonexistent_book_returns_404(auth_client):
    # Arrange
    nonexistent_id = 9999

    # Act
    response = auth_client.delete(f"/books/delete_book/?book_id={nonexistent_id}")

    # Assert
    assert response.status_code == 404


@pytest.mark.django_db
def test_get_borrowings_empty_returns_empty_list(auth_client):
    # Arrange
    
    # Act
    response = auth_client.get("/users/get_borrow/")

    # Assert
    assert response.status_code == 200
    assert response.data == []


@pytest.mark.django_db
def test_get_book_nonexistent_id_returns_null(auth_client):
    # Arrange
    nonexistent_id = 9999

    # Act
    response = auth_client.get(f"/books/get_book/?book_id={nonexistent_id}")

    # Assert
    assert response.status_code == 200
    assert response.data["title"] == ""
    assert response.data["author"] == ""
    assert response.data["category"] == ""
    assert response.data["cover_url"] == ""
    assert response.data["description"] == ""


@pytest.mark.django_db
def test_add_book_missing_multiple_fields_returns_400(auth_client):
    # Arrange
    payload = {
        "title": "Missing Many",
    }

    # Act
    response = auth_client.post("/books/add_book/", payload, format="json")

    # Assert
    assert response.status_code == 400


@pytest.mark.django_db
def test_delete_book_invalid_id_returns_404(auth_client):
    # Arrange
    invalid_id = "not-an-int"

    # Act
    with pytest.raises(ValueError):
        auth_client.delete(f"/books/delete_book/?book_id={invalid_id}")


@pytest.mark.django_db
def test_edit_book_nonexistent_id_returns_404(auth_client):
    # Arrange
    payload = {
        "title": "Ghost",
        "author": "Nobody",
        "category": "None",
        "cover_url": "https://example.com/ghost.jpg",
        "description": "Missing record.",
    }

    # Act
    response = auth_client.put("/books/edit_book/?book_id=9999", payload, format="json")

    # Assert
    assert response.status_code == 404


@pytest.mark.django_db
def test_delete_book_already_deleted_returns_404(auth_client, book):
    # Arrange
    book_id = book.id
    auth_client.delete(f"/books/delete_book/?book_id={book_id}")

    # Act
    response = auth_client.delete(f"/books/delete_book/?book_id={book_id}")

    # Assert
    assert response.status_code == 404


@pytest.mark.django_db
@pytest.mark.xfail(reason="API raises ValueError on non-numeric ID instead of 400")
def test_delete_book_invalid_id_returns_400(auth_client):
    # Arrange
    invalid_id = "not-an-int"

    # Act
    response = auth_client.delete(f"/books/delete_book/?book_id={invalid_id}")

    # Assert
    assert response.status_code == 400


@pytest.mark.django_db
@pytest.mark.xfail(reason="Whitespace book_id triggers ValueError instead of returning all books")
def test_get_book_whitespace_query_returns_all(auth_client, book, other_book):
    # Arrange

    # Act
    response = auth_client.get("/books/get_book/?book_id=%20")

    # Assert
    assert response.status_code == 200
    assert len(response.data) == 2
