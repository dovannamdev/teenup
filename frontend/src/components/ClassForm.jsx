import { useState } from 'react';
import { createClass } from '../api';

export default function ClassForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    subject: '',
    day_of_week: 'Monday',
    time_slot: '',
    teacher_name: '',
    max_students: 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.subject || !form.time_slot || !form.teacher_name || !form.max_students) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await createClass({
        ...form,
        max_students: Number(form.max_students),
      });
      onSuccess(`Class "${result.name}" created successfully!`);
      setForm({ name: '', subject: '', day_of_week: 'Monday', time_slot: '', teacher_name: '', max_students: 30 });
    } catch (err) {
      setError(err.message);
      onSuccess(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card full-width">
      <h3 className="card-title">Add New Class</h3>
      <form onSubmit={handleSubmit} className="grid-2">
        <div className="form-group">
          <label htmlFor="class-name">Class Name</label>
          <input
            id="class-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Toan Nang Cao"
          />
        </div>
        <div className="form-group">
          <label htmlFor="class-subject">Subject</label>
          <input
            id="class-subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="e.g. Math"
          />
        </div>
        <div className="form-group">
          <label htmlFor="class-day">Day of Week</label>
          <select id="class-day" name="day_of_week" value={form.day_of_week} onChange={handleChange}>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="class-time">Time Slot</label>
          <input
            id="class-time"
            name="time_slot"
            value={form.time_slot}
            onChange={handleChange}
            placeholder="e.g. 08:00-09:30"
          />
        </div>
        <div className="form-group">
          <label htmlFor="class-teacher">Teacher Name</label>
          <input
            id="class-teacher"
            name="teacher_name"
            value={form.teacher_name}
            onChange={handleChange}
            placeholder="e.g. Thay Minh"
          />
        </div>
        <div className="form-group">
          <label htmlFor="class-max">Max Students</label>
          <input
            id="class-max"
            name="max_students"
            type="number"
            min="1"
            value={form.max_students}
            onChange={handleChange}
          />
        </div>
        
        <div style={{ gridColumn: '1 / -1' }}>
          {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Class'}
          </button>
        </div>
      </form>
    </div>
  );
}
