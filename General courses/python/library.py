from book import Book

class Library:
    """
    Create a new library with a name and an empty collection of books.
    """

    def __init__(self, name):
        self.name = name
        self.books = []
    
    def add_book(self, book):
        """
        Add a book to the library's collection.
        """
        self.books.append(book)
        return f"'{book.title}' has been added to the library."
    def list_books(self):
        """
        List all books in the library with their details.
        """
        return [book.get_details() for book in self.books]
    def find_book(self, title):
        """
        Find a book by its title. (Case insensitive).
        If the book is found, return its details. if not, 
        return a message indicating that the book is not found.
        """
        for book in self.books:
            if book.title.lower() == title.lower():
                return book.get_details()
        return f"'{title}' not found in the library."