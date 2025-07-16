from book import Book
from library import Library
lib = Library("Test Library")
lib.add_book(Book("The Great Gatsby", "F. Scott Fitzgerald", 180, 1925))
lib.add_book(Book("To Kill a Mockingbird", "Harper Lee", 281, 1960))

print("Listing all books in the library:")
for book in lib.list_books():
    print("\n", book)

found = lib.find_book("The Great Gatsby")
if found:
    print("\nFound book:")
    print(found)
else:
    print("\nBook not found.")