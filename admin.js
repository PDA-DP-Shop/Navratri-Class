import { db } from './firebase-config.js';
import { collection, query, orderBy, getDocs, where, updateDoc, doc } from 'firebase/firestore';

// DOM Elements
const registrationsTableBody = document.getElementById('registrationsTableBody');
const searchInput = document.getElementById('searchInput');
const batchFilter = document.getElementById('batchFilter');
const statusFilter = document.getElementById('statusFilter');
const totalRegistrations = document.getElementById('totalRegistrations');
const todayRegistrations = document.getElementById('todayRegistrations');

// State
let allRegistrations = [];
let filteredRegistrations = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadRegistrations();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    searchInput.addEventListener('input', filterRegistrations);
    batchFilter.addEventListener('change', filterRegistrations);
    statusFilter.addEventListener('change', filterRegistrations);
}

// Load Registrations
async function loadRegistrations() {
    try {
        registrationsTableBody.innerHTML = '<tr><td colspan="7" class="loading"></td></tr>';
        
        const registrationsRef = collection(db, 'registrations');
        const q = query(registrationsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        allRegistrations = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
        }));

        updateStats();
        filterRegistrations();
    } catch (error) {
        console.error('Error loading registrations:', error);
        showError('Failed to load registrations. Please try again.');
    }
}

// Update Statistics
function updateStats() {
    const total = allRegistrations.length;
    const today = allRegistrations.filter(reg => {
        const regDate = new Date(reg.timestamp);
        const today = new Date();
        return regDate.toDateString() === today.toDateString();
    }).length;

    totalRegistrations.textContent = total;
    todayRegistrations.textContent = today;
}

// Filter Registrations
function filterRegistrations() {
    const searchTerm = searchInput.value.toLowerCase();
    const batchValue = batchFilter.value;
    const statusValue = statusFilter.value;

    filteredRegistrations = allRegistrations.filter(reg => {
        const matchesSearch = 
            reg.name.toLowerCase().includes(searchTerm) ||
            reg.email.toLowerCase().includes(searchTerm) ||
            reg.mobile.includes(searchTerm);

        const matchesBatch = !batchValue || reg.batch === batchValue;
        const matchesStatus = !statusValue || reg.status === statusValue;

        return matchesSearch && matchesBatch && matchesStatus;
    });

    renderRegistrations();
}

// Render Registrations
function renderRegistrations() {
    registrationsTableBody.innerHTML = '';

    if (filteredRegistrations.length === 0) {
        registrationsTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px;">
                    No registrations found
                </td>
            </tr>
        `;
        return;
    }

    filteredRegistrations.forEach(reg => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${reg.photoUrl ? 
                        `<img src="${reg.photoUrl}" alt="${reg.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">` :
                        `<div style="width: 40px; height: 40px; border-radius: 50%; background: #e0e0e0; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-user" style="color: #666;"></i>
                        </div>`
                    }
                    <div>
                        <div style="font-weight: 500;">${reg.name}</div>
                        <div style="font-size: 12px; color: #666;">${reg.email}</div>
                    </div>
                </div>
            </td>
            <td>${reg.age}</td>
            <td>${reg.mobile}</td>
            <td>${formatBatch(reg.batch)}</td>
            <td>
                <span class="status-badge status-${reg.status || 'pending'}">
                    ${reg.status || 'pending'}
                </span>
            </td>
            <td>${formatDate(reg.timestamp)}</td>
            <td>
                <div class="action-buttons">
                    ${reg.status !== 'approved' ? 
                        `<button class="btn btn-approve" onclick="updateStatus('${reg.id}', 'approved')">
                            <i class="fas fa-check"></i>
                        </button>` : ''
                    }
                    ${reg.status !== 'rejected' ? 
                        `<button class="btn btn-reject" onclick="updateStatus('${reg.id}', 'rejected')">
                            <i class="fas fa-times"></i>
                        </button>` : ''
                    }
                    <button class="btn btn-view" onclick="viewDetails('${reg.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        registrationsTableBody.appendChild(row);
    });
}

// Update Registration Status
async function updateStatus(registrationId, newStatus) {
    try {
        const registrationRef = doc(db, 'registrations', registrationId);
        await updateDoc(registrationRef, {
            status: newStatus,
            updatedAt: new Date()
        });

        // Update local data
        const registration = allRegistrations.find(reg => reg.id === registrationId);
        if (registration) {
            registration.status = newStatus;
            registration.updatedAt = new Date();
        }

        filterRegistrations();
        showSuccess(`Registration ${newStatus} successfully`);
    } catch (error) {
        console.error('Error updating status:', error);
        showError('Failed to update status. Please try again.');
    }
}

// View Registration Details
function viewDetails(registrationId) {
    const registration = allRegistrations.find(reg => reg.id === registrationId);
    if (!registration) return;

    // Create modal content
    const modalContent = `
        <div class="modal-content">
            <h2>Registration Details</h2>
            <div class="details-grid">
                <div class="detail-item">
                    <label>Name:</label>
                    <span>${registration.name}</span>
                </div>
                <div class="detail-item">
                    <label>Age:</label>
                    <span>${registration.age}</span>
                </div>
                <div class="detail-item">
                    <label>Email:</label>
                    <span>${registration.email}</span>
                </div>
                <div class="detail-item">
                    <label>Mobile:</label>
                    <span>${registration.mobile}</span>
                </div>
                <div class="detail-item">
                    <label>Batch:</label>
                    <span>${formatBatch(registration.batch)}</span>
                </div>
                <div class="detail-item">
                    <label>Status:</label>
                    <span class="status-badge status-${registration.status || 'pending'}">
                        ${registration.status || 'pending'}
                    </span>
                </div>
                <div class="detail-item">
                    <label>Registration Date:</label>
                    <span>${formatDate(registration.timestamp)}</span>
                </div>
                ${registration.photoUrl ? `
                    <div class="detail-item full-width">
                        <label>Photo:</label>
                        <img src="${registration.photoUrl}" alt="${registration.name}" style="max-width: 200px; border-radius: 8px;">
                    </div>
                ` : ''}
            </div>
            <button class="btn btn-view" onclick="closeModal()">Close</button>
        </div>
    `;

    // Show modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Close Modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Utility Functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatBatch(batch) {
    const batchMap = {
        'morning': 'Morning Batch',
        'evening': 'Evening Batch',
        'weekend': 'Weekend Batch'
    };
    return batchMap[batch] || batch;
}

function showSuccess(message) {
    // Implement toast notification
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showError(message) {
    // Implement toast notification
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Add toast styles
const style = document.createElement('style');
style.textContent = `
    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 4px;
        color: white;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    .toast.success {
        background-color: var(--admin-success);
    }

    .toast.error {
        background-color: var(--admin-danger);
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 24px;
        border-radius: 8px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    }

    .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin: 20px 0;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .detail-item label {
        font-size: 12px;
        color: #666;
    }

    .detail-item.full-width {
        grid-column: 1 / -1;
    }
`;
document.head.appendChild(style); 