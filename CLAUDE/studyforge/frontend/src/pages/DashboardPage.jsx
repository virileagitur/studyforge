import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, StatCard, Button, Spinner, Alert } from '../components/ui';
import ChecklistIcon from '@mui/icons-material/Checklist';
import StyleIcon from '@mui/icons-material/Style';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddIcon from '@mui/icons-material/Add';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TodayIcon from '@mui/icons-material/Today';
import { formatDistanceToNow } from 'date-fns';

const activityIcon = { task: ChecklistIcon, research: BookmarkIcon, note: NoteAltIcon };

export default function DashboardPage() {
  const { user } = useAuth();
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
  }, []);

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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>{greeting}, {user?.name?.split(' ')[0]}</h2>
        <p className="text-sm mt-1" style={{ color: '#4A4A4A' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tasks Due Today" value={stats?.tasks_due_today ?? 0} icon={TodayIcon} color="orange" />
        <StatCard label="Pending Tasks" value={stats?.total_pending_tasks ?? 0} icon={ChecklistIcon} color="yellow" />
        <StatCard label="Flashcards" value={stats?.total_flashcards ?? 0} icon={StyleIcon} color="blue" />
        <StatCard label="Research Items" value={stats?.total_research ?? 0} icon={BookmarkIcon} color="green" />
      </div>

      {/* AI Priority + Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Focus */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <LightbulbIcon style={{ color: '#F97316' }} />
            <h3 className="text-base font-semibold" style={{ color: '#1A1A1A' }}>Today's Focus</h3>
          </div>
          {priorityTask ? (
            <div className="space-y-2">
              <p className="font-semibold" style={{ color: '#1A1A1A' }}>{priorityTask.task_name}</p>
              <p className="text-sm" style={{ color: '#4A4A4A' }}>{priorityTask.reason}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm" style={{ color: '#4A4A4A' }}>
                Let AI analyze your tasks and tell you the single most important thing to focus on right now.
              </p>
              <Button onClick={loadPriority} disabled={priorityLoading} icon={SmartToyIcon} size="sm">
                {priorityLoading ? 'Analyzing...' : 'Get AI Priority'}
              </Button>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-base font-semibold mb-4" style={{ color: '#1A1A1A' }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Task', icon: ChecklistIcon, to: '/tasks' },
              { label: 'Save Research', icon: BookmarkIcon, to: '/research' },
              { label: 'New Flashcard', icon: StyleIcon, to: '/flashcards' },
              { label: 'Ask AI Tutor', icon: SmartToyIcon, to: '/tutor' },
              { label: 'New Note', icon: NoteAltIcon, to: '/notes' },
              { label: 'Study Guide', icon: AutoStoriesIcon, to: '/study-guide' },
            ].map(({ label, icon: Icon, to }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-left transition-colors hover:shadow-md min-h-[44px]"
                style={{ background: '#FEF3C7', color: '#1A1A1A' }}
              >
                <Icon style={{ color: '#F97316', fontSize: 20 }} />
                {label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-base font-semibold mb-4" style={{ color: '#1A1A1A' }}>Recent Activity</h3>
        {activity.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: '#4A4A4A' }}>
            No activity yet. Start by adding a task, saving research, or taking notes.
          </p>
        ) : (
          <div className="space-y-3">
            {activity.map((item, i) => {
              const Icon = activityIcon[item.type] || NoteAltIcon;
              return (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FEF3C7' }}>
                    <Icon style={{ color: '#F97316', fontSize: 18 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#1A1A1A' }}>{item.title}</p>
                    <p className="text-xs" style={{ color: '#4A4A4A' }}>
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
