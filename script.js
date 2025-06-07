// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-storage.js";

// Debug: Check the type of query to ensure it's a function
console.log('typeof query:', typeof query); // Should log 'function'

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCGp2GySAIiaV1F5M8pmd17aZWD0AoPIe4",
    authDomain: "navratri-7a5a7.firebaseapp.com",
    projectId: "navratri-7a5a7",
    storageBucket: "navratri-7a5a7.firebasestorage.app",
    messagingSenderId: "249512194624",
    appId: "1:249512194624:web:2df1852f5a6a5844fba5a5",
    measurementId: "G-984EXN4BTR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Function to fetch and display all registrations
async function displayAllRegistrations() {
    const tableBody = document.getElementById('registrationsTableBody');
    
    try {
        // Show loading message
        tableBody.innerHTML = '<tr><td colspan="8" class="loading-message">Loading registrations...</td></tr>';

        // Query Firestore for all registrations, ordered by creation date
        const registrationsRef = collection(db, 'registrations');
        const q = query(registrationsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="8" class="no-data">No registrations found</td></tr>';
            return;
        }

        // Build table rows
        let tableHTML = '';
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const date = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : 'N/A';
            
            tableHTML += `
                <tr>
                    <td>${data.name || ''}</td>
                    <td>${data.mobile || ''}</td>
                    <td>${data.email || ''}</td>
                    <td>${data.gender || ''}</td>
                    <td>${data.age || ''}</td>
                    <td>${data.batch || ''}</td>
                    <td>${data.paymentMethod === 'gpay' ? 'Google Pay' : 'Offline Payment'}</td>
                    <td>${date}</td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableHTML;

    } catch (error) {
        console.error('Error fetching registrations:', error);
        tableBody.innerHTML = '<tr><td colspan="8" class="error-message">Error loading registrations. Please try again.</td></tr>';
    }
}

// Call displayAllRegistrations when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayAllRegistrations();
    // Update registrations every 5 minutes
    setInterval(displayAllRegistrations, 5 * 60 * 1000);
});

// Add styles for the registrations table
const tableStyles = document.createElement('style');
tableStyles.textContent = `
    .table-responsive {
        overflow-x: auto;
        margin: 20px 0;
    }

    .registrations-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .registrations-table th,
    .registrations-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }

    .registrations-table th {
        background-color: #f5f5f5;
        font-weight: 600;
    }

    .registrations-table tbody tr:hover {
        background-color: #f9f9f9;
    }

    .registrations-table .status {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.9em;
    }

    .registrations-table .status.completed {
        background-color: #e7f7ed;
        color: #1d6f42;
    }

    .registrations-table .status.pending {
        background-color: #fff4e5;
        color: #945e00;
    }

    .view-btn {
        padding: 6px 12px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9em;
    }

    .view-btn:hover {
        background-color: #0056b3;
    }

    .loading-message,
    .no-data,
    .error-message {
        text-align: center;
        padding: 20px;
        color: #666;
    }

    .error-message {
        color: #dc3545;
    }

    @media (max-width: 768px) {
        .registrations-table {
            font-size: 0.9em;
        }
        
        .registrations-table th,
        .registrations-table td {
            padding: 8px;
        }
    }
`;
document.head.appendChild(tableStyles);

// Function to update registration count
async function updateRegistrationCount() {
    try {
        const registrationsRef = collection(db, 'registrations');
        const querySnapshot = await getDocs(registrationsRef);
        const count = querySnapshot.size;
        
        const counterElement = document.getElementById('totalRegistrations');
        if (counterElement) {
            counterElement.textContent = count.toLocaleString();
            counterElement.classList.add('updated');
            setTimeout(() => counterElement.classList.remove('updated'), 500);
        }

        // Log analytics event
        logEvent(analytics, 'registration_count_view', {
            total_registrations: count
        });
    } catch (error) {
        console.error('Error fetching registration count:', error);
        const counterElement = document.getElementById('totalRegistrations');
        if (counterElement) {
            counterElement.textContent = 'Error loading count';
        }
    }
}

// DOM Elements
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
const registrationForm = document.getElementById('registrationForm');
const successModal = document.getElementById('successModal');
const closeModal = document.querySelector('.close-modal');
const musicToggle = document.getElementById('musicToggle');
const garbaMusic = document.getElementById('garbaMusic');
const gallerySlider = document.querySelector('.gallery-slider');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

// Mobile Menu Toggle - Only add if elements exist
if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });
}

// Form submission handler
if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submission started');

        if (!registrationForm.checkValidity()) {
            console.log('Form validation failed');
            registrationForm.reportValidity();
            return;
        }

        const paymentMethod = document.querySelector('#registrationForm input[name="paymentMethod"]:checked')?.value;
        const paymentConfirmed = document.getElementById('regPaymentConfirmed')?.checked;
        const offlinePaymentConfirmed = document.getElementById('regOfflinePaymentConfirmed')?.checked;
        const paymentTaker = document.getElementById('paymentTaker')?.value;

        if (!paymentMethod) {
            showToast('Please select a payment method');
            return;
        }

        if (paymentMethod === 'gpay' && !paymentConfirmed) {
            showToast('Please confirm that you have made the payment');
            return;
        }

        if (paymentMethod === 'offline') {
            if (!paymentTaker) {
                showToast('Please select a payment taker');
                return;
            }
            if (!offlinePaymentConfirmed) {
                showToast('Please confirm that you will make the payment at the venue');
                return;
            }
        }

        const submitBtn = registrationForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            // Get form data
            const formData = new FormData(registrationForm);
            console.log('Form data collected');

            // Prepare registration data
            const registrationData = {
                // Basic Registration Info
                name: formData.get('fullName'),
                nameLower: formData.get('fullName').trim().toLowerCase(), // For case-insensitive search
                age: parseInt(formData.get('age')),
                gender: formData.get('gender'),
                email: formData.get('email'),
                mobile: formData.get('mobile'),
                address: formData.get('address'),
                batch: formData.get('batch'),
                timestamp: serverTimestamp(),
                status: 'pending',
                createdAt: new Date(),

                // Payment Information
                paymentMethod: paymentMethod,
                paymentStatus: paymentMethod === 'gpay' ? 'completed' : 'pending',
                paymentDate: paymentMethod === 'gpay' ? serverTimestamp() : null,
                paymentTaker: paymentMethod === 'offline' ? paymentTaker : null,
                paymentDetails: {
                    type: paymentMethod === 'gpay' ? 'online' : 'offline',
                    confirmed: paymentMethod === 'gpay' ? paymentConfirmed : offlinePaymentConfirmed,
                    confirmedAt: (paymentMethod === 'gpay' ? paymentConfirmed : offlinePaymentConfirmed) ? serverTimestamp() : null,
                    upiId: paymentMethod === 'gpay' ? document.getElementById('regUpiId').textContent : null,
                    location: paymentMethod === 'offline' ? 'Navratri Garba Ground' : null,
                    timing: paymentMethod === 'offline' ? '9:00 AM - 11:00 AM' : null
                },
                lastUpdated: serverTimestamp()
            };

            // Store in Firestore
            console.log('Attempting to store in Firestore...');
            const registrationsRef = collection(db, 'registrations');
            const docRef = await addDoc(registrationsRef, registrationData);
            console.log('Document written with ID:', docRef.id);

            // Update the document with its registration ID
            await updateDoc(docRef, {
                'registrationId': docRef.id,
                'payment.details.registrationId': docRef.id
            });

            // Show success message with registration ID
            const successModal = document.getElementById('successModal');
            if (successModal) {
                console.log('Showing success modal');
                const modalContent = successModal.querySelector('.modal-content p');
                modalContent.innerHTML = `
                    Registration Successful!<br>
                    Your Registration ID is: <strong>${docRef.id}</strong><br>
                    ${paymentMethod === 'gpay' 
                        ? 'Payment completed successfully!' 
                        : `Please complete your payment at the venue with ${paymentTaker}.`}<br>
                    Payment Details:<br>
                    - Method: ${paymentMethod === 'gpay' ? 'Google Pay' : 'Offline Payment'}<br>
                    - Status: ${paymentMethod === 'gpay' ? 'Completed' : 'Pending'}<br>
                    ${paymentMethod === 'offline' ? `- Payment Taker: ${paymentTaker}<br>` : ''}
                    See you on the Garba ground!
                `;
                successModal.style.display = 'block';
                setTimeout(() => {
                    successModal.style.display = 'none';
                }, 8000);
            }

            // Reset form
            registrationForm.reset();
            document.getElementById('regGpayDetails').style.display = 'none';
            document.getElementById('regOfflineDetails').style.display = 'none';
            
            // Log analytics event with detailed payment info
            logEvent(analytics, 'registration_complete', {
                batch: registrationData.batch,
                payment_method: paymentMethod,
                payment_status: registrationData.paymentStatus,
                payment_taker: paymentTaker,
                registration_id: docRef.id
            });

            // After successful registration
            await updateRegistrationCount();
        } catch (error) {
            console.error('Error details:', error);
            showErrorMessage('Failed to submit registration. Please try again.');
            logEvent(analytics, 'registration_error', {
                error_message: error.message
            });
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}

function validateForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const age = document.getElementById('age').value;
    const mobile = document.getElementById('mobile').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const batch = document.getElementById('batch').value;
    const terms = document.getElementById('terms').checked;
    
    // Reset previous error messages
    clearErrors();
    
    let isValid = true;
    
    // Validate Full Name
    if (fullName.length < 3) {
        showError('fullName', 'Name must be at least 3 characters long');
        isValid = false;
    }
    
    // Validate Age
    if (age < 5 || age > 100) {
        showError('age', 'Age must be between 5 and 100');
        isValid = false;
    }
    
    // Validate Mobile
    if (!/^[0-9]{10}$/.test(mobile)) {
        showError('mobile', 'Please enter a valid 10-digit mobile number');
        isValid = false;
    }
    
    // Validate Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate Address
    if (address.length < 10) {
        showError('address', 'Please enter a complete address');
        isValid = false;
    }
    
    // Validate Batch
    if (!batch) {
        showError('batch', 'Please select a batch timing');
        isValid = false;
    }
    
    // Validate Terms
    if (!terms) {
        showError('terms', 'Please accept the terms and conditions');
        isValid = false;
    }
    
    return isValid;
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ff4444';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '5px';
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#ff4444';
}

function clearErrors() {
    // Remove all error messages
    document.querySelectorAll('.error-message').forEach(error => error.remove());
    
    // Reset border colors
    document.querySelectorAll('.form-group input, .form-group textarea, .form-group select').forEach(field => {
        field.style.borderColor = '#ddd';
    });
}

// Modal Functions
function showModal() {
    successModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    successModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

closeModal.addEventListener('click', hideModal);
window.addEventListener('click', (e) => {
    if (e.target === successModal) {
        hideModal();
    }
});

// Gallery Slider - Only add if elements exist
if (gallerySlider && prevBtn && nextBtn) {
    let currentSlide = 0;
    const slides = gallerySlider.querySelectorAll('.slide');
    const slideCount = slides.length;
    
    if (slides.length > 0) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            updateSlider();
        });

        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            updateSlider();
        });

        // Auto slide every 5 seconds
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slideCount;
            updateSlider();
        }, 5000);
    }
}

// Music Player - Only add if elements exist
if (musicToggle && garbaMusic) {
    musicToggle.addEventListener('click', () => {
        if (garbaMusic.paused) {
            garbaMusic.play();
            musicToggle.classList.add('playing');
        } else {
            garbaMusic.pause();
            musicToggle.classList.remove('playing');
        }
    });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            navLinks.classList.remove('active');
        }
    });
});

// Add scroll event listener for navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(0, 0, 0, 0.9)';
    } else {
        navbar.style.background = 'rgba(0, 0, 0, 0.8)';
    }
});

// Optimize animations with Intersection Observer
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve after animation
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Track page view
    logEvent(analytics, 'page_view', {
        page_title: document.title,
        page_location: window.location.href
    });

    // Observe elements that need animation
    const animatedElements = document.querySelectorAll('.registration-form, .gallery-section, .footer-section');
    animatedElements.forEach(element => observer.observe(element));

    // Optimize background image loading
    const hero = document.querySelector('.hero');
    if (hero) {
        const img = new Image();
        img.src = 'https://dfordelhi.in/wp-content/uploads/2017/09/beautiful-navatri-garba-dandiya-raas-ima-635804845635717125-17555.jpg';
        img.onload = () => {
            hero.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url('${img.src}')`;
        };
    }

    // Initialize mobile menu
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }

    // Initialize audio player
    const musicBtn = document.getElementById('musicToggle');
    const audio = document.getElementById('garbaMusic');

    if (musicBtn && audio) {
        musicBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play().catch(() => {
                    console.log('Audio playback prevented');
                });
                musicBtn.classList.add('playing');
                // Log analytics
                logEvent(analytics, 'music_toggle', { action: 'play' });
            } else {
                audio.pause();
                musicBtn.classList.remove('playing');
                // Log analytics
                logEvent(analytics, 'music_toggle', { action: 'pause' });
            }
        });
    }

    // Track gallery interactions
    const gallerySection = document.querySelector('.gallery-section');
    if (gallerySection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    logEvent(analytics, 'gallery_view');
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(gallerySection);
    }

    // Updated search registration function with preview
    window.searchRegistration = async function() {
        const searchInput = document.getElementById('searchRegistration').value.trim();
        const searchPreview = document.getElementById('searchPreview');
        const paymentMethods = document.querySelector('.payment-methods');

        // Hide preview and payment methods if search is empty
        if (!searchInput) {
            searchPreview.style.display = 'none';
            paymentMethods.style.display = 'none';
            return;
        }

        try {
            // Query Firestore
            const registrationsRef = collection(db, 'registrations');
            const q = query(registrationsRef, 
                where('name', '>=', searchInput.toLowerCase()),
                where('name', '<=', searchInput.toLowerCase() + '\uf8ff')
            );
            
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                // Try searching by phone number
                const phoneQuery = query(registrationsRef, where('mobile', '==', searchInput));
                const phoneSnapshot = await getDocs(phoneQuery);
                
                if (phoneSnapshot.empty) {
                    searchPreview.style.display = 'none';
                    return;
                }
                
                // Show phone number results
                displaySearchPreview(phoneSnapshot.docs);
            } else {
                // Show name results
                displaySearchPreview(querySnapshot.docs);
            }

        } catch (error) {
            console.error('Search error:', error);
            showToast('Error searching registration');
        }
    };

    function displaySearchPreview(docs) {
        const searchPreview = document.getElementById('searchPreview');
        
        let previewHTML = '<div class="preview-list">';
        docs.forEach(doc => {
            const data = doc.data();
            previewHTML += `
                <div class="preview-item" onclick="selectRegistration('${doc.id}', '${data.name}', '${data.mobile}', '${data.paymentStatus}')">
                    <span class="name">${data.name}</span>
                    <span class="phone">${data.mobile}</span>
                    <span class="status status-${data.paymentStatus}">${data.paymentStatus}</span>
                </div>
            `;
        });
        previewHTML += '</div>';
        
        searchPreview.innerHTML = previewHTML;
        searchPreview.style.display = 'block';
    }

    // Function to handle registration selection
    window.selectRegistration = function(registrationId, name, phone, paymentStatus) {
        const selectedRegistration = document.getElementById('selectedRegistration');
        const paymentMethods = document.querySelector('.payment-methods');
        const searchPreview = document.getElementById('searchPreview');
        const searchInput = document.getElementById('searchRegistration');

        // Hide preview
        searchPreview.style.display = 'none';
        
        // Show selected registration
        selectedRegistration.innerHTML = `
            <div class="registration-card">
                <h4>Selected Registration</h4>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Status:</strong> <span class="status-${paymentStatus}">${paymentStatus}</span></p>
            </div>
        `;
        selectedRegistration.style.display = 'block';

        // Show payment methods if payment is pending
        if (paymentStatus === 'pending') {
            paymentMethods.style.display = 'block';
        } else {
            paymentMethods.style.display = 'none';
            showToast('Payment already completed for this registration');
        }

        // Store registration ID for payment processing
        selectedRegistration.dataset.registrationId = registrationId;
    };

    // Add form submission handler
    const searchRegistrationForm = document.getElementById('searchRegistrationForm');
    if (searchRegistrationForm) {
        searchRegistrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('searchFullName').value.trim();
            const phone = document.getElementById('searchPhone').value.trim();
            const searchResultsContent = document.getElementById('searchResultsContent');

            if (!fullName || !phone) {
                showToast('Please fill in all required fields');
                return;
            }

            try {
                searchResultsContent.innerHTML = '<div class="loading">Searching...</div>';

                const registrationsRef = collection(db, 'registrations');
                const q = query(registrationsRef, 
                    where('name', '==', fullName),
                    where('mobile', '==', phone)
                );
                
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    searchResultsContent.innerHTML = `
                        <div class="message error">
                            <p>No registration found with these details.</p>
                            <p>Please check your name and phone number and try again.</p>
                        </div>
                    `;
                } else {
                    const doc = querySnapshot.docs[0];
                    const data = doc.data();
                    searchResultsContent.innerHTML = `
                        <div class="registration-card">
                            <h4>Registration Found</h4>
                            <p><strong>Registration ID:</strong> ${doc.id}</p>
                            <p><strong>Name:</strong> ${data.name}</p>
                            <p><strong>Phone:</strong> ${data.mobile}</p>
                            <p><strong>Batch:</strong> ${data.batch}</p>
                            <p><strong>Status:</strong> <span class="status-${data.paymentStatus}">${data.paymentStatus}</span></p>
                        </div>
                    `;
                }

            } catch (error) {
                console.error('Search error:', error);
                searchResultsContent.innerHTML = '<p class="error">Error searching registration. Please try again.</p>';
            }
        });
    }

    // Remove payment method selection handling
    // Keep only the payment form handling code
    const paymentForm = document.getElementById('paymentForm');
    const registrationDetails = document.getElementById('registrationDetails');
    const gpayDetails = document.getElementById('gpayDetails');
    const offlineDetails = document.getElementById('offlineDetails');
    const submitBtn = paymentForm?.querySelector('.submit-btn');

    // Search by Registration ID
    window.searchByRegistrationId = async function() {
        const registrationId = document.getElementById('registrationId').value.trim();
        if (!registrationId) {
            showToast('Please enter a registration ID');
            return;
        }

        try {
            // Show loading state
            registrationDetails.innerHTML = '<div class="loading">Searching...</div>';
            registrationDetails.style.display = 'block';

            // Query Firestore
            const registrationsRef = collection(db, 'registrations');
            const docRef = doc(registrationsRef, registrationId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                registrationDetails.innerHTML = '<p class="error">Registration not found. Please check the ID and try again.</p>';
                submitBtn.disabled = true;
                return;
            }

            const data = docSnap.data();
            
            // Check if payment is already completed
            if (data.paymentStatus === 'completed') {
                registrationDetails.innerHTML = `
                    <div class="registration-card">
                        <h4>Registration Details</h4>
                        <p><strong>Name:</strong> ${data.name}</p>
                        <p><strong>Status:</strong> <span class="status-completed">Payment Completed</span></p>
                        <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
                        <p><strong>Payment Date:</strong> ${data.paymentDate?.toDate().toLocaleDateString() || 'N/A'}</p>
                    </div>
                `;
                submitBtn.disabled = true;
                return;
            }

            // Show registration details
            registrationDetails.innerHTML = `
                <div class="registration-card">
                    <h4>Registration Details</h4>
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Age:</strong> ${data.age}</p>
                    <p><strong>Gender:</strong> ${data.gender}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Mobile:</strong> ${data.mobile}</p>
                    <p><strong>Batch:</strong> ${data.batch}</p>
                    <p><strong>Status:</strong> <span class="status-pending">Payment Pending</span></p>
                </div>
            `;
            submitBtn.disabled = false;

        } catch (error) {
            console.error('Search error:', error);
            registrationDetails.innerHTML = '<p class="error">Error searching registration. Please try again.</p>';
            submitBtn.disabled = true;
        }
    };

    // Payment method selection handling
    const regPaymentMethodInputs = document.querySelectorAll('#registrationForm input[name="paymentMethod"]');
    const regGpayDetails = document.getElementById('regGpayDetails');
    const regOfflineDetails = document.getElementById('regOfflineDetails');
    const paymentTakerSelect = document.getElementById('paymentTaker');

    if (regPaymentMethodInputs) {
        regPaymentMethodInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.value === 'gpay') {
                    regGpayDetails.style.display = 'block';
                    regOfflineDetails.style.display = 'none';
                    document.getElementById('regPaymentConfirmed').required = true;
                    document.getElementById('regOfflinePaymentConfirmed').required = false;
                    if (paymentTakerSelect) paymentTakerSelect.required = false;
                } else {
                    regGpayDetails.style.display = 'none';
                    regOfflineDetails.style.display = 'block';
                    document.getElementById('regPaymentConfirmed').required = false;
                    document.getElementById('regOfflinePaymentConfirmed').required = true;
                    if (paymentTakerSelect) paymentTakerSelect.required = true;
                }
            });
        });
    }

    // Add copy UPI ID function for registration form
    window.copyRegUPI = function() {
        const upiId = document.getElementById('regUpiId').textContent;
        navigator.clipboard.writeText(upiId).then(() => {
            showToast('UPI ID copied to clipboard!');
        }).catch(() => {
            showToast('Failed to copy UPI ID');
        });
    };

    // Update registration count
    updateRegistrationCount();
    
    // Update count every 5 minutes
    setInterval(updateRegistrationCount, 5 * 60 * 1000);
});

