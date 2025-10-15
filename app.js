// ================== DATA STORAGE ==================
let patients = [];
let doctors = [];
let appointments = [];
let bills = [];
let currentEditId = null;

// ================== SAMPLE DATA ==================
function initSampleData() {
  if (patients.length === 0) {
    patients = [
      { id: 1, name: 'John Doe', age: 45, gender: 'Male', contact: '123-456-7890', blood: 'O+', address: '123 Main St' },
      { id: 2, name: 'Jane Smith', age: 32, gender: 'Female', contact: '098-765-4321', blood: 'A+', address: '456 Oak Ave' },
      { id: 3, name: 'Robert Johnson', age: 58, gender: 'Male', contact: '555-123-4567', blood: 'B+', address: '789 Pine Rd' }
    ];
  }

  if (doctors.length === 0) {
    doctors = [
      { id: 1, name: 'Dr. Sarah Wilson', specialization: 'Cardiology', contact: '555-111-2222', email: 'sarah.wilson@hospital.com' },
      { id: 2, name: 'Dr. Michael Brown', specialization: 'Neurology', contact: '555-333-4444', email: 'michael.brown@hospital.com' },
      { id: 3, name: 'Dr. Emily Davis', specialization: 'Pediatrics', contact: '555-555-6666', email: 'emily.davis@hospital.com' }
    ];
  }

  if (appointments.length === 0) {
    appointments = [
      { id: 1, patientId: 1, doctorId: 1, date: '2025-10-20', time: '10:00', status: 'Scheduled', notes: 'Regular checkup' },
      { id: 2, patientId: 2, doctorId: 3, date: '2025-10-22', time: '14:30', status: 'Scheduled', notes: 'Follow-up visit' }
    ];
  }

  if (bills.length === 0) {
    bills = [
      { id: 1, patientId: 1, doctorId: 2, amount: 1200, status: 'Paid', date: '2025-10-10' },
      { id: 2, patientId: 3, doctorId: 1, amount: 850, status: 'Unpaid', date: '2025-10-14' }
    ];
  }
}

// ================== NAVIGATION ==================
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const section = this.dataset.section;
    navigateToSection(section);
  });
});

document.querySelectorAll('[data-navigate]').forEach(el => {
  el.addEventListener('click', function() {
    const section = this.dataset.navigate;
    navigateToSection(section);
  });
});

function navigateToSection(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const sec = document.getElementById(section);
  if(sec) sec.classList.add('active');
  const navLink = document.querySelector(`[data-section="${section}"]`);
  if(navLink) navLink.classList.add('active');

  if (section === 'patients') renderPatients();
  if (section === 'doctors') renderDoctors();
  if (section === 'appointments') renderAppointments();
  if (section === 'billing') renderBilling();
  if (section === 'notifications') renderNotifications();
  if (section === 'analytics') renderChart();
}

// ================== UPDATE DASHBOARD STATS ==================
function updateStats() {
  document.getElementById('patients-count').textContent = patients.length;
  document.getElementById('doctors-count').textContent = doctors.length;
  document.getElementById('appointments-count').textContent = appointments.length;
}

// ================== PATIENT FUNCTIONS ==================
function renderPatients(filter = '') {
  const tbody = document.getElementById('patients-tbody');
  const filtered = patients.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

  if(filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No patients found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.age}</td>
      <td>${p.gender}</td>
      <td>${p.contact}</td>
      <td>${p.blood || '-'}</td>
      <td class="action-buttons">
        <button class="btn btn-small btn-success" onclick="editPatient(${p.id})">Edit</button>
        <button class="btn btn-small btn-danger" onclick="deletePatient(${p.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function showAddPatientModal() {
  currentEditId = null;
  document.getElementById('patient-modal-title').textContent = 'Add New Patient';
  document.getElementById('patient-form').reset();
  document.getElementById('patient-id').value = '';
  document.getElementById('patient-modal').classList.add('active');
}

function editPatient(id) {
  const p = patients.find(p => p.id === id);
  if(!p) return;
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
  if(confirm('Are you sure you want to delete this patient?')) {
    patients = patients.filter(p => p.id !== id);
    renderPatients();
    updateStats();
  }
}

