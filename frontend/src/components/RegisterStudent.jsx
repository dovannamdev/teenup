import { useState, useEffect } from 'react';
import { getStudents, getClasses, registerStudent as registerApi } from '../api';

export default function RegisterStudent({ onSuccess }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [classId, setClassId] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    getStudents().then(setStudents).catch(() => {});
    getClasses().then(setClasses).catch(() => {});
  }, []);

  useEffect(() => {
    if (classId) {
      const cls = classes.find((c) => c.id === Number(classId));
      setSelectedClass(cls || null);
    } else {
      setSelectedClass(null);
    }
  }, [classId, classes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !classId) {
      onSuccess('Please select both student and class', 'error');
      return;
    }
    setLoading(true);
    try {
      await registerApi(Number(classId), Number(studentId));
      onSuccess('Student registered successfully!');
      setStudentId('');
      setClassId('');
      // Refresh classes to update count
      getClasses().then(setClasses).catch(() => {});
    } catch (err) {
      onSuccess(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Register Student to Class</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="reg-student">Student</label>
            <select
              id="reg-student"
              data-testid="reg-student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">-- Select student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Grade {s.current_grade})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="reg-class">Class</label>
            <select
              id="reg-class"
              data-testid="reg-class"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">-- Select class --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.day_of_week} {c.time_slot})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedClass && (
          <div style={{
            background: 'var(--color-bg)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-5)',
            fontSize: '0.85rem',
          }}>
            <strong>{selectedClass.name}</strong> — {selectedClass.subject}
            <br />
            {selectedClass.day_of_week} {selectedClass.time_slot} | {selectedClass.teacher_name}
            <br />
            Spots: {selectedClass.currentStudents || 0}/{selectedClass.max_students}
          </div>
        )}

        <button
          className="btn btn-accent"
          data-testid="submit-register"
          type="submit"
          disabled={loading || !studentId || !classId}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
