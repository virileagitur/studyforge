Build a full-stack Study Management System called "StudyForge" using React (Vite) for the frontend, Express/Node.js for the backend, and PostgreSQL for the database. Use Tailwind CSS for styling. The app must be mobile-first and fully responsive.

---

## 🎨 DESIGN STYLE GUIDE (Strictly Follow These Rules)

### Color Palette
- **Primary Orange:** #F97316 or #FB923C
- **Primary Yellow:** #FACC15 or #FDE047
- **Light Background:** #FFFDF7 (warm white with subtle yellow undertone)
- **Card/Container Background:** #FFFFFF with very subtle orange undertone (#FFFBF5)
- **Text Primary:** #1A1A1A (dark but not pure black)
- **Text Secondary:** #4A4A4A (soft dark gray)
- **Subtle Accent:** #FEF3C7 or #FFFBEB (light warm undertones for hover states)

### Typography
- **Font Family:** Use "Plus Jakarta Sans" as primary. Fallback: Verdana, Arial, sans-serif
- **Paragraph Text:** Minimum 1rem (16px)
- **Headers (H1, H2, H3, H4):** Proportionately sized larger than paragraph text. Example: H1 = 2rem, H2 = 1.75rem, H3 = 1.5rem, H4 = 1.25rem
- **Font Weight:** Regular (400) for body, Medium (500) for subheadings, Bold (700) for headings
- **Letter Spacing:** Normal. Avoid tight or wide tracking.

