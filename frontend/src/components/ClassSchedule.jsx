import { useState, useEffect } from 'react';
import { getClasses } from '../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ClassSchedule({ refreshClasses }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClasses()
      .then(setClasses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshClasses]);

  if (loading) return <div className="spinner" />;

  const classesByDay = DAYS.reduce((acc, day) => {
    acc[day] = classes.filter((c) => c.day_of_week === day);
    return acc;
  }, {});

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-5)', fontFamily: 'var(--font-heading)' }}>
        Weekly Class Schedule
      </h2>
      <div className="schedule-grid">
        {DAYS.map((day) => (
          <div className="schedule-day" key={day}>
            <div className="schedule-day-header">{day.substring(0, 3)}</div>
            <div className="schedule-day-body">
              {classesByDay[day].length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', padding: '8px', textAlign: 'center' }}>
                  No classes
                </p>
              ) : (
                classesByDay[day].map((cls) => {
                  const current = cls.currentStudents || 0;
                  const isFull = current >= cls.max_students;
                  return (
                    <div className="class-card" key={cls.id}>
                      <div className="class-name">{cls.name}</div>
                      <div className="class-meta">{cls.time_slot}</div>
                      <div className="class-meta">{cls.teacher_name}</div>
                      <span className={`class-badge ${isFull ? 'badge-full' : 'badge-available'}`}>
                        {current}/{cls.max_students}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
