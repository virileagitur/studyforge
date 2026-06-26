const { query } = require('../db');

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [tasksDueToday, totalPending, flashcardsTotal, researchCount, recentTasks, recentResearch, recentNotes] = await Promise.all([
      query(
        `SELECT COUNT(*)::int as count FROM tasks WHERE user_id=$1 AND DATE(due_date)=$2 AND status != 'completed'`,
        [userId, today]
      ),
      query(
        `SELECT COUNT(*)::int as count FROM tasks WHERE user_id=$1 AND status != 'completed'`,
        [userId]
      ),
      query(
        `SELECT COUNT(*)::int as count FROM flashcards WHERE user_id=$1`,
        [userId]
      ),
      query(
        `SELECT COUNT(*)::int as count FROM research_items WHERE user_id=$1`,
        [userId]
      ),
      query(
        `SELECT id, title, subject, due_date, priority, status, created_at FROM tasks WHERE user_id=$1 ORDER BY created_at DESC LIMIT 5`,
        [userId]
      ),
      query(
        `SELECT id, title, source_type, subject, created_at FROM research_items WHERE user_id=$1 ORDER BY created_at DESC LIMIT 5`,
        [userId]
      ),
      query(
        `SELECT id, title, subject, updated_at FROM notes WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 5`,
        [userId]
      ),
    ]);

    const stats = {
      tasks_due_today: tasksDueToday.rows[0].count,
      total_pending_tasks: totalPending.rows[0].count,
      total_flashcards: flashcardsTotal.rows[0].count,
      total_research: researchCount.rows[0].count,
    };

    // Build recent activity feed
    const activity = [
      ...recentTasks.rows.map(t => ({
        type: 'task',
        id: t.id,
        title: t.title,
        subject: t.subject,
        meta: t.status,
        timestamp: t.created_at,
      })),
      ...recentResearch.rows.map(r => ({
        type: 'research',
        id: r.id,
        title: r.title,
        subject: r.subject,
        meta: r.source_type,
        timestamp: r.created_at,
      })),
      ...recentNotes.rows.map(n => ({
        type: 'note',
        id: n.id,
        title: n.title,
        subject: n.subject,
        meta: null,
        timestamp: n.updated_at,
      })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.json({ stats, activity });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
