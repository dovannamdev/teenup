const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

// Parents
export const createParent = (data) => request('/parents', { method: 'POST', body: JSON.stringify(data) });
export const getParent = (id) => request(`/parents/${id}`);
export const getParents = () => request('/parents');

// Students
export const createStudent = (data) => request('/students', { method: 'POST', body: JSON.stringify(data) });
export const getStudent = (id) => request(`/students/${id}`);
export const getStudents = () => request('/students');

// Classes
export const getClasses = (day) => request(`/classes${day ? `?day=${day}` : ''}`);
export const createClass = (data) => request('/classes', { method: 'POST', body: JSON.stringify(data) });

// Registrations
export const registerStudent = (classId, studentId) =>
  request(`/classes/${classId}/register`, { method: 'POST', body: JSON.stringify({ studentId }) });
export const cancelRegistration = (id) => request(`/registrations/${id}`, { method: 'DELETE' });
export const getRegistrations = () => request('/registrations');

// Subscriptions
export const createSubscription = (data) => request('/subscriptions', { method: 'POST', body: JSON.stringify(data) });
export const getSubscription = (id) => request(`/subscriptions/${id}`);
export const getSubscriptions = () => request('/subscriptions');
export const useSubscriptionSession = (id) => request(`/subscriptions/${id}/use`, { method: 'PATCH' });
