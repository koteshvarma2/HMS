// app.js - HMS behavior, localStorage, CRUD, CSV export

// Data
let patients = [];
let doctors = [];
let appointments = [];
let currentEditId = null;
const LS_KEYS = { PATIENTS: 'hms_patients', DOCTORS: 'hms_doctors', APPTS: 'hms_appointments' };

// Sample data (only inserted if localStorage empty)
const SAMPLE = {
  patients: [
    { id: 1, name: 'John Doe', age: 45, gender: 'Male', contact: '123-456-7890', blood: 'O+', address: '123 Main St' },
    { id: 2, name: 'Jane Smith', age: 32, gender: 'Female', contact: '098-765-4321', blood: 'A+', address: '456 Oak Ave' },
    { id: 3, name: 'Robert Johnson', age: 58, gender: 'Male', contact: '555-123-4567', blood: 'B+', address: '789 Pine Rd' }
  ],
  doctors: [
    { id: 1, name: 'Dr. Sarah Wilson', specialization: 'Cardiology', contact: '555-111-2222', email: 'sarah.wilson@hospital.com' },
    { id: 2, name: 'Dr. Michael Brown', specialization: 'Neurology', contact: '555-333-4444', email: 'michael.brown@hospital.com' },
    { id: 3, name: 'Dr. Emily Davis', specialization: 'Pediatrics', contact: '555-555-6666', email: 'emily.davis@hospital.com' }
  ],
  appointments: [
    { id: 1, patientId: 1, doctorId: 1, date: getFutureDate(5), time: '10:00', status: 'Scheduled', notes: 'Regular checkup' },
    { id: 2, patientId: 2, doctorId: 3, date: getFutureDate(7), time: '14:30', status: 'Scheduled', notes: 'Follow-up visit' }
  ]
};

// helpers
function saveAll() {
  localStorage.setItem(LS_KEYS.PATIENTS, JSON.stringify(patients));
  localStorage.setItem(LS_KEYS.DOCTORS, JSON.stringify(doctors));
  localStorage.setItem(LS_KEYS.APPTS, JSON.stringify(appointments));
}

function loadAll() {
  patients = JSON.parse(localStorage.getItem(LS_KEYS.PATIENTS) || 'null') || [];
  doctors = JSON.parse(localStorage.getItem(LS_KEYS.DOCTORS) || 'null') || [];
  appointments = JSON.parse(localStorage.getItem(LS_KEYS.APPTS) || 'null') || [];
  // if all empty, inject sample
  if (patients.length === 0 && doctors.length === 0 && appointments.length === 0) {
    patients = SAMPLE.patients.slice();
    doctors = SAMPLE.doctors.slice();
    appointments = SAMPLE.appointments.slice();
    saveAll();
  }
}

function getFutureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e){
    e.preventDefault();
    navigateToSection(this.dataset.section);
  });
});
document.querySelectorAll('[data-navigate]').forEach(el => {
  el.addEventListener('click', function(){ navigateToSection(this.dataset.navigate); });
});
function navigateToSection(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const sec = document.getElementById(section);
  if (!sec) return;
  sec.classList.add('active');
  const nav = document.querySelector(`[data-section="${section}"]`);
  if (nav) nav.classList.add('active');

  if (section === 'patients') renderPatients();
  if (section === 'doctors') renderDoctors();
  if (section === 'appointments') renderAppointments();
}

// Stats
function updateStats() {
  document.getElementById('patients-count').textContent = patients.length;
  document.getElementById('doctors-count').textContent = doctors.length;
  document.getElementById('appointments-count').textContent = appointments.length;
}