// Optimize modal
function showSuccessModal() {
    console.log('showSuccessModal called');
    const successModal = document.getElementById('successModal');
    if (successModal) {
        console.log('Success modal found, displaying...');
        successModal.style.display = 'block';
        // Close modal after 5 seconds
        setTimeout(() => {
            console.log('Closing success modal...');
            successModal.style.display = 'none';
        }, 5000);
    } else {
        console.error('Success modal element not found in showSuccessModal');
    }
}

// Optimize scroll performance
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            scrollTimeout = null;
            // Add any scroll-based animations here
        }, 100);
    }
}, { passive: true });

// Update showErrorMessage function
function showErrorMessage(message) {
    console.log('Showing error message:', message);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #ff4444;
        color: white;
        padding: 15px 30px;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(errorDiv);
    console.log('Error message displayed');
    setTimeout(() => {
        errorDiv.remove();
        console.log('Error message removed');
    }, 5000);
}

// Add toast notification function if not already present
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search by name function
window.searchByName = debounce(async function() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const queryValue = searchInput.value.trim().toLowerCase();

    // Clear results if search is empty
    if (!queryValue || queryValue.length < 2) {
        searchResults.innerHTML = '';
        searchResults.classList.remove('active');
        return;
    }

    try {
        // Show loading state
        searchResults.innerHTML = '<div class="search-result-item">Searching...</div>';
        searchResults.classList.add('active');

        // Query Firestore by nameLower for case-insensitive search
        const registrationsRef = collection(db, 'registrations');
        const q = query(registrationsRef, 
            where('nameLower', '>=', queryValue),
            where('nameLower', '<=', queryValue + '\uf8ff'),
            limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        } else {
            // Build table header
            let tableHTML = `<table class="search-results-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Gender</th>
                        <th>Age</th>
                        <th>Address</th>
                        <th>Batch</th>
                        <th>Payment Method</th>
                    </tr>
                </thead>
                <tbody>`;
            querySnapshot.docs.forEach(doc => {
                const data = doc.data();
                tableHTML += `
                    <tr>
                        <td>${data.name || ''}</td>
                        <td>${data.mobile || ''}</td>
                        <td>${data.email || ''}</td>
                        <td>${data.gender || ''}</td>
                        <td>${data.age || ''}</td>
                        <td>${data.address || ''}</td>
                        <td>${data.batch || ''}</td>
                        <td>${data.paymentMethod === 'gpay' ? 'Google Pay' : 'Offline Payment'}</td>
                    </tr>
                `;
            });
            tableHTML += '</tbody></table>';
            searchResults.innerHTML = tableHTML;
        }
    } catch (error) {
        console.error('Search error:', error.message, error);
        showToast('Error searching registration: ' + error.message);
    }
}, 300);

