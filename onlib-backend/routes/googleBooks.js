const express = require('express');
const axios = require('axios');
const router = express.Router();

// Substitua pela sua API Key do Google Books
const GOOGLE_BOOKS_API_KEY = 'AIzaSyAwdQD4F3slDbLC8DgYgEalwXGGYR4hFiI';

router.get('/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).send('Query parameter is required.');
    }

    try {
        const response = await axios.get(
            `https://www.googleapis.com/books/v1/volumes`,
            {
                params: {
                    q: query,
                    key: GOOGLE_BOOKS_API_KEY,
                },
            }
        );

        const books = response.data.items.map(item => ({
            id: item.id,
            title: item.volumeInfo.title || 'No title available',
            authors: item.volumeInfo.authors || ['Unknown author'],
            publisher: item.volumeInfo.publisher || 'Unknown publisher',
            publishedDate: item.volumeInfo.publishedDate || 'Unknown date',
            description: item.volumeInfo.description || 'No description available',
            thumbnail: item.volumeInfo.imageLinks?.thumbnail || null,
        }));

        res.json(books);
    } catch (error) {
        console.error('Error fetching data from Google Books API:', error.message);
        res.status(500).send('Failed to fetch books.');
    }
});

module.exports = router;
