import { useState } from 'react';
import { createParent } from '../api';

export default function ParentForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await createParent(form);
      onSuccess(`Parent "${result.name}" created successfully!`);
      setForm({ name: '', phone: '', email: '' });
    } catch (err) {
      setError(err.message);
      onSuccess(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Add Parent</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="parent-name">Full Name</label>
          <input
            id="parent-name"
            data-testid="parent-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Nguyen Van A"
          />
        </div>
        <div className="form-group">
          <label htmlFor="parent-phone">Phone</label>
          <input
            id="parent-phone"
            data-testid="parent-phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. 0909123456"
          />
        </div>
        <div className="form-group">
          <label htmlFor="parent-email">Email</label>
          <input
            id="parent-email"
            data-testid="parent-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="e.g. parent@email.com"
          />
        </div>
        {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}
        <button className="btn btn-primary" data-testid="submit-parent" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Parent'}
        </button>
      </form>
    </div>
  );
}