// Function to show detailed registration information
window.showRegistrationDetails = async function(registrationId) {
    try {
        const docRef = doc(db, 'registrations', registrationId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            const modal = document.getElementById('searchResultsModal');
            const modalContent = modal.querySelector('.modal-content');
            
            modalContent.innerHTML = `
                <span class="close-modal">&times;</span>
                <h3>Registration Details</h3>
                <div class="registration-details">
                    <p><strong>Registration ID:</strong> ${registrationId}</p>
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Phone:</strong> ${data.mobile}</p>
                    <p><strong>Email:</strong> ${data.email || ''}</p>
                    <p><strong>Gender:</strong> ${data.gender || ''}</p>
                    <p><strong>Age:</strong> ${data.age || ''}</p>
                    <p><strong>Address:</strong> ${data.address || ''}</p>
                    <p><strong>Batch:</strong> ${data.batch || ''}</p>
                    <p><strong>Registration Date:</strong> ${data.createdAt ? new Date(data.createdAt).toLocaleDateString() : ''}</p>
                    <p><strong>Payment Status:</strong> <span class="status ${data.paymentStatus}">${data.paymentStatus}</span></p>
                    <p><strong>Payment Method:</strong> ${data.paymentMethod === 'gpay' ? 'Google Pay' : 'Offline Payment'}</p>
                    ${data.paymentMethod === 'offline' ? `<p><strong>Payment Taker:</strong> ${data.paymentTaker || ''}</p>` : ''}
                    ${data.paymentMethod === 'gpay' ? `<p><strong>UPI ID:</strong> ${data.paymentDetails?.upiId || ''}</p>` : ''}
                </div>
            `;
            
            modal.style.display = 'block';
            
            // Add close button functionality
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
            
            // Close modal when clicking outside
            window.onclick = (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };
        } else {
            showToast('Registration not found');
        }
    } catch (error) {
        console.error('Error fetching registration details:', error);
        showToast('Error fetching registration details');
    }
};

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    const searchBox = document.querySelector('.search-box');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchBox.contains(e.target)) {
        searchResults.classList.remove('active');
    }
}); 
