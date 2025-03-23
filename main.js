// Initialize books array and constants for events and storage
const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

// Execute when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Add event listener for book form submission
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    // Add event listener for search form
    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBooks();
    });

    // Load data from localStorage if available
    if (isStorageExist()) {
        loadDataFromStorage();
    }

    // Update form button text based on checkbox state
    const checkboxElement = document.getElementById('bookFormIsComplete');
    const submitButton = document.getElementById('bookFormSubmit');
    
    checkboxElement.addEventListener('change', function() {
        const spanElement = submitButton.querySelector('span');
        if (this.checked) {
            spanElement.innerText = 'SELESAI DIBACA';
        } else {
            spanElement.innerText = 'BELUM SELESAI DIBACA';
        }
    });

    // Create and add edit modal to the document body
    createEditModal();
    
    // Create and add delete confirmation modal to the document body
    createDeleteModal();
    
    // Close modals when clicking outside or on close button
    window.addEventListener('click', function(event) {
        const editModal = document.getElementById('editBookModal');
        const deleteModal = document.getElementById('deleteBookModal');
        
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
        
        if (event.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
});

// Function to create edit modal
function createEditModal() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'editBookModal';
    modalDiv.classList.add('modal');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.classList.add('close-btn');
    
    closeBtn.addEventListener('click', function() {
        modalDiv.style.display = 'none';
    });

    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Edit Buku';

    const editForm = document.createElement('form');
    editForm.id = 'editBookForm';

    // Create form fields
    editForm.innerHTML = `
        <div class="form-group">
            <label for="editBookTitle">Judul</label>
            <input type="text" id="editBookTitle" required>
        </div>
        <div class="form-group">
            <label for="editBookAuthor">Penulis</label>
            <input type="text" id="editBookAuthor" required>
        </div>
        <div class="form-group">
            <label for="editBookYear">Tahun</label>
            <input type="number" id="editBookYear" required>
        </div>
        <div class="form-group checkbox-group">
            <input type="checkbox" id="editBookIsComplete">
            <label for="editBookIsComplete">Selesai dibaca</label>
        </div>
        <input type="hidden" id="editBookId">
        <button type="submit" class="btn-save">Simpan Perubahan</button>
    `;

    editForm.addEventListener('submit', function(event) {
        event.preventDefault();
        updateBook();
    });

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(editForm);
    
    modalDiv.appendChild(modalContent);
    document.body.appendChild(modalDiv);
}

// Function to create delete confirmation modal
function createDeleteModal() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'deleteBookModal';
    modalDiv.classList.add('modal'); // Gunakan class modal

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content'); // Gunakan class modal-content

    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.classList.add('close-btn'); // Gunakan class close-btn

    closeBtn.addEventListener('click', function() {
        modalDiv.style.display = 'none';
    });

    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Konfirmasi Hapus';

    const modalText = document.createElement('p');
    modalText.textContent = 'Apakah Anda yakin ingin menghapus buku ini?';

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('modal-buttons'); // Gunakan class modal-buttons

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Batal';
    cancelBtn.classList.add('cancel-btn'); // Gunakan class cancel-btn
    cancelBtn.addEventListener('click', function() {
        modalDiv.style.display = 'none';
    });

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Hapus';
    confirmBtn.classList.add('delete-btn'); // Gunakan class delete-btn

    // Hidden input untuk menyimpan ID buku
    const deleteBookIdInput = document.createElement('input');
    deleteBookIdInput.type = 'hidden';
    deleteBookIdInput.id = 'deleteBookId';

    confirmBtn.addEventListener('click', function() {
        const bookId = parseInt(document.getElementById('deleteBookId').value);
        confirmDeleteBook(bookId);
    });

    buttonContainer.append(cancelBtn, confirmBtn);
    modalContent.append(closeBtn, modalTitle, modalText, deleteBookIdInput, buttonContainer);
    modalDiv.appendChild(modalContent);
    document.body.appendChild(modalDiv);
}


// Function to check if localStorage is supported
function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

// Function to generate unique ID using timestamp
function generateId() {
    return +new Date();
}

// Function to create book object
function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    };
}

