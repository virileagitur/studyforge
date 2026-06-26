import React from 'react';

// Page header
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>{title}</h2>
        {subtitle && <p className="text-sm mt-1" style={{ color: '#4A4A4A' }}>{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// Card wrapper
export function Card({ children, className = '', onClick, hover = false }) {
  return (
    <div
      className={`bg-white rounded-xl p-6 ${hover ? 'cursor-pointer transition-shadow hover:shadow-lg' : ''} ${className}`}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', background: '#FFFBF5' }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Primary button
export function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false, size = 'md', className = '', icon: Icon }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-2 text-sm min-h-[36px]', md: 'px-4 py-2.5 text-sm min-h-[44px]', lg: 'px-6 py-3 text-base min-h-[48px]' };
  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600',
    secondary: 'bg-yellow-400 text-gray-900 hover:bg-yellow-300',
    ghost: 'bg-transparent text-gray-600 hover:bg-orange-50 hover:text-orange-500',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {Icon && <Icon fontSize="small" />}
      {children}
    </button>
  );
}

// Text input
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        className="w-full px-3 py-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 min-h-[44px]"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', color: '#1A1A1A' }}
        {...props}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

// Select input
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <select
        className="w-full px-3 py-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 min-h-[44px] appearance-none"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', color: '#1A1A1A' }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

// Textarea
export function Textarea({ label, error, className = '', rows = 4, ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        rows={rows}
        className="w-full px-3 py-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 resize-vertical"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', color: '#1A1A1A' }}
        {...props}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

// Modal
export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-xl w-full ${width} max-h-[90vh] overflow-y-auto`} style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold" style={{ color: '#1A1A1A' }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// Badge
export function Badge({ label, color = 'gray' }) {
  const colors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    not_started: 'bg-gray-100 text-gray-600',
    website: 'bg-blue-100 text-blue-700',
    pdf: 'bg-red-100 text-red-700',
    youtube: 'bg-red-100 text-red-600',
    article: 'bg-purple-100 text-purple-700',
    want_to_read: 'bg-gray-100 text-gray-600',
    reading: 'bg-blue-100 text-blue-700',
    finished: 'bg-green-100 text-green-700',
    gray: 'bg-gray-100 text-gray-600',
    orange: 'bg-orange-100 text-orange-700',
  };
  const readable = label?.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[color] || colors.gray}`}>
      {readable}
    </span>
  );
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon style={{ fontSize: 56, color: '#FACC15', marginBottom: 16 }} />}
      <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A1A1A' }}>{title}</h3>
      {description && <p className="text-sm mb-6 max-w-xs" style={{ color: '#4A4A4A' }}>{description}</p>}
      {action}
    </div>
  );
}

// Loading spinner
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin`} />
  );
}

// Stat card for dashboard
export function StatCard({ label, value, icon: Icon, color = 'orange' }) {
  const colors = {
    orange: { bg: 'bg-orange-50', icon: '#F97316' },
    yellow: { bg: 'bg-yellow-50', icon: '#D97706' },
    blue: { bg: 'bg-blue-50', icon: '#3B82F6' },
    green: { bg: 'bg-green-50', icon: '#10B981' },
  };
  const c = colors[color];
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`${c.bg} p-3 rounded-xl`}>
          <Icon style={{ color: c.icon, fontSize: 28 }} />
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>{value}</p>
          <p className="text-sm" style={{ color: '#4A4A4A' }}>{label}</p>
        </div>
      </div>
    </Card>
  );
}

// Alert / notification
export function Alert({ type = 'info', message, onClose }) {
  const styles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  };
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border text-sm ${styles[type]}`}>
      <p className="flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="font-bold leading-none opacity-60 hover:opacity-100">&times;</button>
      )}
    </div>
  );
}

// Priority badge helper
export function PriorityBadge({ priority }) {
  return <Badge label={priority} color={priority} />;
}

export function StatusBadge({ status }) {
  return <Badge label={status} color={status} />;
}