// Render functions
function renderPatients(filter='') {
  const tbody = document.getElementById('patients-tbody');
  const filtered = patients.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No patients found</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${escapeHtml(p.name)}</td>
      <td>${p.age}</td>
      <td>${p.gender}</td>
      <td>${escapeHtml(p.contact)}</td>
      <td>${p.blood || '-'}</td>
      <td class="action-buttons">
        <button class="btn btn-small btn-success" onclick="editPatient(${p.id})">Edit</button>
        <button class="btn btn-small btn-danger" onclick="deletePatient(${p.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderDoctors(filter='') {
  const tbody = document.getElementById('doctors-tbody');
  const filtered = doctors.filter(d => d.name.toLowerCase().includes(filter.toLowerCase()) || d.specialization.toLowerCase().includes(filter.toLowerCase()));
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No doctors found</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map(d => `
    <tr>
      <td>${d.id}</td>
      <td>${escapeHtml(d.name)}</td>
      <td>${escapeHtml(d.specialization)}</td>
      <td>${escapeHtml(d.contact)}</td>
      <td>${escapeHtml(d.email)}</td>
      <td class="action-buttons">
        <button class="btn btn-small btn-success" onclick="editDoctor(${d.id})">Edit</button>
        <button class="btn btn-small btn-danger" onclick="deleteDoctor(${d.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderAppointments(filter='') {
  const tbody = document.getElementById('appointments-tbody');
  const filtered = appointments.filter(a => {
    const patient = patients.find(p => p.id === a.patientId);
    const doctor = doctors.find(d => d.id === a.doctorId);
    const patientName = patient ? patient.name.toLowerCase() : '';
    const doctorName = doctor ? doctor.name.toLowerCase() : '';
    return patientName.includes(filter.toLowerCase()) || doctorName.includes(filter.toLowerCase());
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No appointments found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(a => {
    const patient = patients.find(p => p.id === a.patientId);
    const doctor = doctors.find(d => d.id === a.doctorId);
    return `
      <tr>
        <td>${a.id}</td>
        <td>${patient ? escapeHtml(patient.name) : 'Unknown'}</td>
        <td>${doctor ? escapeHtml(doctor.name) : 'Unknown'}</td>
        <td>${a.date}</td>
        <td>${a.time}</td>
        <td>${escapeHtml(a.status)}</td>
        <td class="action-buttons">
          <button class="btn btn-small btn-success" onclick="editAppointment(${a.id})">Edit</button>
          <button class="btn btn-small btn-danger" onclick="deleteAppointment(${a.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Patient modal & CRUD
function showAddPatientModal() {
  currentEditId = null;
  document.getElementById('patient-modal-title').textContent = 'Add New Patient';
  document.getElementById('patient-form').reset();
  document.getElementById('patient-id').value = '';
  document.getElementById('patient-modal').classList.add('active');
}

function editPatient(id) {
  const p = patients.find(x => x.id === id);
  if (!p) return;
  currentEditId = id;
  document.getElementById('patient-modal-title').textContent = 'Edit Patient';
  document.getElementById('patient-id').value = p.id;
  document.getElementById('patient-name').value = p.name;
  document.getElementById('patient-age').value = p.age;
  document.getElementById('patient-gender').value = p.gender;
  document.getElementById('patient-contact').value = p.contact;
  document.getElementById('patient-blood').value = p.blood || '';
  document.getElementById('patient-address').value = p.address || '';
  document.getElementById('patient-modal').classList.add('active');
}

function deletePatient(id) {
  if (!confirm('Are you sure you want to delete this patient?')) return;
  // also remove appointments for that patient
  appointments = appointments.filter(a => a.patientId !== id);
  patients = patients.filter(p => p.id !== id);
  saveAll();
  renderPatients();
  renderAppointments();
  updateStats();
}

// Doctor modal & CRUD
function showAddDoctorModal() {
  currentEditId = null;
  document.getElementById('doctor-modal-title').textContent = 'Add New Doctor';
  document.getElementById('doctor-form').reset();
  document.getElementById('doctor-id').value = '';
  document.getElementById('doctor-modal').classList.add('active');
}

function editDoctor(id) {
  const d = doctors.find(x => x.id === id);
  if (!d) return;
  currentEditId = id;
  document.getElementById('doctor-modal-title').textContent = 'Edit Doctor';
  document.getElementById('doctor-id').value = d.id;
  document.getElementById('doctor-name').value = d.name;
  document.getElementById('doctor-specialization').value = d.specialization;
  document.getElementById('doctor-contact').value = d.contact;
  document.getElementById('doctor-email').value = d.email;
  document.getElementById('doctor-modal').classList.add('active');
}

function deleteDoctor(id) {
  if (!confirm('Are you sure you want to delete this doctor?')) return;
  // remove appointments with that doctor
  appointments = appointments.filter(a => a.doctorId !== id);
  doctors = doctors.filter(d => d.id !== id);
  saveAll();
  renderDoctors();
  renderAppointments();
  updateStats();
}

// Appointment modal & CRUD
function showAddAppointmentModal() {
  currentEditId = null;
  document.getElementById('appointment-modal-title').textContent = 'Schedule Appointment';
  document.getElementById('appointment-form').reset();
  document.getElementById('appointment-id').value = '';
  populateAppointmentDropdowns();
  document.getElementById('appointment-modal').classList.add('active');
}

function populateAppointmentDropdowns() {
  const patientSelect = document.getElementById('appointment-patient');
  const doctorSelect = document.getElementById('appointment-doctor');
  patientSelect.innerHTML = '<option value="">Select Patient</option>' + patients.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
  doctorSelect.innerHTML = '<option value="">Select Doctor</option>' + doctors.map(d => `<option value="${d.id}">${escapeHtml(d.name)} - ${escapeHtml(d.specialization)}</option>`).join('');
}

function editAppointment(id) {
  const a = appointments.find(x => x.id === id);
  if (!a) return;
  currentEditId = id;
  document.getElementById('appointment-modal-title').textContent = 'Edit Appointment';
  populateAppointmentDropdowns();
  document.getElementById('appointment-id').value = a.id;
  document.getElementById('appointment-patient').value = a.patientId;
  document.getElementById('appointment-doctor').value = a.doctorId;
  document.getElementById('appointment-date').value = a.date;
  document.getElementById('appointment-time').value = a.time;
  document.getElementById('appointment-status').value = a.status;
  document.getElementById('appointment-notes').value = a.notes || '';
  document.getElementById('appointment-modal').classList.add('active');
}

function deleteAppointment(id) {
  if (!confirm('Are you sure you want to delete this appointment?')) return;
  appointments = appointments.filter(a => a.id !== id);
  saveAll();
  renderAppointments();
  updateStats();
}

// Form handlers
document.getElementById('patient-form').addEventListener('submit', function(e){
  e.preventDefault();
  const data = {
    name: document.getElementById('patient-name').value.trim(),
    age: parseInt(document.getElementById('patient-age').value, 10),
    gender: document.getElementById('patient-gender').value,
    contact: document.getElementById('patient-contact').value.trim(),
    blood: document.getElementById('patient-blood').value,
    address: document.getElementById('patient-address').value.trim()
  };
  if (currentEditId) {
    const idx = patients.findIndex(p => p.id === currentEditId);
    patients[idx] = { ...patients[idx], ...data };
  } else {
    const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
    patients.push({ id: newId, ...data });
  }
  saveAll();
  closeModal('patient-modal');
  renderPatients();
  renderAppointments(); // patient name might show in appointments
  updateStats();
});

document.getElementById('doctor-form').addEventListener('submit', function(e){
  e.preventDefault();
  const data = {
    name: document.getElementById('doctor-name').value.trim(),
    specialization: document.getElementById('doctor-specialization').value.trim(),
    contact: document.getElementById('doctor-contact').value.trim(),
    email: document.getElementById('doctor-email').value.trim()
  };
  if (currentEditId) {
    const idx = doctors.findIndex(d => d.id === currentEditId);
    doctors[idx] = { ...doctors[idx], ...data };
  } else {
    const newId = doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
    doctors.push({ id: newId, ...data });
  }
  saveAll();
  closeModal('doctor-modal');
  renderDoctors();
  renderAppointments();
  updateStats();
});

document.getElementById('appointment-form').addEventListener('submit', function(e){
  e.preventDefault();
  const patientId = parseInt(document.getElementById('appointment-patient').value, 10);
  const doctorId = parseInt(document.getElementById('appointment-doctor').value, 10);
  const data = {
    patientId,
    doctorId,
    date: document.getElementById('appointment-date').value,
    time: document.getElementById('appointment-time').value,
    status: document.getElementById('appointment-status').value,
    notes: document.getElementById('appointment-notes').value.trim()
  };
  if (!patientId || !doctorId) {
    alert('Please select both patient and doctor.');
    return;
  }
  if (currentEditId) {
    const idx = appointments.findIndex(a => a.id === currentEditId);
    appointments[idx] = { ...appointments[idx], ...data };
  } else {
    const newId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
    appointments.push({ id: newId, ...data });
  }
  saveAll();
  closeModal('appointment-modal');
  renderAppointments();
  updateStats();
});

// Modal utilities
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', function(e){ if (e.target === this) this.classList.remove('active'); });
});

