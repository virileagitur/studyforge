# StudyForge

A full-stack study management system built with React (Vite), Express/Node.js, and PostgreSQL.

## Features

- User authentication (email/password)
- Dashboard with statistics
- Task manager
- Research bookmarker with AI summarization and flashcard generation
- Book tracker
- Flashcard system with AI-powered features
- Note-taking with AI summarization and quiz generation
- AI tutor for homework help
- AI study planner
- AI study guide generator
- AI homework scanner (OCR)
- AI study buddy (daily check-in)

## Tech Stack

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT authentication

### AI Integration
- Claude 3.5 Sonnet API

## Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- Claude API key

### Backend Setup
1. Navigate to the `server` directory
2. Install dependencies: `npm install`
3. Create a `.env` file based on the example below:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/studyforge
   CLAUDE_API_KEY=your_claude_api_key_here
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```
4. Run the database migrations (if any) - *to be implemented*
5. Start the development server: `npm run dev`
   - Or build and start: `npm run build && npm start`

### Frontend Setup
1. Navigate to the `client` directory
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
   - Or build for production: `npm run build`

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login a user
- `POST /api/logout` - Logout a user

### Users
- `GET /api/me` - Get current user profile
- `PUT /api/profile` - Update user profile

### Tasks
- `GET /api/tasks` - Get all tasks for the user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Research Items
- `GET /api/research` - Get all research items
- `POST /api/research` - Create a new research item
- `GET /api/research/:id` - Get a specific research item
- `PUT /api/research/:id` - Update a research item
- `DELETE /api/research/:id` - Delete a research item
- `POST /api/research/:id/summarize` - AI summarize research content
- `POST /api/research/:id/flashcards` - AI generate flashcards from research

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Create a new book
- `GET /api/books/:id` - Get a specific book
- `PUT /api/books/:id` - Update a book
- `DELETE /api/books/:id` - Delete a book

### Flashcards
- `GET /api/flashcards` - Get all flashcards
- `POST /api/flashcards` - Create a new flashcard
- `GET /api/flashcards/:id` - Get a specific flashcard
- `PUT /api/flashcards/:id` - Update a flashcard
- `DELETE /api/flashcards/:id` - Delete a flashcard
- `POST /api/flashcards/:id/explain` - Explain a flashcard in simple terms
- `POST /api/flashcards/:id/example` - Get an example for a flashcard

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note
- `POST /api/notes/:id/summarize` - AI summarize note content
- `POST /api/notes/:id/quiz` - AI generate quiz from note

### AI Tutor
- `POST /api/tutor` - Ask a question to the AI tutor

### AI Study Planner
- `POST /api/planner` - Get the most important task to work on

### AI Study Guide Generator
- `POST /api/study-guide` - Generate a study guide for a topic

### AI Homework Scanner
- `POST /api/homework/scan` - Scan and solve homework from an image

### AI Study Buddy
- `POST /api/study-buddy` - Get a daily check-in message

## Database Schema

### Users
- id: UUID (primary key)
- email: string (unique)
- password: string (hashed)
- name: string
- school: string
- subjects: string[]
- created_at: timestamp
- updated_at: timestamp

### Tasks
- id: UUID (primary key)
- user_id: UUID (foreign key)
- title: string
- subject: string
- due_date: timestamp
- priority: enum (low, medium, high)
- status: enum (not_started, in_progress, completed)
- created_at: timestamp
- updated_at: timestamp

### Research Items
- id: UUID (primary key)
- user_id: UUID (foreign key)
- title: string
- url: string
- source_type: enum (website, pdf, youtube, article)
- notes: text
- summary: text (AI-generated)
- flashcards: jsonb (AI-generated)
- created_at: timestamp
- updated_at: timestamp

### Books
- id: UUID (primary key)
- user_id: UUID (foreign key)
- title: string
- author: string
- subject: string
- status: enum (want_to_read, reading, finished)
- rating: integer (1-5)
- progress: float (0-100)
- notes: text
- created_at: timestamp
- updated_at: timestamp

### Flashcards
- id: UUID (primary key)
- user_id: UUID (foreign key)
- question: string
- answer: string
- deck_id: UUID (foreign key, optional)
- created_at: timestamp
- updated_at: timestamp

### Notes
- id: UUID (primary key)
- user_id: UUID (foreign key)
- title: string
- content: text
- subject: string
- summary: text (AI-generated)
- quiz: jsonb (AI-generated)
- created_at: timestamp
- updated_at: timestamp

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `CLAUDE_API_KEY`: API key for Claude 3.5 Sonnet
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Port to run the server on (default: 5000)

### Frontend (.env)
- `VITE_API_BASE_URL`: Base URL for the API (default: http://localhost:5000)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Thanks to the creators of React, Vite, Express, and Claude AI.

