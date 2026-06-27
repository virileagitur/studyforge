import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, StatCard, Button, Spinner, Alert } from '../components/ui';
import ChecklistIcon from '@mui/icons-material/Checklist';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import StyleIcon from '@mui/icons-material/Style';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddIcon from '@mui/icons-material/Add';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TodayIcon from '@mui/icons-material/Today';
import { formatDistanceToNow } from 'date-fns';

const activityIcon = { task: ChecklistIcon, research: BookmarkIcon, note: NoteAltIcon };

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [priorityTask, setPriorityTask] = useState(null);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/dashboard'),
    ]).then(([dashRes]) => {
      setStats(dashRes.data.stats);
      setActivity(dashRes.data.activity);
    }).catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, [refreshUser]); // Refetch when user data changes (e.g., after onboarding)

  const loadPriority = async () => {
    setPriorityLoading(true);
    try {
      const res = await api.get('/ai/prioritize');
      setPriorityTask(res.data);
    } catch {
      setError('Could not load AI priority. Please try again.');
    } finally {
      setPriorityLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{greeting}, {user?.name?.split(' ')[0]}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" onClick={() => refreshUser()}>
          Refresh
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tasks Due Today" value={stats?.tasks_due_today ?? 0} icon={TodayIcon} color="blue" />
        <StatCard label="Pending Tasks" value={stats?.total_pending_tasks ?? 0} icon={ChecklistIcon} color="yellow" />
        <StatCard label="Flashcards" value={stats?.total_flashcards ?? 0} icon={StyleIcon} color="green" />
        <StatCard label="Research Items" value={stats?.total_research ?? 0} icon={BookmarkIcon} color="purple" />
      </div>

      {/* AI Priority + Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Focus */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <LightbulbIcon style={{ color: 'var(--color-accent)' }} />
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Today's Focus</h3>
          </div>
          {priorityTask ? (
            <div className="space-y-3">
              <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{priorityTask.task_name}</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{priorityTask.reason}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Let AI analyze your tasks and tell you the single most important thing to focus on right now.
              </p>
              <Button
                onClick={loadPriority}
                disabled={priorityLoading}
                icon={SmartToyIcon}
                size="sm"
                className="flex items-center gap-2"
              >
                {priorityLoading ? 'Analyzing...' : 'Get AI Priority'}
                <SmartToyIcon style={{ fontSize: 16, marginLeft: 4 }} />
              </Button>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Task', icon: ChecklistIcon, to: '/tasks', color: 'blue' },
              { label: 'Save Research', icon: BookmarkIcon, to: '/research', color: 'green' },
              { label: 'New Flashcard', icon: StyleIcon, to: '/flashcards', color: 'purple' },
              { label: 'Ask AI Tutor', icon: SmartToyIcon, to: '/tutor', color: 'orange' },
              { label: 'New Note', icon: NoteAltIcon, to: '/notes', color: 'red' },
              { label: 'Study Guide', icon: AutoStoriesIcon, to: '/study-guide', color: 'teal' },
            ].map(({ label, icon: Icon, to, color }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors hover:border-[var(--color-accent)] hover:shadow-sm min-h-[44px] border border-[var(--color-border)]`}
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              >
                <Icon style={{ color: `var(--color-${color})`, fontSize: 20 }} />
                {label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Recent Activity</h3>
        {activity.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
            No activity yet. Start by adding a task, saving research, or taking notes.
          </p>
        ) : (
          <div className="space-y-4">
            {activity.map((item, i) => {
              const Icon = activityIcon[item.type] || NoteAltIcon;
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-t border-[var(--color-border)/50] pt-4 first:border-t-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                    <Icon style={{ color: 'var(--color-accent)', fontSize: 18 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{item.title}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {item.subject && `${item.subject} · `}
                      {item.meta && `${item.meta.replace(/_/g, ' ')} · `}
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}