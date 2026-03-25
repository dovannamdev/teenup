import { useState, useEffect } from 'react';
import { createStudent, getParents } from '../api';

export default function StudentForm({ onSuccess, refreshParents }) {
  const [form, setForm] = useState({ name: '', dob: '', gender: 'male', current_grade: '', parentId: '' });
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getParents().then(setParents).catch(() => {});
  }, [refreshParents]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.dob || !form.current_grade || !form.parentId) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await createStudent({
        ...form,
        parentId: Number(form.parentId),
      });
      onSuccess(`Student "${result.name}" created successfully!`);
      setForm({ name: '', dob: '', gender: 'male', current_grade: '', parentId: '' });
      getParents().then(setParents).catch(() => {});
    } catch (err) {
      setError(err.message);
      onSuccess(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Add Student</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="student-name">Full Name</label>
          <input
            id="student-name"
            data-testid="student-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Nguyen Van B"
          />
        </div>
        <div className="form-group">
          <label htmlFor="student-dob">Date of Birth</label>
          <input
            id="student-dob"
            data-testid="student-dob"
            name="dob"
            type="date"
            value={form.dob}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="student-gender">Gender</label>
          <select id="student-gender" name="gender" value={form.gender} onChange={handleChange}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="student-grade">Current Grade</label>
          <input
            id="student-grade"
            data-testid="student-grade"
            name="current_grade"
            value={form.current_grade}
            onChange={handleChange}
            placeholder="e.g. 5"
          />
        </div>
        <div className="form-group">
          <label htmlFor="student-parent">Parent</label>
          <select
            id="student-parent"
            data-testid="student-parent"
            name="parentId"
            value={form.parentId}
            onChange={handleChange}
          >
            <option value="">-- Select parent --</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
            ))}
          </select>
        </div>
        {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}
        <button className="btn btn-primary" data-testid="submit-student" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Student'}
        </button>
      </form>
    </div>
  );
}
