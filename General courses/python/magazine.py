from book import Book
class Magazine(Book):
    """
    Create a new magazine with title, author, pages, year, and issue number.
    """
    
    def __init__(self, title, editor, pages, year, issue_number):
        super().__init__(title, editor, pages, year)
    
    def borrow(self):
        """
        Override the borrow method - magazines cannot be borrowed.
        """
        return f"'{self.title}' cannot be borrowed.  It is for reference only."	