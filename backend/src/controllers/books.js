const { query } = require('../db');
const https = require('https');

const getAIClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const getBooks = async (req, res, next) => {
  try {
    const { status, subject } = req.query;
    let conditions = ['user_id = $1'];
    let params = [req.user.id];
    let idx = 2;

    if (status) { conditions.push(`status = $${idx++}`); params.push(status); }
    if (subject) { conditions.push(`subject = $${idx++}`); params.push(subject); }

    const result = await query(
      `SELECT * FROM books WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
      params
    );
    res.json({ books: result.rows });
  } catch (err) {
    next(err);
  }
};

const createBook = async (req, res, next) => {
  try {
    const {
      title, author, subject, status, rating, progress_percent, notes,
      book_cover_url, description, published_date, publisher, page_count,
      isbn, genres, language, chapters, reading_start_date, reading_finish_date,
      is_favorite, tags
    } = req.body;

    if (!title) return res.status(400).json({ error: 'Book title is required.' });

    const result = await query(
      `INSERT INTO books (
        user_id, title, author, subject, status, rating, progress_percent, notes,
        book_cover_url, description, published_date, publisher, page_count,
        isbn, genres, language, chapters, reading_start_date, reading_finish_date,
        is_favorite, tags
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )
      RETURNING *`,
      [
        req.user.id, title.trim(), author || null, subject || null, status || 'want_to_read', 
        rating || null, progress_percent || 0, notes || null, book_cover_url || null, 
        description || null, published_date || null, publisher || null, page_count || null,
        isbn || null, genres || [], language || null, JSON.stringify(chapters || []), 
        reading_start_date || null, reading_finish_date || null, is_favorite || false, tags || []
      ]
    );
    res.status(201).json({ book: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title, author, subject, status, rating, progress_percent, notes,
      book_cover_url, description, published_date, publisher, page_count,
      isbn, genres, language, chapters, reading_start_date, reading_finish_date,
      is_favorite, tags, summary, summary_generated
    } = req.body;

    const result = await query(
      `UPDATE books 
       SET title=$1, author=$2, subject=$3, status=$4, rating=$5, progress_percent=$6, notes=$7,
           book_cover_url=$8, description=$9, published_date=$10, publisher=$11, page_count=$12,
           isbn=$13, genres=$14, language=$15, chapters=$16, reading_start_date=$17, reading_finish_date=$18,
           is_favorite=$19, tags=$20, summary=$21, summary_generated=$22
       WHERE id=$23 AND user_id=$24
       RETURNING *`,
      [
        title, author || null, subject || null, status, rating || null, progress_percent || 0, notes || null,
        book_cover_url || null, description || null, published_date || null, publisher || null, page_count || null,
        isbn || null, genres || [], language || null, JSON.stringify(chapters || []), 
        reading_start_date || null, reading_finish_date || null, is_favorite || false, tags || [],
        summary || null, summary_generated || false, id, req.user.id
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found.' });
    res.json({ book: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM books WHERE id=$1 AND user_id=$2 RETURNING id', [id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found.' });
    res.json({ message: 'Book deleted.' });
  } catch (err) {
    next(err);
  }
};

// OpenLibrary API metadata lookup
const lookupBookByISBN = async (req, res, next) => {
  try {
    const { isbn } = req.params;
    const cleanIsbn = isbn.replace(/[-\s]/g, '');

    https.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`, (olRes) => {
      let body = '';
      olRes.on('data', (chunk) => body += chunk);
      olRes.on('end', () => {
        try {
          const data = JSON.parse(body);
          const bookKey = `ISBN:${cleanIsbn}`;
          const rawBook = data[bookKey];

          if (!rawBook) {
            return res.status(404).json({ error: 'Book metadata not found for this ISBN.' });
          }

          const bookInfo = {
            title: rawBook.title || '',
            author: rawBook.authors ? rawBook.authors.map(a => a.name).join(', ') : '',
            publisher: rawBook.publishers ? rawBook.publishers.map(p => p.name).join(', ') : '',
            published_date: rawBook.publish_date || '',
            page_count: rawBook.number_of_pages || null,
            book_cover_url: rawBook.cover ? (rawBook.cover.large || rawBook.cover.medium || rawBook.cover.small) : '',
            description: rawBook.notes || '',
            genres: rawBook.subjects ? rawBook.subjects.map(s => s.name) : [],
          };

          res.json({ book: bookInfo });
        } catch {
          res.status(500).json({ error: 'Failed to parse metadata from OpenLibrary API.' });
        }
      });
    }).on('error', () => {
      res.status(500).json({ error: 'OpenLibrary service connection failed.' });
    });
  } catch (err) {
    next(err);
  }
};

// AI summary generation for book
const generateBookSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookResult = await query('SELECT * FROM books WHERE id=$1 AND user_id=$2', [id, req.user.id]);
    if (bookResult.rows.length === 0) return res.status(404).json({ error: 'Book not found.' });

    const book = bookResult.rows[0];
    const client = getAIClient();
    let summaryText;

    if (!client) {
      summaryText = `[AI Placeholder] This is a summary of "${book.title}" by ${book.author || 'Unknown Author'}. Enter your GEMINI_API_KEY to enable full AI summaries.`;
    } else {
      const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `You are a professional literary assistant. Provide a comprehensive summary and analysis of the book:
Title: "${book.title}"
Author: "${book.author || 'Unknown'}"
Description: "${book.description || 'No description provided'}"
Chapters: ${book.chapters ? JSON.stringify(book.chapters) : 'None provided'}

Provide a detailed summary under 3 key sections:
1. Executive Summary
2. Core Themes & Lessons
3. Key Takeaways
Keep the style academic, structured, and informative. Use clean markdown formatting (headers, bold text, lists).`;
      
      const result = await model.generateContent(prompt);
      summaryText = result.response.text();
    }

    const updateResult = await query(
      'UPDATE books SET summary = $1, summary_generated = TRUE WHERE id = $2 RETURNING *',
      [summaryText, id]
    );

    res.json({ book: updateResult.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBooks, createBook, updateBook, deleteBook, lookupBookByISBN, generateBookSummary };