### Design Principles ("Do Not Overdo" Rule)
- **Keep it clean and professional.** This is not a "trendy" or "playful" app. It is a serious academic tool.
- **Icons:** Use Material-UI Icons (MUI) exclusively. NO emojis anywhere in the UI.
- **Borders:** Use background-borders (subtle shadow/outline) instead of visible border-lines. Cards should have a soft box-shadow like `box-shadow: 0 2px 8px rgba(0,0,0,0.06)` instead of `border: 1px solid #ccc`.
- **Corners:** Use rounded corners but NOT sharp (brutalist). Use `rounded-lg` or `rounded-xl` in Tailwind (8px-12px radius). Avoid `rounded-none` or `rounded-3xl` (too extreme).
- **Background:** Light and warm. No dark backgrounds anywhere. Avoid black, charcoal, or navy backgrounds. Use the light undertone colors specified above.
- **Spacing:** Generous padding around content (at least 24px on desktop, 16px on mobile). Airy, not cramped.
- **Buttons:** Use solid orange (#F97316) for primary buttons, yellow (#FACC15) with dark text for secondary actions. Hover states should subtly darken or lighten the color.
- **Cards:** White background with subtle warm undertone. Soft shadow. No visible border lines.

### What to AVOID
- NO brutalist design (no sharp corners, no dark backgrounds, no heavy borders)
- NO emojis anywhere in the UI (use MUI icons instead)
- NO overly complex animations or effects
- NO gradients or neon colors
- NO dark mode (stick to light theme only)
- NO experimental or trendy UI patterns (keep it standard and professional)

---

## 🧠 CORE PHILOSOPHY

This is an academic co-pilot that helps students organize their academic life and learn actively. Features should be practical, useful, and focused on productivity—not gimmicky.

---

## 👤 USER SYSTEM

- Users register with email/password
- Each user has: name, email, school/grade level, subjects they are studying
- All data scoped per user
- JWT-based authentication with HTTP-only cookies

---

## 📚 CORE FEATURES (Build These Only)

### 1. DASHBOARD (Home Page)
- Today's Focus: Single most important task (AI-recommended)
- Quick stats: Tasks due today, Flashcards due, Unread research items
- Quick Action bar: Add Task, Add Research, Generate Flashcards, Ask AI Tutor
- Recent activity feed

### 2. TASK MANAGER
- Create, edit, delete, complete tasks
- Fields: Title, Subject/Course, Due Date, Priority (High/Medium/Low), Status (Not Started, In Progress, Completed)
- Filter by: Subject, Priority, Status, Due Date
- Sort by: Due Date, Priority

### 3. RESEARCH BOOKMARKER
- Save research with: Title, URL, Source Type (Website/PDF/YouTube/Article), Notes
- AI Auto-Summarize: Send content to Claude → get 3-bullet summary
- AI Generate Flashcards: Send content to Claude → generate 5-10 flashcards
- Tag research by subject
- Search across saved research
- Paste text directly or upload PDF (use pdf-parse or pdf.js)

### 4. BOOK TRACKER
- Fields: Title, Author, Subject, Status (Want to Read/Reading/Finished), Rating (1-5)
- Reading progress (percentage complete)
- Notes per book (chapter-by-chapter optional)
- AI Chapter Summary: Generate summary with key takeaways

### 5. FLASHCARD SYSTEM
- Manual create (Front/Back)
- AI Auto-Generate from: Research items, Pasted text, Uploaded PDFs, Any topic
- Organize into Decks by subject
- Study modes: Standard (Front → Back) and Reverse (Back → Front)
- "Explain Simply" button: Claude rephrases for a 10-year-old
- "Give Me an Example" button: Claude provides real-world example

### 6. NOTE-TAKING
- Rich text notes (create, edit, delete)
- Organize by Subject
- AI Auto-Summarize: One-click summary
- AI Quiz Generator: Turn note into 5-question quiz
- Search across all notes

---

## 🤖 AI FEATURES (Build These Only)

### 7. AI TUTOR (Chat Interface)
- Students ask questions about any subject
- Claude responds with clear, age-appropriate explanations
- Support for: Step-by-step math, Essay feedback, Concept explanations, Homework help
- Chat history saved per session

### 8. AI SMART PRIORITIZER
- Analyzes all pending tasks and upcoming deadlines
- Returns the SINGLE most important task to do right now
- Includes a motivational reason why this task matters

### 9. AI STUDY GUIDE GENERATOR
- User types a topic (e.g., "Photosynthesis")
- Claude generates: Key concepts, Important terms, 10 practice questions with answers, Recommended resources

### 10. AI HOMEWORK SCANNER (Photo Upload)
- User uploads a photo of a worksheet or problem
- Claude extracts text and solves or explains it
- Shows step-by-step solutions for math problems

### 11. AI STUDY BUDDY (Daily Check-in)
- Daily prompt: "What are you studying today?"
- Claude sends encouraging messages and study tips

---

## 🛠️ TECHNICAL REQUIREMENTS

### Backend (Express/Node.js)
- RESTful API with error handling
- JWT authentication on all protected routes
- Rate limiting for AI endpoints
- Environment variables for: Database URL, Claude API Key, JWT Secret
- Use `claude-3-5-sonnet-20241022` model

### Frontend (React + Vite)
- React Router for navigation
- Axios for API calls with auth interceptors
- React Hook Form with validation
- Material-UI Icons only (no emojis)

### Database (PostgreSQL)
- Tables: users, tasks, research_items, books, flashcards, flashcard_decks, notes, study_sessions, tutor_conversations

### File Uploads
- PDF: Use pdf-parse or pdf.js for text extraction
- Images: Use Tesseract.js for OCR before sending to Claude

---

## 📱 MOBILE REQUIREMENTS

- Fully responsive: phones, tablets, desktops
- Touch-friendly: minimum 44px tap targets
- Bottom navigation on mobile (instead of sidebar)

---

## 🔒 SECURITY

- All API keys in `.env` file
- Input sanitization
- SQL injection prevention
- HTTPS only in production
- Secure HTTP-only cookies for JWT

---

## 🚀 DEPLOYMENT

- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Database: Supabase or Neon

---

## ⚠️ IMPORTANT INSTRUCTIONS FOR CLAUDE

1. **Ask questions whenever unsure.** Do not assume or guess. If a design element, feature, or implementation detail is unclear, ask the user before proceeding.

2. **Do not add features not listed above.** Stick exactly to the features in this prompt. No extra "creative" additions.

3. **Do not over-design.** Follow the design style guide strictly. Simple, clean, professional. Orange and yellow only.

4. **Do not use emojis.** Use Material-UI icons exclusively.

5. **Do not use dark backgrounds or brutalist design.** Light backgrounds only. Rounded corners. Soft shadows.

6. **Use Plus Jakarta Sans or Verdana.** Minimum 1rem for paragraphs. Proportional headers.

7. **Do not reveal border lines.** Use background-borders (shadows) instead.

---

## 📦 DELIVERABLES

When complete, provide:
1. GitHub repository with full source code
2. README.md with setup instructions
3. Live demo URL (deployed)
4. Screen recording (2-3 minutes) showing all features
5. Claude chat history showing development process

---

## 🧪 TESTING

- Handle empty states gracefully
- Handle API failures with user-friendly error messages
- All forms should validate input

---

Start by setting up the project structure, then build authentication first, followed by core features in this order: Dashboard → Tasks → Research → Books → Flashcards → Notes → AI Tutor → All other AI features.

**Remember: If you are unsure about anything, ask the user before proceeding.**