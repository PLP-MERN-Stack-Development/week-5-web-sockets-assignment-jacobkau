from digitalbook import DigitalBook
ebook = DigitalBook("The Great Gatsby", "F. Scott Fitzgerald", 180, 1925, "2MB")
print(ebook.get_details())
print(ebook.stream())
print(ebook.borrow())