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
    setForm({
      title: t.title,
      description: t.description || '',
      subject: t.subject || '',
      due_date: t.due_date ? t.due_date.split('T')[0] : '',
      priority: t.priority,
      status: t.status
    });
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

  const updateTaskStatus = async (task, newStatus) => {
    const previousTasks = [...tasks];
    setTasks(ts => ts.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    try {
      const payload = {
        title: task.title,
        description: task.description || '',
        subject: task.subject || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        priority: task.priority,
        status: newStatus
      };
      await api.put(`/tasks/${task.id}`, payload);
    } catch {
      setError('Failed to update task status.');
      setTasks(previousTasks);
    }
  };

  const setFilter = (key) => (e) => setFilters(f => ({ ...f, [key]: e.target.value }));
  const setF = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const subjects = [...new Set(tasks.map(t => t.subject).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Manager"
        subtitle="Organize your assignments and deadlines"
        action={<Button onClick={openAdd} icon={AddIcon}>Add Task</Button>}
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium flex items-center gap-2">
            <FilterListIcon style={{ color: 'var(--color-accent)' }} />
            Filter Tasks
          </span>
        </div>
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="subject-filter">Subject</label>
            <Select
              id="subject-filter"
              value={filters.subject}
              onChange={setFilter('subject')}
              className="w-full"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="priority-filter">Priority</label>
            <Select
              id="priority-filter"
              value={filters.priority}
              onChange={setFilter('priority')}
              className="w-full"
            >
              <option value="">All Priorities</option>
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="status-filter">Status</label>
            <Select
              id="status-filter"
              value={filters.status}
              onChange={setFilter('status')}
              className="w-full"
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="sort-filter">Sort By</label>
            <Select
              id="sort-filter"
              value={filters.sort}
              onChange={setFilter('sort')}
              className="w-full"
            >
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="created_at">Created Date</option>
            </Select>
          </div>
          {(filters.subject || filters.priority || filters.status) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ subject: '', priority: '', status: '', sort: 'date' })}
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

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
            <Card key={task.id} className={task.status === 'completed' ? 'opacity-70' : ''}>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => task.status !== 'completed' && handleComplete(task.id)}
                  className="mt-0.5 flex-shrink-0 p-1.5 rounded-lg hover:bg-[var(--color-background)/50] transition-colors"
                  title="Mark complete"
                >
                  <CheckCircleIcon
                    style={{
                      color: task.status === 'completed' ? 'var(--color-success)' : 'var(--color-text-muted)',
                      fontSize: 20
                    }}
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className={`font-semibold text-base ${task.status === 'completed' ? 'line-through opacity-80' : ''}`} style={{ color: 'var(--color-text-primary)' }}>
                      {task.title}
                    </h3>
                    <div className="flex gap-2">
                      <Badge
                        label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        color={task.priority}
                      />
                      <Badge
                        label={task.status.replace(/_/g, ' ')}
                        color={task.status}
                      />
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)] mb-3">
                    {task.subject && <span className="me-1">•</span><span> {task.subject}</span>}
                    {task.due_date && (
                      <>
                        <span className="me-1">•</span>
                        <span
                          className={new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-[var(--color-error)] font-medium' : ''}
                        >
                          Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Status Selector */}
                  <div className="border-t border-[var(--color-border)/50] pt-4 mt-4">
                    <span className="block text-xs font-medium mb-2 text-[var(--color-text-secondary)]">Update Status:</span>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map(status => {
                        const isActive = task.status === status;
                        return (
                          <button
                            key={status}
                            onClick={() => updateTaskStatus(task, status)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border border-[var(--color-border)] ${isActive
                              ? 'bg-[var(--color-accent)] text-white'
                              : 'bg-[var(--color-background)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background)/50]'
                            }`}
                          >
                            {status.replace(/_/g, ' ')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(task)}
                    className="p-2 rounded-lg hover:bg-[var(--color-background)/50] transition-colors"
                  >
                    <EditIcon fontSize="small" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 rounded-lg text-[var(--color-error)] hover:text-[var(--color-error-dark)] hover:bg-[var(--color-error)/10] transition-colors"
                  >
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
        <form onSubmit={handleSave} className="space-y-5">
          <Input
            label="Task title *"
            placeholder="e.g. Write essay draft for English"
            value={form.title}
            onChange={setF('title')}
            required
          />
          <Textarea
            label="Description (optional)"
            placeholder="Additional details..."
            value={form.description}
            onChange={setF('description')}
            rows={3}
          />
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Subject / Course"
              placeholder="e.g. Biology"
              value={form.subject}
              onChange={setF('subject')}
            />
            <Input
              label="Due date"
              type="date"
              value={form.due_date}
              onChange={setF('due_date')}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Priority"
              value={form.priority}
              onChange={setF('priority')}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </Select>
            <Select
              label="Status"
              value={form.status}
              onChange={setF('status')}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : editTask ? 'Save Changes' : 'Add Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}