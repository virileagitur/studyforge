import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Card, Alert } from '../components/ui';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export default function AdminPage() {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/me')
      .then((res) => setAdminData(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Admin access is unavailable.'));
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Admin Access" subtitle="Restricted area for admin users" />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Card>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#FFF7ED' }}>
            <AdminPanelSettingsIcon style={{ color: '#F97316' }} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold" style={{ color: '#1A1A1A' }}>Administrator session</h2>
            <p className="text-sm" style={{ color: '#4A4A4A' }}>
              {adminData?.message || 'Loading admin permissions...'}
            </p>
            <div className="text-sm space-y-1" style={{ color: '#4A4A4A' }}>
              <p><span className="font-medium" style={{ color: '#1A1A1A' }}>Name:</span> {user?.name}</p>
              <p><span className="font-medium" style={{ color: '#1A1A1A' }}>Email:</span> {user?.email}</p>
              <p><span className="font-medium" style={{ color: '#1A1A1A' }}>Role:</span> {user?.role || adminData?.user?.role || 'user'}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}