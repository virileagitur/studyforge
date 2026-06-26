const { query } = require('../db');
const multer = require('multer');
const path = require('path');

// Initialize Anthropic client lazily so the app still starts without a key
let anthropic = null;
const getClient = () => {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) return null;
    const Anthropic = require('@anthropic-ai/sdk');
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
};

const MODEL = 'claude-3-5-sonnet-20241022';

// Call Claude or return a placeholder if no API key is set
const callClaude = async (systemPrompt, userPrompt, maxTokens = 1000) => {
  const client = getClient();
  if (!client) {
    return '[AI placeholder — add your ANTHROPIC_API_KEY to enable real AI responses]';
  }
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });
  return msg.content[0].text;
};

// --- AI Tutor Chat ---
const tutorChat = async (req, res, next) => {
  try {
    const { message, conversation_id, subject } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required.' });

    let conversation = null;
    let messages = [];

    if (conversation_id) {
      const result = await query(
        'SELECT * FROM tutor_conversations WHERE id=$1 AND user_id=$2',
        [conversation_id, req.user.id]
      );
      if (result.rows.length > 0) {
        conversation = result.rows[0];
        messages = conversation.messages || [];
      }
    }

    const systemPrompt = `You are StudyForge's AI Tutor — a patient, encouraging academic assistant for students.
Your role: Help students understand concepts clearly, solve problems step-by-step, and build genuine understanding.
${subject ? `Current subject focus: ${subject}` : ''}
Guidelines:
- Use clear, age-appropriate language
- For math: always show step-by-step working
- For essays: give specific, actionable feedback
- Encourage and motivate, but stay focused on learning
- Keep responses concise but complete`;

    const claudeMessages = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    const client = getClient();
    let reply;

    if (!client) {
      reply = `[AI Placeholder] You asked: "${message}". With a real API key, I would provide a detailed explanation here. Add your ANTHROPIC_API_KEY to .env to enable real AI tutoring.`;
    } else {
      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: 1500,
        system: systemPrompt,
        messages: claudeMessages,
      });
      reply = msg.content[0].text;
    }

    messages.push({ role: 'user', content: message, timestamp: new Date().toISOString() });
    messages.push({ role: 'assistant', content: reply, timestamp: new Date().toISOString() });

    let savedConversation;
    if (conversation) {
      const result = await query(
        'UPDATE tutor_conversations SET messages=$1 WHERE id=$2 RETURNING *',
        [JSON.stringify(messages), conversation.id]
      );
      savedConversation = result.rows[0];
    } else {
      const result = await query(
        `INSERT INTO tutor_conversations (user_id, session_name, subject, messages)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.user.id, `Chat - ${new Date().toLocaleDateString()}`, subject || null, JSON.stringify(messages)]
      );
      savedConversation = result.rows[0];
    }

    res.json({ reply, conversation: savedConversation });
  } catch (err) {
    next(err);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, session_name, subject, created_at, updated_at FROM tutor_conversations WHERE user_id=$1 ORDER BY updated_at DESC',
      [req.user.id]
    );
    res.json({ conversations: result.rows });
  } catch (err) {
    next(err);
  }
};

const getConversation = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM tutor_conversations WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Conversation not found.' });
    res.json({ conversation: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    await query('DELETE FROM tutor_conversations WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Conversation deleted.' });
  } catch (err) {
    next(err);
  }
};

// --- Smart Prioritizer ---
const smartPrioritize = async (req, res, next) => {
  try {
    const tasks = await query(
      `SELECT title, subject, due_date, priority, status FROM tasks
       WHERE user_id=$1 AND status != 'completed'
       ORDER BY due_date ASC NULLS LAST
       LIMIT 20`,
      [req.user.id]
    );

    if (tasks.rows.length === 0) {
      return res.json({ task: null, reason: 'You have no pending tasks. Great job staying on top of things!' });
    }

    const taskList = tasks.rows.map((t, i) =>
      `${i + 1}. "${t.title}" (${t.subject || 'No subject'}) - Priority: ${t.priority}, Due: ${t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No deadline'}, Status: ${t.status}`
    ).join('\n');

    const systemPrompt = `You are an AI academic prioritization expert. Analyze the student's task list and identify the single most important task to do RIGHT NOW. Consider urgency, priority, and impact. Respond in JSON format only.`;

    const userPrompt = `Here are my pending tasks:\n${taskList}\n\nRespond with JSON: { "task_name": "...", "reason": "1-2 sentence motivating explanation of why this task needs attention now" }`;

    const response = await callClaude(systemPrompt, userPrompt, 300);

    let result = { task_name: tasks.rows[0].title, reason: 'This is your highest priority upcoming task.' };
    try {
      const clean = response.replace(/```json|```/g, '').trim();
      result = JSON.parse(clean);
    } catch {
      // fallback already set
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// --- Study Guide Generator ---
const generateStudyGuide = async (req, res, next) => {
  try {
    const { topic, subject } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required.' });

    const systemPrompt = `You are an expert academic tutor creating comprehensive study guides for students. Always respond in valid JSON format only.`;

    const userPrompt = `Create a comprehensive study guide for the topic: "${topic}"${subject ? ` (${subject})` : ''}.

Respond with this exact JSON structure:
{
  "topic": "${topic}",
  "key_concepts": ["concept 1", "concept 2", ...],
  "important_terms": [{"term": "...", "definition": "..."}, ...],
  "practice_questions": [{"question": "...", "answer": "..."}, ...],
  "recommended_resources": ["resource 1", "resource 2", ...]
}

Include 5-8 key concepts, 8-10 important terms, exactly 10 practice questions with answers, and 3-5 recommended resources.`;

    const response = await callClaude(systemPrompt, userPrompt, 2000);

    let guide;
    if (response.includes('[AI placeholder')) {
      guide = {
        topic,
        key_concepts: ['Add your API key to see real content', 'Set ANTHROPIC_API_KEY in .env'],
        important_terms: [{ term: 'Placeholder', definition: 'Real content appears with API key' }],
        practice_questions: [{ question: 'Sample question?', answer: 'Sample answer' }],
        recommended_resources: ['Add API key for real recommendations'],
      };
    } else {
      try {
        const clean = response.replace(/```json|```/g, '').trim();
        guide = JSON.parse(clean);
      } catch {
        guide = { topic, raw_content: response, error: 'Could not parse structured response' };
      }
    }

    res.json({ guide });
  } catch (err) {
    next(err);
  }
};

// --- Research Summarizer ---
const summarizeResearch = async (req, res, next) => {
  try {
    const { research_id } = req.params;
    const result = await query('SELECT * FROM research_items WHERE id=$1 AND user_id=$2', [research_id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Research item not found.' });

    const item = result.rows[0];
    const contentToSummarize = item.content || item.notes || item.title;

    const systemPrompt = `You are a research summarization expert. Create concise, accurate 3-bullet summaries of academic content.`;
    const userPrompt = `Summarize this research item in exactly 3 bullet points:\nTitle: ${item.title}\nContent: ${contentToSummarize}\n\nFormat: Return only 3 bullet points starting with "•"`;

    const summary = await callClaude(systemPrompt, userPrompt, 400);

    await query('UPDATE research_items SET ai_summary=$1 WHERE id=$2', [summary, research_id]);
    res.json({ summary });
  } catch (err) {
    next(err);
  }
};

// --- Generate Flashcards from Research ---
const generateFlashcardsFromResearch = async (req, res, next) => {
  try {
    const { research_id } = req.params;
    const { deck_id } = req.body;

    const result = await query('SELECT * FROM research_items WHERE id=$1 AND user_id=$2', [research_id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Research item not found.' });

    const item = result.rows[0];
    const content = item.content || item.notes || item.title;

    const systemPrompt = `You are a flashcard creation expert for students. Generate effective study flashcards. Respond in JSON only.`;
    const userPrompt = `Create 5-8 flashcards from this content:\nTitle: ${item.title}\nContent: ${content}\n\nRespond with JSON array: [{"front": "question or term", "back": "answer or definition"}, ...]`;

    const response = await callClaude(systemPrompt, userPrompt, 1000);

    let cards = [];
    if (!response.includes('[AI placeholder')) {
      try {
        const clean = response.replace(/```json|```/g, '').trim();
        cards = JSON.parse(clean);
      } catch {
        cards = [{ front: 'Sample question', back: 'Sample answer' }];
      }
    } else {
      cards = [
        { front: 'Add ANTHROPIC_API_KEY to .env', back: 'To enable real AI flashcard generation' }
      ];
    }

    const inserted = [];
    for (const card of cards) {
      const r = await query(
        `INSERT INTO flashcards (user_id, deck_id, front, back, subject) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.user.id, deck_id || null, card.front, card.back, item.subject || null]
      );
      inserted.push(r.rows[0]);
    }

    res.json({ flashcards: inserted });
  } catch (err) {
    next(err);
  }
};

// --- Summarize Note ---
const summarizeNote = async (req, res, next) => {
  try {
    const { note_id } = req.params;
    const result = await query('SELECT * FROM notes WHERE id=$1 AND user_id=$2', [note_id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Note not found.' });

    const note = result.rows[0];
    const systemPrompt = 'You are an expert at summarizing academic notes concisely and accurately.';
    const userPrompt = `Summarize this note in 3-5 sentences:\nTitle: ${note.title}\nContent: ${note.content}`;

    const summary = await callClaude(systemPrompt, userPrompt, 500);
    await query('UPDATE notes SET ai_summary=$1 WHERE id=$2', [summary, note_id]);
    res.json({ summary });
  } catch (err) {
    next(err);
  }
};

// --- Generate Quiz from Note ---
const generateQuizFromNote = async (req, res, next) => {
  try {
    const { note_id } = req.params;
    const result = await query('SELECT * FROM notes WHERE id=$1 AND user_id=$2', [note_id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Note not found.' });

    const note = result.rows[0];
    const systemPrompt = 'You are an expert at creating educational quiz questions. Respond in JSON only.';
    const userPrompt = `Create 5 quiz questions from this note:\nTitle: ${note.title}\nContent: ${note.content}\n\nRespond with JSON: [{"question": "...", "answer": "...", "type": "short_answer"}, ...]`;

    const response = await callClaude(systemPrompt, userPrompt, 800);

    let quiz = [];
    if (!response.includes('[AI placeholder')) {
      try {
        const clean = response.replace(/```json|```/g, '').trim();
        quiz = JSON.parse(clean);
      } catch {
        quiz = [{ question: 'Sample question from your note?', answer: 'Sample answer', type: 'short_answer' }];
      }
    } else {
      quiz = [{ question: 'Add API key to enable quiz generation', answer: 'Set ANTHROPIC_API_KEY in .env', type: 'short_answer' }];
    }

    await query('UPDATE notes SET ai_quiz=$1 WHERE id=$2', [JSON.stringify(quiz), note_id]);
    res.json({ quiz });
  } catch (err) {
    next(err);
  }
};

// --- Book Chapter Summary ---
const summarizeBook = async (req, res, next) => {
  try {
    const { book_id } = req.params;
    const { chapter_text, chapter_name } = req.body;

    if (!chapter_text) return res.status(400).json({ error: 'Chapter text is required.' });

    const book = await query('SELECT * FROM books WHERE id=$1 AND user_id=$2', [book_id, req.user.id]);
    if (book.rows.length === 0) return res.status(404).json({ error: 'Book not found.' });

    const systemPrompt = 'You are an expert at summarizing book chapters with key takeaways for students.';
    const userPrompt = `Summarize this chapter from "${book.rows[0].title}"${chapter_name ? ` (${chapter_name})` : ''}:\n\n${chapter_text}\n\nProvide: 1) A 2-3 sentence summary, 2) 3-5 key takeaways as bullet points`;

    const summary = await callClaude(systemPrompt, userPrompt, 600);
    res.json({ summary });
  } catch (err) {
    next(err);
  }
};

// --- Explain Simply (Flashcard) ---
const explainSimply = async (req, res, next) => {
  try {
    const { flashcard_id } = req.params;
    const result = await query('SELECT * FROM flashcards WHERE id=$1 AND user_id=$2', [flashcard_id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Flashcard not found.' });

    const card = result.rows[0];
    const systemPrompt = 'You are great at explaining concepts simply, as if talking to a curious 10-year-old.';
    const userPrompt = `Explain this concept simply for a 10-year-old:\nConcept: ${card.front}\nAnswer: ${card.back}\n\nKeep it under 3 sentences using everyday language and a simple analogy.`;

    const explanation = await callClaude(systemPrompt, userPrompt, 300);
    await query('UPDATE flashcards SET simple_explanation=$1 WHERE id=$2', [explanation, flashcard_id]);
    res.json({ explanation });
  } catch (err) {
    next(err);
  }
};

// --- Give Example (Flashcard) ---
const giveExample = async (req, res, next) => {
  try {
    const { flashcard_id } = req.params;
    const result = await query('SELECT * FROM flashcards WHERE id=$1 AND user_id=$2', [flashcard_id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Flashcard not found.' });

    const card = result.rows[0];
    const systemPrompt = 'You provide clear, memorable real-world examples that help students remember academic concepts.';
    const userPrompt = `Give a real-world example for this concept:\nConcept: ${card.front}\nDefinition: ${card.back}\n\nProvide 1-2 concrete, relatable real-world examples in 2-3 sentences.`;

    const example = await callClaude(systemPrompt, userPrompt, 300);
    await query('UPDATE flashcards SET real_world_example=$1 WHERE id=$2', [example, flashcard_id]);
    res.json({ example });
  } catch (err) {
    next(err);
  }
};

// --- Daily Study Buddy ---
const dailyCheckIn = async (req, res, next) => {
  try {
    const { today_subject, mood } = req.body;

    const systemPrompt = 'You are an encouraging, warm academic study buddy. Give motivational yet practical advice.';
    const userPrompt = `A student says they are studying "${today_subject || 'general subjects'}" today${mood ? ` and feeling ${mood}` : ''}.

Give them: 1) An encouraging opening sentence, 2) One specific study tip for their subject, 3) A motivating closing thought.
Keep the total response under 4 sentences. Be warm, not cheesy.`;

    const message = await callClaude(systemPrompt, userPrompt, 300);

    // Save session
    await query(
      `INSERT INTO study_sessions (user_id, subjects_studied, ai_tip)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [req.user.id, today_subject ? [today_subject] : [], message]
    );

    res.json({ message });
  } catch (err) {
    next(err);
  }
};

// --- Homework Scanner (Photo) ---
const homeworkScanner = async (req, res, next) => {
  try {
    const { extracted_text } = req.body;
    if (!extracted_text) return res.status(400).json({ error: 'Extracted text from image is required.' });

    const systemPrompt = 'You are a patient tutor who helps students understand homework problems by explaining step-by-step.';
    const userPrompt = `A student photographed this homework problem:\n\n"${extracted_text}"\n\nPlease: 1) Identify what type of problem this is, 2) Solve it step-by-step if applicable, 3) Explain the key concept being tested. Be thorough but clear.`;

    const solution = await callClaude(systemPrompt, userPrompt, 1000);
    res.json({ solution });
  } catch (err) {
    next(err);
  }
};

// --- Generate Flashcards from Text ---
const generateFlashcardsFromText = async (req, res, next) => {
  try {
    const { text, topic, deck_id, subject } = req.body;
    if (!text && !topic) return res.status(400).json({ error: 'Text or topic is required.' });

    const systemPrompt = 'You are a flashcard creation expert. Generate effective study flashcards. Respond in JSON only.';
    const userPrompt = text
      ? `Create 5-10 flashcards from this text:\n${text}\n\nJSON: [{"front": "...", "back": "..."}, ...]`
      : `Create 8 flashcards for the topic: "${topic}"\n\nJSON: [{"front": "...", "back": "..."}, ...]`;

    const response = await callClaude(systemPrompt, userPrompt, 1200);

    let cards = [];
    if (!response.includes('[AI placeholder')) {
      try {
        const clean = response.replace(/```json|```/g, '').trim();
        cards = JSON.parse(clean);
      } catch {
        cards = [];
      }
    } else {
      cards = [{ front: 'Add ANTHROPIC_API_KEY', back: 'To enable AI flashcard generation from text' }];
    }

    const inserted = [];
    for (const card of cards) {
      const r = await query(
        `INSERT INTO flashcards (user_id, deck_id, front, back, subject) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.user.id, deck_id || null, card.front, card.back, subject || null]
      );
      inserted.push(r.rows[0]);
    }

    res.json({ flashcards: inserted });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  tutorChat,
  getConversations,
  getConversation,
  deleteConversation,
  smartPrioritize,
  generateStudyGuide,
  summarizeResearch,
  generateFlashcardsFromResearch,
  summarizeNote,
  generateQuizFromNote,
  summarizeBook,
  explainSimply,
  giveExample,
  dailyCheckIn,
  homeworkScanner,
  generateFlashcardsFromText,
};
