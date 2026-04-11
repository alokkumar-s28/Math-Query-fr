// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

let tempStudent = { name: '', email: '', phone: '', board: '' };
let selectedFile = null;

function showToast(msg, isError = false) {
    let toast = document.createElement('div');
    toast.className = 'toast-notify';
    toast.style.backgroundColor = isError ? '#b91c1c' : '#065f46';
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

const formModal = document.getElementById('enrollmentModal');
const paymentModal = document.getElementById('paymentModal');
const closeFormBtn = document.getElementById('closeFormModalBtn');
const closePaymentBtn = document.getElementById('closePaymentModalBtn');

function openFormModal() { 
    formModal.classList.remove('hidden'); 
    document.body.style.overflow = 'hidden'; 
}
function closeFormModal() { 
    formModal.classList.add('hidden'); 
    document.body.style.overflow = ''; 
}
function openPaymentModal() { 
    paymentModal.classList.remove('hidden'); 
    document.body.style.overflow = 'hidden'; 
    resetPaymentFields(); 
}
function closePaymentModal() { 
    paymentModal.classList.add('hidden'); 
    document.body.style.overflow = ''; 
}
function resetPaymentFields() {
    document.getElementById('payerUpiId').value = '';
    if(fileInput) fileInput.value = '';
    document.getElementById('fileNameDisplay').innerText = 'No file';
    document.getElementById('upiIdError').classList.add('hidden');
    document.getElementById('screenshotError').classList.add('hidden');
    selectedFile = null;
}

closeFormBtn?.addEventListener('click', closeFormModal);
closePaymentBtn?.addEventListener('click', closePaymentModal);
formModal?.addEventListener('click', (e) => { if (e.target === formModal) closeFormModal(); });
paymentModal?.addEventListener('click', (e) => { if (e.target === paymentModal) closePaymentModal(); });

const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phoneError');

function isValidIndianMobile(num) { 
    return /^[6-9]\d{9}$/.test(num); 
}

phoneInput?.addEventListener('input', function() {
    let val = this.value.replace(/\D/g, '');
    if (val.length > 10) val = val.slice(0,10);
    this.value = val;
    if (val.length === 10) {
        if (isValidIndianMobile(val)) phoneError.classList.add('hidden');
        else { 
            phoneError.classList.remove('hidden'); 
            phoneError.innerText = 'Enter valid 10-digit Indian mobile (starts with 6,7,8,9)'; 
        }
    } else if (val.length > 0 && val.length < 10) {
        phoneError.classList.remove('hidden');
        phoneError.innerText = 'Mobile number must be exactly 10 digits';
    } else phoneError.classList.add('hidden');
});

const fileInput = document.getElementById('paymentScreenshot');
const fileNameDisplay = document.getElementById('fileNameDisplay');

fileInput?.addEventListener('change', function(e) {
    if(e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if(file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg') {
            selectedFile = file;
            fileNameDisplay.innerText = file.name.length > 20 ? file.name.substring(0,17)+'...' : file.name;
            document.getElementById('screenshotError').classList.add('hidden');
        } else {
            selectedFile = null;
            fileNameDisplay.innerText = 'Invalid file';
            document.getElementById('screenshotError').classList.remove('hidden');
            document.getElementById('screenshotError').innerText = 'Only JPG/PNG images allowed';
            fileInput.value = '';
        }
    } else {
        selectedFile = null;
        fileNameDisplay.innerText = 'No file';
    }
});

const enrollForm = document.getElementById('enrollForm');
enrollForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const board = document.getElementById('board').value;
    
    if (!name || !email || !phone) { 
        showToast('Please fill all required fields.', true); 
        return; 
    }
    
    if (!isValidIndianMobile(phone)) {
        phoneError.classList.remove('hidden');
        phoneError.innerText = 'Please enter a valid 10-digit Indian mobile number';
        document.getElementById('phone').focus();
        return;
    }
    
    tempStudent = { name, email, phone, board };
    closeFormModal();
    openPaymentModal();
});

const submitProofBtn = document.getElementById('submitPaymentProofBtn');
submitProofBtn?.addEventListener('click', async () => {
    const upiId = document.getElementById('payerUpiId').value.trim();
    let valid = true;
    
    if (!upiId) { 
        document.getElementById('upiIdError').classList.remove('hidden'); 
        valid = false; 
    } else { 
        document.getElementById('upiIdError').classList.add('hidden'); 
    }
    
    if (!selectedFile) { 
        const errDiv = document.getElementById('screenshotError');
        errDiv.classList.remove('hidden');
        errDiv.innerText = 'Please upload payment screenshot';
        valid = false; 
    } else { 
        document.getElementById('screenshotError').classList.add('hidden'); 
    }
    
    if (!valid) return;
    
    const formData = new FormData();
    formData.append('fullName', tempStudent.name);
    formData.append('email', tempStudent.email);
    formData.append('phone', tempStudent.phone);
    formData.append('board', tempStudent.board);
    formData.append('upiId', upiId);
    formData.append('paymentScreenshot', selectedFile);
    
    const originalText = submitProofBtn.innerHTML;
    submitProofBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitProofBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/enroll`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showToast(`🎉 Enrollment successful, ${tempStudent.name}! Confirmation sent to ${tempStudent.email}`, false);
            sessionStorage.setItem('studentPhone', tempStudent.phone);
            sessionStorage.setItem('studentName', tempStudent.name);
            document.getElementById('enrollForm').reset();
            if(phoneError) phoneError.classList.add('hidden');
            tempStudent = {};
            selectedFile = null;
            if(fileInput) fileInput.value = '';
            if(fileNameDisplay) fileNameDisplay.innerText = 'No file';
            closePaymentModal();
            document.getElementById('payerUpiId').value = '';
            setTimeout(() => {
                if(confirm('Would you like to view your dashboard now?')) {
                    window.location.href = 'dashboard.html';
                }
            }, 500);
        } else {
            showToast(result.message || 'Enrollment failed. Please try again.', true);
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error. Please check if server is running.', true);
    } finally {
        submitProofBtn.innerHTML = originalText;
        submitProofBtn.disabled = false;
    }
});

document.querySelectorAll('.open-enroll-modal').forEach(btn => {
    btn.addEventListener('click', (e) => { 
        e.preventDefault(); 
        openFormModal(); 
    });
});

const mobileBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileIcon = document.getElementById('mobileMenuIcon');

function closeMobileMenu() { 
    if(mobileMenu) mobileMenu.classList.add('hidden'); 
    if(mobileIcon) { 
        mobileIcon.classList.remove('fa-times'); 
        mobileIcon.classList.add('fa-bars'); 
    } 
}

function toggleMobileMenu() { 
    if (mobileMenu.classList.contains('hidden')) { 
        mobileMenu.classList.remove('hidden'); 
        mobileIcon.classList.remove('fa-bars'); 
        mobileIcon.classList.add('fa-times'); 
    } else { 
        closeMobileMenu(); 
    } 
}

mobileBtn?.addEventListener('click', toggleMobileMenu);
document.querySelectorAll('#mobileMenu a, #mobileMenu button').forEach(link => link.addEventListener('click', closeMobileMenu));

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if(targetId && targetId !== '#') {
            const targetElem = document.querySelector(targetId);
            if (targetElem) { 
                e.preventDefault(); 
                targetElem.scrollIntoView({ behavior: 'smooth' }); 
                closeMobileMenu(); 
            }
        }
    });
});

const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
        else entry.target.classList.remove('visible');
    });
}, { threshold: 0.2 });

revealElements.forEach(el => observer.observe(el));