// Function to add new book
function addBook() {
    const titleBook = document.getElementById('bookFormTitle').value;
    const authorBook = document.getElementById('bookFormAuthor').value;
    const yearBook = parseInt(document.getElementById('bookFormYear').value);
    const isCompleteBook = document.getElementById('bookFormIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, titleBook, authorBook, yearBook, isCompleteBook);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    resetForm();
}

// Function to update existing book
function updateBook() {
    const bookId = parseInt(document.getElementById('editBookId').value);
    const bookIndex = findBookIndex(bookId);
    
    if (bookIndex !== -1) {
        books[bookIndex].title = document.getElementById('editBookTitle').value;
        books[bookIndex].author = document.getElementById('editBookAuthor').value;
        books[bookIndex].year = parseInt(document.getElementById('editBookYear').value);
        books[bookIndex].isComplete = document.getElementById('editBookIsComplete').checked;
        
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        
        // Close edit modal
        document.getElementById('editBookModal').style.display = 'none';
    }
}

// Function to reset form fields
function resetForm() {
    document.getElementById('bookForm').reset();
    const submitButton = document.getElementById('bookFormSubmit');
    const spanElement = submitButton.querySelector('span');
    if (spanElement) {
        spanElement.innerText = 'Belum selesai dibaca';
    }
}

// Function to find book by ID
function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

// Function to find book index
function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

// Function to move book between shelves
function moveBook(bookId) {
    const bookTarget = findBook(bookId);
    
    if (bookTarget == null) return;
    
    bookTarget.isComplete = !bookTarget.isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Function to show delete confirmation modal
function removeBook(bookId) {
    document.getElementById('deleteBookId').value = bookId;
    document.getElementById('deleteBookModal').style.display = 'block';
}

// Function to confirm and delete book
function confirmDeleteBook(bookId) {
    const bookTarget = findBookIndex(bookId);
    
    if (bookTarget === -1) return;
    
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    
    // Close delete modal
    document.getElementById('deleteBookModal').style.display = 'none';
}

// Function to show edit modal with book data
function editBook(bookId) {
    const bookTarget = findBook(bookId);
    
    if (bookTarget == null) return;
    
    // Fill edit form with book data
    document.getElementById('editBookId').value = bookTarget.id;
    document.getElementById('editBookTitle').value = bookTarget.title;
    document.getElementById('editBookAuthor').value = bookTarget.author;
    document.getElementById('editBookYear').value = bookTarget.year;
    document.getElementById('editBookIsComplete').checked = bookTarget.isComplete;
    
    // Display edit modal
    document.getElementById('editBookModal').style.display = 'block';
}

// Function to search books
function searchBooks() {
    const searchTerm = document.getElementById('searchBookTitle').value.toLowerCase();
    
    if (searchTerm.trim() === '') {
        document.dispatchEvent(new Event(RENDER_EVENT));
        return;
    }
    
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm)
    );
    
    renderFilteredBooks(filteredBooks);
}

// Function to render filtered books
function renderFilteredBooks(filteredBooks) {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');
    
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';
    
    for (const bookItem of filteredBooks) {
        const bookElement = makeBook(bookItem);
        if (bookItem.isComplete) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    }
}

// Function to create book element
function makeBook(bookObject) {
    // Container item buku
    const bookItem = document.createElement('div');
    bookItem.classList.add('book-item'); // Tambahkan class
    bookItem.setAttribute('data-bookid', bookObject.id);
    bookItem.setAttribute('data-testid', 'bookItem');

    // Judul buku
    const bookTitle = document.createElement('h3');
    bookTitle.innerText = bookObject.title;
    bookTitle.setAttribute('data-testid', 'bookItemTitle');

    // Penulis buku
    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = 'Penulis: ' + bookObject.author;
    bookAuthor.setAttribute('data-testid', 'bookItemAuthor');

    // Tahun buku
    const bookYear = document.createElement('p');
    bookYear.innerText = 'Tahun: ' + bookObject.year;
    bookYear.setAttribute('data-testid', 'bookItemYear');

    // Container tombol
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container'); // Tambahkan class

    // Tombol toggle status
    const toggleButton = document.createElement('button');
    toggleButton.classList.add('toggle-btn'); // Tambahkan class
    toggleButton.innerText = bookObject.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
    toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    toggleButton.addEventListener('click', function () {
        moveBook(bookObject.id);
    });

    // Tombol hapus
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-btn'); // Tambahkan class
    deleteButton.innerText = 'Hapus Buku';
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.addEventListener('click', function () {
        removeBook(bookObject.id);
    });

    // Tombol edit
    const editButton = document.createElement('button');
    editButton.classList.add('edit-btn'); // Tambahkan class
    editButton.innerText = 'Edit Buku';
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.addEventListener('click', function () {
        editBook(bookObject.id);
    });

    // Tambahkan tombol ke container
    buttonContainer.append(toggleButton, deleteButton, editButton);

    // Tambahkan elemen ke dalam item buku
    bookItem.append(bookTitle, bookAuthor, bookYear, buttonContainer);

    return bookItem;
}


// Event listener for rendering books
document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');
    
    // Clear book lists
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';
    
    // Render books to appropriate shelves
    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (bookItem.isComplete) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    }
});

// Function to save data to localStorage
function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

// Event listener for saved data
document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

// Function to load data from localStorage
function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    
    if (data !== null) {
        books.length = 0; // Clear existing array
        for (const book of data) {
            books.push(book);
        }
    }
    
    document.dispatchEvent(new Event(RENDER_EVENT));
}