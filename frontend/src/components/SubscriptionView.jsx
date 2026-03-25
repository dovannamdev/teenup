import { useState, useEffect } from 'react';
import { getSubscriptions, createSubscription, getStudents } from '../api';

export default function SubscriptionView({ onSuccess }) {
  const [subs, setSubs] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    studentId: '', package_name: '', start_date: '', end_date: '', total_sessions: 10,
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([getSubscriptions(), getStudents()])
      .then(([s, st]) => { setSubs(s); setStudents(st); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createSubscription({ ...form, studentId: Number(form.studentId), total_sessions: Number(form.total_sessions) });
      onSuccess('Subscription created!');
      setShowForm(false);
      setForm({ studentId: '', package_name: '', start_date: '', end_date: '', total_sessions: 10 });
      loadData();
    } catch (err) {
      onSuccess(err.message, 'error');
    }
  };

  const getProgressColor = (used, total) => {
    const remaining = total - used;
    const pct = remaining / total;
    if (pct > 0.5) return 'progress-green';
    if (pct > 0.25) return 'progress-yellow';
    return 'progress-red';
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)' }}>Subscriptions</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Subscription'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 className="card-title">Create Subscription</h3>
          <form onSubmit={handleCreate}>
            <div className="grid-2">
              <div className="form-group">
                <label>Student</label>
                <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
                  <option value="">-- Select --</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Package Name</label>
                <input value={form.package_name} onChange={(e) => setForm({ ...form, package_name: e.target.value })} placeholder="e.g. Goi Hoc 3 Thang" />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Total Sessions</label>
                <input type="number" min="1" value={form.total_sessions} onChange={(e) => setForm({ ...form, total_sessions: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-accent" type="submit">Create</button>
          </form>
        </div>
      )}

      {subs.length === 0 ? (
        <div className="empty-state">
          <p>No subscriptions yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid-3">
          {subs.map((sub) => {
            const remaining = sub.total_sessions - sub.used_sessions;
            const pct = (sub.used_sessions / sub.total_sessions) * 100;
            return (
              <div className="sub-card" key={sub.id}>
                <div className="sub-header">
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{sub.package_name}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {sub.student?.name || `Student #${sub.student_id}`}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="sub-count">{remaining}</div>
                    <div className="sub-label">remaining</div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${getProgressColor(sub.used_sessions, sub.total_sessions)}`}
                    style={{ width: `${100 - pct}%` }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  <span>Used: {sub.used_sessions}/{sub.total_sessions}</span>
                  <span>{sub.start_date} → {sub.end_date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
