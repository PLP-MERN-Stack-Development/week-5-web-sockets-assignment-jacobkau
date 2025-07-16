from book import Book
class DigitalBook(Book):
    """
    Create a new digital book with title, author, pages, year, and file size.
    """
    
    def __init__(self, title, author, pages, year, file_size):
        super().__init__(title, author, pages, year)
        self.file_size = file_size

    def stream(self):
        """
        Stream the digital book.
        """
        if self.available:
            return f"Streaming '{self.title}'..."
        return f"'{self.title}' is currently not available.  Please return it first."
    def borrow(self):
        """
        Override the borrow method to include streaming.
        """
        return f"'{self.title}' is being streamed.  Please return it after reading."
    
        return super().borrow()