from library import Library
from book import Book
from digitalbook import DigitalBook
from magazine import Magazine

def main():
    # Create a library
    library = Library("Witty Library")

    # Add books to the library
    library.add_book(Book("The Great Gatsby", "F. Scott Fitzgerald", 180, 1925))
    library.add_book(DigitalBook("Digital Fortress", "Dan Brown", 384, 1998, "2MB"))
    library.add_book(Magazine("National Geographic", "John Doe", 100, 2023, "March"))
    library.add_book(Book("To Kill a Mockingbird", "Harper Lee", 281, 1960))
    library.add_book(DigitalBook("The Catcher in the Rye", "J.D. Salinger", 277, 1951, "1.5MB"))
    library.add_book(Magazine("Time", "Jane Doe", 50, 2023, "April"))
    library.add_book(Book("1984", "George Orwell", 328, 1949))
    library.add_book(DigitalBook("Brave New World", "Aldous Huxley", 311, 1932, "3MB"))
    library.add_book(Magazine("Forbes", "John Smith", 75, 2023, "May"))

    while True:
        print("\nWelcome to the Witty Library!")
        print("\nLibrary Menu:")
        print("1. List all books")
        print("2. Find a book by title")
        print("3. return a book")
        print("4. Borrow a book")
        print("5. Borrow a digital book")
        print("6. Stream a digital book")
        print("7. Stream a magazine")
        print("8. Rate a book")
        print("9. Exit")

        choice = input("Enter your choice (1-9): ")
        if choice == "1":
            print("\nListing all books in the library:")
            for book in library.list_books():
                print("\n", book)
        elif choice == "2":
            title = input("Enter the title of the book to find: ")
            found = library.find_book(title)
            if found:
                print("\nFound book:")
                print(found)
            else:
                print("\nBook not found.")
        elif choice == "3":
            title = input("Enter the title of the book to return: ")
            found = library.find_book(title)
            if found:
                found.return_book()
                print(f"\n'{title}' has been returned.")
            else:
                print("\nBook not found.")
        elif choice == "4":
            title = input("Enter the title of the book to borrow: ")
            found = library.find_book(title)
            if found:
                found.borrow()
                print(f"\n'{title}' has been borrowed.")
            else:
                print("\nBook not found.")
        elif choice == "5":
            title = input("Enter the title of the digital book to borrow: ")
            found = library.find_book(title)
            if isinstance(found, DigitalBook):
                found.borrow()
                print(f"\n'{title}' has been borrowed.")
            else:
                print("\nDigital book not found or not available for borrowing.")
        elif choice == "6":
            title = input("Enter the title of the digital book to stream: ")
            found = library.find_book(title)
            if isinstance(found, DigitalBook):
                print(found.stream())
            else:
                print("\nDigital book not found or not available for streaming.")
        elif choice == "7":
            title = input("Enter the title of the magazine to stream: ")
            found = library.find_book(title)
            if isinstance(found, Magazine):
                print(found.stream())
            else:
                print("\nMagazine not found or not available for streaming.")
        elif choice == "8":
            title = input("Enter the title of the book to rate: ")
            rating = float(input("Enter your rating (0-5): "))
            found = library.find_book(title)
            if isinstance(found, Book):
                found.rate(rating)
                print(f"\n'{title}' has been rated {rating}.")
            else:
                print("\nBook not found or not available for rating.")
        elif choice == "9":
            print("Exiting the library. Goodbye!")
            break