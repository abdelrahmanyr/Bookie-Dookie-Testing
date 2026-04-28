import pytest

from Users.models import UserBorrowedBook


@pytest.mark.django_db
def test_get_book_list_returns_all(auth_client, book, other_book):
    # Arrange
    
    # Act
    response = auth_client.get("/books/get_book/")

    # Assert
    assert response.status_code == 200
    assert len(response.data) == 2


@pytest.mark.django_db
def test_get_book_by_id_returns_single(auth_client, book):
    # Arrange
    book_id = book.id

    # Act
    response = auth_client.get(f"/books/get_book/?book_id={book_id}")

    # Assert
    assert response.status_code == 200
    assert response.data["id"] == book_id
    assert response.data["title"] == book.title


@pytest.mark.django_db
def test_dashboard_users_list_returns_users(auth_client, user, other_user):
    # Arrange
    
    # Act
    response = auth_client.get("/dashboard/get_users/")

    # Assert
    assert response.status_code == 200
    usernames = {item["username"] for item in response.data}
    assert {user.username, other_user.username}.issubset(usernames)


@pytest.mark.django_db
def test_get_borrowings_filters_by_user(auth_client, user, other_user, book, other_book):
    # Arrange
    UserBorrowedBook.objects.create(user=user, book=book)
    UserBorrowedBook.objects.create(user=other_user, book=other_book)

    # Act
    response = auth_client.get("/users/get_borrow/")

    # Assert
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["book"]["id"] == book.id


@pytest.mark.django_db
def test_get_book_empty_query_returns_all(auth_client, book, other_book):
    # Arrange

    # Act
    response = auth_client.get("/books/get_book/?book_id=")

    # Assert
    assert response.status_code == 200
    assert len(response.data) == 2


@pytest.mark.django_db
def test_get_book_list_response_fields(auth_client, book, other_book):
    # Arrange

    # Act
    response = auth_client.get("/books/get_book/")

    # Assert
    assert response.status_code == 200
    for item in response.data:
        assert set(item.keys()) == {
            "id",
            "title",
            "author",
            "category",
            "cover_url",
            "description",
            "book_state",
        }


@pytest.mark.django_db
def test_get_book_whitespace_query_returns_empty_fields(auth_client, book):
    # Arrange

    # Act
    with pytest.raises(ValueError):
        auth_client.get("/books/get_book/?book_id=%20")
