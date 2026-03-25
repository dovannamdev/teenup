import { useState } from 'react';
import ParentForm from './components/ParentForm';
import StudentForm from './components/StudentForm';
import ClassForm from './components/ClassForm';
import ClassSchedule from './components/ClassSchedule';
import RegisterStudent from './components/RegisterStudent';
import SubscriptionView from './components/SubscriptionView';

const TABS = ['Parents & Students', 'Classes', 'Subscriptions'];

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [toast, setToast] = useState(null);
  const [refreshParents, setRefreshParents] = useState(0);
  const [refreshClasses, setRefreshClasses] = useState(0);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleParentSuccess = (message, type = 'success') => {
    showToast(message, type);
    if (type === 'success') {
      setRefreshParents((prev) => prev + 1);
    }
  };

  const handleClassSuccess = (message, type = 'success') => {
    showToast(message, type);
    if (type === 'success') {
      setRefreshClasses((prev) => prev + 1);
    }
  };

  return (
    <>
      <header className="header">
        <div>
          <h1>TeenUp LMS</h1>
        </div>
        <span className="header-badge">Learning Management System</span>
      </header>

      <nav className="tabs">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`tab ${activeTab === i ? 'active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="main">
        {activeTab === 0 && (
          <div className="grid-2">
            <ParentForm onSuccess={handleParentSuccess} />
            <StudentForm onSuccess={showToast} refreshParents={refreshParents} />
          </div>
        )}
        {activeTab === 1 && (
          <div>
            <ClassForm onSuccess={handleClassSuccess} />
            <div style={{ marginTop: 'var(--space-8)' }}>
              <ClassSchedule refreshClasses={refreshClasses} />
            </div>
            <div style={{ marginTop: 'var(--space-8)' }}>
              <RegisterStudent onSuccess={showToast} refreshClasses={refreshClasses} />
            </div>
          </div>
        )}
        {activeTab === 2 && <SubscriptionView onSuccess={showToast} />}
      </main>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}