document.getElementById('patient-form').addEventListener('submit', function(e){
  e.preventDefault();
  const patientData = {
    name: document.getElementById('patient-name').value,
    age: parseInt(document.getElementById('patient-age').value),
    gender: document.getElementById('patient-gender').value,
    contact: document.getElementById('patient-contact').value,
    blood: document.getElementById('patient-blood').value,
    address: document.getElementById('patient-address').value
  };

  if(currentEditId) {
    const index = patients.findIndex(p => p.id === currentEditId);
    patients[index] = { ...patients[index], ...patientData };
  } else {
    const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id))+1 : 1;
    patients.push({id:newId, ...patientData});
  }
  closeModal('patient-modal');
  renderPatients();
  updateStats();
});

function searchPatients() {
  const filter = document.getElementById('patient-search').value;
  renderPatients(filter);
}

// ================== DOCTOR FUNCTIONS ==================
function renderDoctors(filter='') {
  const tbody = document.getElementById('doctors-tbody');
  const filtered = doctors.filter(d => d.name.toLowerCase().includes(filter.toLowerCase()) || d.specialization.toLowerCase().includes(filter.toLowerCase()));

  if(filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No doctors found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(d => `
    <tr>
      <td>${d.id}</td>
      <td>${d.name}</td>
      <td>${d.specialization}</td>
      <td>${d.contact}</td>
      <td>${d.email}</td>
      <td class="action-buttons">
        <button class="btn btn-small btn-success" onclick="editDoctor(${d.id})">Edit</button>
        <button class="btn btn-small btn-danger" onclick="deleteDoctor(${d.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function showAddDoctorModal() {
  currentEditId = null;
  document.getElementById('doctor-modal-title').textContent = 'Add New Doctor';
  document.getElementById('doctor-form').reset();
  document.getElementById('doctor-id').value = '';
  document.getElementById('doctor-modal').classList.add('active');
}

function editDoctor(id) {
  const d = doctors.find(d => d.id === id);
  if(!d) return;
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
  if(confirm('Are you sure you want to delete this doctor?')) {
    doctors = doctors.filter(d => d.id !== id);
    renderDoctors();
    updateStats();
  }
}

document.getElementById('doctor-form').addEventListener('submit', function(e){
  e.preventDefault();
  const doctorData = {
    name: document.getElementById('doctor-name').value,
    specialization: document.getElementById('doctor-specialization').value,
    contact: document.getElementById('doctor-contact').value,
    email: document.getElementById('doctor-email').value
  };

  if(currentEditId) {
    const index = doctors.findIndex(d => d.id === currentEditId);
    doctors[index] = { ...doctors[index], ...doctorData };
  } else {
    const newId = doctors.length > 0 ? Math.max(...doctors.map(d => d.id))+1 : 1;
    doctors.push({id:newId, ...doctorData});
  }
  closeModal('doctor-modal');
  renderDoctors();
  updateStats();
});

function searchDoctors() {
  const filter = document.getElementById('doctor-search').value;
  renderDoctors(filter);
}

// ================== APPOINTMENT FUNCTIONS ==================
function renderAppointments(filter='') {
  const tbody = document.getElementById('appointments-tbody');
  const filtered = appointments.filter(a => {
    const patientName = patients.find(p=>p.id===a.patientId)?.name.toLowerCase()||'';
    const doctorName = doctors.find(d=>d.id===a.doctorId)?.name.toLowerCase()||'';
    return patientName.includes(filter.toLowerCase()) || doctorName.includes(filter.toLowerCase());
  });

  if(filtered.length===0){
    tbody.innerHTML='<tr><td colspan="7" class="empty-state">No appointments found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(a => {
    const patient = patients.find(p=>p.id===a.patientId)?.name || 'Unknown';
    const doctor = doctors.find(d=>d.id===a.doctorId)?.name || 'Unknown';
    const statusClass = a.status==='Scheduled' ? 'status-scheduled' : (a.status==='Completed' ? 'status-completed' : 'status-cancelled');
    return `<tr>
      <td>${a.id}</td>
      <td>${patient}</td>
      <td>${doctor}</td>
      <td>${a.date}</td>
      <td>${a.time}</td>
      <td><span class="${statusClass}">${a.status}</span></td>
      <td class="action-buttons">
        <button class="btn btn-small btn-success" onclick="editAppointment(${a.id})">Edit</button>
        <button class="btn btn-small btn-danger" onclick="deleteAppointment(${a.id})">Delete</button>
      </td>
    </tr>`;
  }).join('');

  // Populate select dropdowns
  const patientSelect =
