import pytest


@pytest.mark.django_db
@pytest.mark.known_issue
def test_delete_book_invalid_id_should_return_400(auth_client):
    # Arrange
    invalid_id = "not-an-int"

    # Act
    response = auth_client.delete(f"/books/delete_book/?book_id={invalid_id}")

    # Assert
    assert response.status_code == 400


@pytest.mark.django_db
@pytest.mark.known_issue
def test_get_book_whitespace_id_should_return_list(auth_client, book, other_book):
    # Arrange

    # Act
    response = auth_client.get("/books/get_book/?book_id=%20")

    # Assert
    assert response.status_code == 200
    assert len(response.data) == 2
