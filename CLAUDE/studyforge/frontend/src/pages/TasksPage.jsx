import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { PageHeader, Card, Button, Input, Select, Textarea, Modal, Badge, EmptyState, Spinner, Alert, PriorityBadge, StatusBadge } from '../components/ui';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChecklistIcon from '@mui/icons-material/Checklist';
import FilterListIcon from '@mui/icons-material/FilterList';
import { format } from 'date-fns';

const PRIORITIES = ['high', 'medium', 'low'];
const STATUSES = ['not_started', 'in_progress', 'completed'];

const EMPTY_FORM = { title: '', description: '', subject: '', due_date: '', priority: 'medium', status: 'not_started' };

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ subject: '', priority: '', status: '', sort: 'due_date' });

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filters.subject) params.subject = filters.subject;
      if (filters.priority) params.priority = filters.priority;
      if (filters.status) params.status = filters.status;
      params.sort = filters.sort;
      const res = await api.get('/tasks', { params });
      setTasks(res.data.tasks);
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [filters]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditTask(null); setModalOpen(true); };
  const openEdit = (t) => {
    setForm({ title: t.title, description: t.description || '', subject: t.subject || '', due_date: t.due_date ? t.due_date.split('T')[0] : '', priority: t.priority, status: t.status });
    setEditTask(t);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required.');
    setSaving(true);
    try {
      if (editTask) {
        const res = await api.put(`/tasks/${editTask.id}`, form);
        setTasks(ts => ts.map(t => t.id === editTask.id ? res.data.task : t));
      } else {
        const res = await api.post('/tasks', form);
        setTasks(ts => [res.data.task, ...ts]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(ts => ts.filter(t => t.id !== id));
    } catch {
      setError('Failed to delete task.');
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await api.patch(`/tasks/${id}/complete`);
      setTasks(ts => ts.map(t => t.id === id ? res.data.task : t));
    } catch {
      setError('Failed to update task.');
    }
  };

  const setFilter = (key) => (e) => setFilters(f => ({ ...f, [key]: e.target.value }));
  const setF = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const subjects = [...new Set(tasks.map(t => t.subject).filter(Boolean))];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Manager"
        subtitle="Organize your assignments and deadlines"
        action={<Button onClick={openAdd} icon={AddIcon}>Add Task</Button>}
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center p-4 bg-white rounded-xl" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <FilterListIcon style={{ color: '#F97316' }} />
        <Select value={filters.subject} onChange={setFilter('subject')} className="w-36">
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={filters.priority} onChange={setFilter('priority')} className="w-36">
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </Select>
        <Select value={filters.status} onChange={setFilter('status')} className="w-40">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </Select>
        <Select value={filters.sort} onChange={setFilter('sort')} className="w-36">
          <option value="due_date">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
          <option value="created_at">Sort: Created</option>
        </Select>
        {(filters.subject || filters.priority || filters.status) && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({ subject: '', priority: '', status: '', sort: 'due_date' })}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={ChecklistIcon}
          title="No tasks yet"
          description="Add your assignments, projects, and deadlines to stay on track."
          action={<Button onClick={openAdd} icon={AddIcon}>Add Your First Task</Button>}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <Card key={task.id} className={task.status === 'completed' ? 'opacity-60' : ''}>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => task.status !== 'completed' && handleComplete(task.id)}
                  className="mt-0.5 flex-shrink-0 text-gray-300 hover:text-green-500 transition-colors"
                  title="Mark complete"
                >
                  <CheckCircleIcon style={{ color: task.status === 'completed' ? '#10B981' : undefined, fontSize: 24 }} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={`font-semibold text-base ${task.status === 'completed' ? 'line-through' : ''}`} style={{ color: '#1A1A1A' }}>
                      {task.title}
                    </h3>
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                  {task.description && <p className="text-sm mb-2" style={{ color: '#4A4A4A' }}>{task.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#6B7280' }}>
                    {task.subject && <span>Subject: {task.subject}</span>}
                    {task.due_date && (
                      <span className={new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-500 font-medium' : ''}>
                        Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(task)} className="p-2 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <EditIcon fontSize="small" />
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTask ? 'Edit Task' : 'Add New Task'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Task title *" placeholder="e.g. Write essay draft for English" value={form.title} onChange={setF('title')} required />
          <Textarea label="Description (optional)" placeholder="Additional details..." value={form.description} onChange={setF('description')} rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Subject / Course" placeholder="e.g. Biology" value={form.subject} onChange={setF('subject')} />
            <Input label="Due date" type="date" value={form.due_date} onChange={setF('due_date')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Priority" value={form.priority} onChange={setF('priority')}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </Select>
            <Select label="Status" value={form.status} onChange={setF('status')}>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : editTask ? 'Save Changes' : 'Add Task'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
