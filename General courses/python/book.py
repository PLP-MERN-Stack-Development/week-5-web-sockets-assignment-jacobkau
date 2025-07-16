class Book:

    def __init__(self, title, author, pages, year):
        """
        Initialize the book object with title, author, pages, and year.
        """
        self.title = title
        self.author = author
        self.pages = pages
        self.year = year
        self.available = True
        self.__rating = 0

    def borrow(self):
        """
        mark the book as borrowed
        """
        if self.available:
            self.available = False
            return f"'{self.title}' has been borrowed."
        return f"'{self.title}' is currently not available.  Please return it first."
    def return_book(self):
        """
        mark the book as returned
        """
        if not self.available:
            self.available = True
            return f"'{self.title}' has been returned."
        return f"The book is already available.  Please borrow it first."   
    def get_details(self):
        """
        Get the details of the book.
        """
        return f"Title: {self.title}, Author: {self.author}, Pages: {self.pages}, Year: {self.year}, Available: {self.available}"
    def set_rating(self, rating):
        """
        Set the rating of the book (0 to 5). - encapsulation
        """
        if 0 <= rating <= 5:
            self.__rating = rating
            return f"Rating for '{self.title}' has been set to {self.__rating}."
        return "Rating must be between 0 and 5."
    def get_rating(self):
        """ 
        Get the rating of the book.
        """
        return f"Rating for '{self.title}' is {self.__rating}."