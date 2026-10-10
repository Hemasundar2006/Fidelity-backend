import { API_BASE } from '../config';

export const getAuthToken = () => {
  return localStorage.getItem('jl_token') || '';
};

// 1. Public: Fetch active doctors for booking
export const fetchDoctors = async () => {
  try {
    const res = await fetch(`${API_BASE}/appointments/doctors`);
    const data = await res.json();
    if (data.success && data.data?.length > 0) {
      return data.data;
    }
  } catch (err) {
    console.warn('Backend doctors fetch failed, using fallback specialist data:', err);
  }

  // Fallback defaults
  return [
    { _id: '6abdedebc9d8d241bc33eb0a', name: 'Dr. Smith', specialization: 'Senior Consultant - Obstetrics & High-Risk Pregnancy', email: 'smith@fid.com' },
    { _id: '6abdedebc9d8d241bc33eb0b', name: 'Dr. Jones', specialization: 'Consultant - Maternal-Fetal Medicine & Perinatology', email: 'jones@fid.com' }
  ];
};

// 1.5. Public: Fetch live OPD summary (todays counts, doctors, opd status)
export const fetchOpdSummary = async () => {
  try {
    const res = await fetch(`${API_BASE}/appointments/opd-summary`);
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
  } catch (err) {
    console.warn('Backend OPD summary fetch failed:', err);
  }
  return null;
};

// 2. Public: Fetch slots for chosen doctor and date
export const fetchAvailableSlots = async (doctorId, dateStr) => {
  try {
    const res = await fetch(`${API_BASE}/appointments/available-slots?doctor=${doctorId}&date=${dateStr}`);
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
  } catch (err) {
    console.warn('Backend slots fetch error:', err);
  }

  // Fallback slots generator for offline resilience
  const defaultTimes = [
    { time: '09:00 AM', range: '09:00 AM - 09:30 AM', period: 'Morning' },
    { time: '09:30 AM', range: '09:30 AM - 10:00 AM', period: 'Morning' },
    { time: '10:00 AM', range: '10:00 AM - 10:30 AM', period: 'Morning' },
    { time: '10:30 AM', range: '10:30 AM - 11:00 AM', period: 'Morning' },
    { time: '11:00 AM', range: '11:00 AM - 11:30 AM', period: 'Morning' },
    { time: '11:30 AM', range: '11:30 AM - 12:00 PM', period: 'Morning' },
    { time: '02:00 PM', range: '02:00 PM - 02:30 PM', period: 'Afternoon' },
    { time: '02:30 PM', range: '02:30 PM - 03:00 PM', period: 'Afternoon' },
    { time: '03:00 PM', range: '03:00 PM - 03:30 PM', period: 'Afternoon' },
    { time: '03:30 PM', range: '03:30 PM - 04:00 PM', period: 'Afternoon' }
  ];

  return {
    date: dateStr,
    doctor: doctorId,
    slots: defaultTimes.map((t, idx) => ({
      time: t.time,
      displayRange: t.range,
      period: t.period,
      available: idx !== 2
    })),
    totalSlots: defaultTimes.length,
    availableCount: defaultTimes.length - 1
  };
};

// 3. Public: Submit booking request
export const bookAppointmentPublic = async (payload) => {
  const res = await fetch(`${API_BASE}/appointments/public-book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error?.message || 'Failed to complete booking. Please check slot availability.');
  }

  return data.data;
};

// 4. Receptionist: Fetch live appointments
export const fetchAppointments = async ({ date, doctor, status } = {}) => {
  try {
    let url = `${API_BASE}/appointments?`;
    if (date) url += `date=${date}&`;
    if (doctor && doctor !== 'All') url += `doctor=${doctor}&`;
    if (status) url += `status=${status}&`;

    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { headers });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
  } catch (err) {
    console.warn('Could not fetch server appointments:', err);
  }
  return null;
};

// 5. Receptionist: Check In patient
export const updateAppointmentStatus = async (id, status) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/appointments/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ status })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error?.message || 'Failed to update appointment');
  }
  return data.data;
};

// 6. Dashboard: Fetch live metrics and high-risk cases
export const fetchDashboardStats = async () => {
  try {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/dashboard/stats`, { headers });
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
  } catch (err) {
    console.warn('Could not fetch dashboard stats:', err);
  }
  return null;
};

// 7. Bilingual RAG Clinical Engine: Report-Based Risk Prediction
export const predictRagReport = async (reportData) => {
  const res = await fetch(`${API_BASE}/rag/predict-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.message || data?.error?.message || 'Report prediction failed');
  }
  return data.data;
};

// 8. Bilingual RAG Clinical Engine: Voice & Text Spoken Chat
export const askRagChat = async ({ query, language = 'en', patientContext = null }) => {
  const res = await fetch(`${API_BASE}/rag/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, language, patientContext })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.message || data?.error?.message || 'Chat query failed');
  }
  return data.data;
};

// 9. Bilingual RAG Clinical Engine: Fetch Reference Tables
export const fetchRagReference = async () => {
  const res = await fetch(`${API_BASE}/rag/reference`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.message || 'Failed to fetch RAG reference tables');
  }
  return data.data;
};

// 10. Dedicated Trilingual Personal Health Assistant for Logged-in Patient
export const askRagPersonalAssistant = async ({ patientId, query, conversationHistory = [], language = 'te' }) => {
  const res = await fetch(`${API_BASE}/rag/patient-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, query, conversationHistory, language })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.message || data?.error?.message || 'Personal assistant query failed');
  }
  return data.data;
};


