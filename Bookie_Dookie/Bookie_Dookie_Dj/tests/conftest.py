import pytest
from rest_framework.test import APIClient

from Books.models import Book
from Users.models import User, UserBorrowedBook


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="alice",
        password="password123",
        email="alice@example.com",
        first_name="Alice",
        last_name="Tester",
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        username="bob",
        password="password123",
        email="bob@example.com",
        first_name="Bob",
        last_name="Tester",
    )


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def book(db):
    return Book.objects.create(
        title="Clean Code",
        author="Robert C. Martin",
        category="Software",
        cover_url="https://example.com/clean-code.jpg",
        description="A handbook of agile software craftsmanship.",
    )


@pytest.fixture
def other_book(db):
    return Book.objects.create(
        title="The Pragmatic Programmer",
        author="Andrew Hunt",
        category="Software",
        cover_url="https://example.com/pragmatic.jpg",
        description="Journey to mastery.",
    )


@pytest.fixture
def borrowed_record(user, book):
    return UserBorrowedBook.objects.create(user=user, book=book)