// Search helpers
function searchPatients() { renderPatients(document.getElementById('patient-search').value); }
function searchDoctors() { renderDoctors(document.getElementById('doctor-search').value); }
function searchAppointments() { renderAppointments(document.getElementById('appointment-search').value); }

// Set min date for appointment to today
document.getElementById('appointment-date').setAttribute('min', new Date().toISOString().split('T')[0]);

// CSV export helpers
function arrayToCSV(rows) {
  return rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
}

function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.setAttribute('download', filename); document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function exportPatientsCSV() {
  const rows = [['ID','Name','Age','Gender','Contact','Blood Group','Address']];
  patients.forEach(p => rows.push([p.id, p.name, p.age, p.gender, p.contact, p.blood || '', p.address || '']));
  downloadCSV('patients.csv', arrayToCSV(rows));
}

function exportAppointmentsCSV() {
  const rows = [['ID','Patient','Doctor','Date','Time','Status','Notes']];
  appointments.forEach(a => {
    const patient = patients.find(p => p.id === a.patientId);
    const doctor = doctors.find(d => d.id === a.doctorId);
    rows.push([a.id, patient ? patient.name : 'Unknown', doctor ? doctor.name : 'Unknown', a.date, a.time, a.status, a.notes || '']);
  });
  downloadCSV('appointments.csv', arrayToCSV(rows));
}

// small helpers
function escapeHtml(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// initialization
function init() {
  loadAll();
  updateStats();
  renderPatients();
  // ensure dashboard shows recent counts
  // pre-render appointment/doctor lists if user navigates
  // wire search input listeners already inline in HTML
}

init();
