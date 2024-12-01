const express = require('express');
const router = express.Router();
const axios = require('axios');

// Obter todos os livros ou filtrar por termo de busca
router.get('/', async (req, res) => {
    const searchTerm = req.query.search;
    try {
        if (searchTerm) {
            const [filteredBooks] = await req.db.query(
                `SELECT * FROM books WHERE title LIKE ? OR author LIKE ?`,
                [`%${searchTerm}%`, `%${searchTerm}%`]
            );
            res.json(filteredBooks);
        } else {
            const [books] = await req.db.query('SELECT * FROM books');
            res.json(books);
        }
    } catch (error) {
        console.error('Failed to fetch books:', error);
        res.status(500).send('Failed to fetch books');
    }
});

// Adicionar um novo livro
router.post('/', async (req, res) => {
    const { title, author, isbn, available = true } = req.body;

    if (!title || !author) {
        return res.status(400).send('Title and author are required.');
    }

    try {
        await req.db.query(
            'INSERT INTO books (title, author, isbn, available) VALUES (?, ?, ?, ?)',
            [title, author, isbn || null, available]
        );
        res.status(201).send('Book added successfully');
    } catch (error) {
        console.error('Failed to add book:', error);
        res.status(500).send('Failed to add book');
    }
});

// Remover um livro
router.delete('/:id', async (req, res) => {
    const bookId = parseInt(req.params.id);

    try {
        const [result] = await req.db.query('DELETE FROM books WHERE id = ?', [bookId]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Book not found');
        }
        res.status(200).send('Book removed successfully');
    } catch (error) {
        console.error('Failed to remove book:', error);
        res.status(500).send('Failed to remove book');
    }
});

// Editar um livro
router.put('/:id', async (req, res) => {
    const bookId = parseInt(req.params.id);
    const { title, author, isbn, available } = req.body;

    try {
        const [books] = await req.db.query('SELECT * FROM books WHERE id = ?', [bookId]);
        const book = books[0];

        if (!book) {
            return res.status(404).send('Book not found');
        }

        await req.db.query(
            'UPDATE books SET title = ?, author = ?, isbn = ?, available = ? WHERE id = ?',
            [
                title || book.title,
                author || book.author,
                isbn || book.isbn,
                available !== undefined ? available : book.available,
                bookId
            ]
        );

        res.status(200).send('Book updated successfully');
    } catch (error) {
        console.error('Failed to update book:', error);
        res.status(500).send('Failed to update book');
    }
});

// Importar livros do Google Books para o catálogo local
router.post('/import', async (req, res) => {
    const { searchQuery } = req.body;

    if (!searchQuery) {
        return res.status(400).send('Search query is required.');
    }

    try {
        // Buscar livros da API do Google Books
        const response = await axios.get(
            `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
        );

        const books = response.data.items.map((item) => ({
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown',
            description: item.volumeInfo.description || '',
            isbn: item.volumeInfo.industryIdentifiers
                ? item.volumeInfo.industryIdentifiers.find((id) => id.type === 'ISBN_13')?.identifier || null
                : null,
        }));

        // Inserir os livros na base de dados
        for (const book of books) {
            await req.db.query(
                'INSERT INTO books (title, author, isbn, available) VALUES (?, ?, ?, TRUE)',
                [book.title, book.author, book.isbn]
            );
        }

        res.status(201).send('Books imported successfully.');
    } catch (error) {
        console.error('Failed to import books:', error);
        res.status(500).send('Failed to import books.');
    }
});

module.exports = router;