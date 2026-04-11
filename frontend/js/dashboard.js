const API_BASE_URL = 'http://localhost:5000/api';

async function loadStudentDashboard() {
    const studentPhone = sessionStorage.getItem('studentPhone');
    if (!studentPhone) {
        const urlParams = new URLSearchParams(window.location.search);
        const phoneParam = urlParams.get('phone');
        if (phoneParam) sessionStorage.setItem('studentPhone', phoneParam);
        else {
            window.location.href = 'index.html';
            return;
        }
    }
    const phone = sessionStorage.getItem('studentPhone');
    try {
        const response = await fetch(`${API_BASE_URL}/enrollment/${phone}`);
        const result = await response.json();
        if (result.success && result.data) {
            const data = result.data;
            document.getElementById('welcomeName').textContent = data.fullName;
            document.getElementById('studentNameDisplay').textContent = data.fullName;
            document.getElementById('mobileStudentName').textContent = data.fullName;
            document.getElementById('enrollmentId').textContent = data._id.slice(-8);
            document.getElementById('detailName').textContent = data.fullName;
            document.getElementById('detailEmail').textContent = data.email;
            document.getElementById('detailPhone').textContent = data.phone;
            document.getElementById('detailBoard').textContent = data.board;
            document.getElementById('detailDate').textContent = new Date(data.enrollmentDate).toLocaleDateString('en-IN');
            const statusElem = document.getElementById('detailStatus');
            const statusBadge = document.getElementById('statusBadge');
            if (data.status === 'confirmed') {
                statusElem.innerHTML = '<span class="text-green-600">✓ Confirmed</span>';
                statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> Active';
                statusBadge.className = 'bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold';
            } else if (data.status === 'pending') {
                statusElem.innerHTML = '<span class="text-yellow-600">⏳ Pending Verification</span>';
                statusBadge.innerHTML = '<i class="fas fa-clock"></i> Pending';
                statusBadge.className = 'bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold';
            } else {
                statusElem.innerHTML = '<span class="text-red-600">✗ Rejected</span>';
                statusBadge.innerHTML = '<i class="fas fa-times-circle"></i> Inactive';
                statusBadge.className = 'bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold';
            }
        } else {
            showToast('No enrollment found', true);
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard. Is server running?', true);
    }
}

async function loadContent() {
    try {
        const [videosRes, materialsRes, liveRes] = await Promise.all([
            fetch(`${API_BASE_URL}/videos`),
            fetch(`${API_BASE_URL}/materials`),
            fetch(`${API_BASE_URL}/live-sessions`)
        ]);
        const videos = (await videosRes.json()).data || [];
        const materials = (await materialsRes.json()).data || [];
        const liveSessions = (await liveRes.json()).data || [];

        renderVideos(videos);
        renderMaterials(materials);
        renderLiveSessions(liveSessions);
    } catch (error) {
        console.error('Content load error:', error);
    }
}

function renderVideos(videos) {
    const container = document.getElementById('videosContainer');
    if (!videos.length) {
        container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-4">No videos available yet.</p>';
        return;
    }
    container.innerHTML = videos.map(v => `
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="aspect-video bg-gray-200">
                <iframe class="w-full h-full" src="${v.url}" frameborder="0" allowfullscreen></iframe>
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-gray-800">${v.title}</h3>
                <p class="text-sm text-gray-500 mt-1">${v.description || ''}</p>
            </div>
        </div>
    `).join('');
}

function renderMaterials(materials) {
    const container = document.getElementById('materialsContainer');
    if (!materials.length) {
        container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-4">No materials available yet.</p>';
        return;
    }
    container.innerHTML = materials.map(m => `
        <a href="/${m.fileUrl}" target="_blank" class="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition flex items-center gap-3">
            <i class="fas fa-file-pdf text-red-500 text-2xl"></i>
            <div>
                <h4 class="font-semibold text-gray-800">${m.title}</h4>
                <p class="text-xs text-gray-500">${(m.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
        </a>
    `).join('');
}

function renderLiveSessions(sessions) {
    const container = document.getElementById('liveContainer');
    if (!sessions.length) {
        container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-4">No upcoming live sessions.</p>';
        return;
    }
    container.innerHTML = sessions.map(s => `
        <div class="bg-white rounded-xl shadow-md p-5">
            <h3 class="font-bold text-lg text-gray-800">${s.title}</h3>
            <p class="text-sm text-gray-600 mt-1">${s.description || ''}</p>
            <div class="flex items-center gap-2 mt-3 text-indigo-600">
                <i class="far fa-calendar-alt"></i>
                <span>${new Date(s.scheduledAt).toLocaleString()}</span>
            </div>
            <a href="${s.meetingLink}" target="_blank" class="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">
                <i class="fas fa-video"></i> Join Session
            </a>
        </div>
    `).join('');
}

function logout() {
    sessionStorage.removeItem('studentPhone');
    sessionStorage.removeItem('studentName');
    window.location.href = 'index.html';
}

function showToast(msg, isError) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white text-sm z-50';
    toast.style.backgroundColor = isError ? '#dc2626' : '#059669';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// Mobile menu toggle
const mobileBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileIcon = document.getElementById('mobileMenuIcon');
function closeMobileMenu() {
    if (mobileMenu) mobileMenu.classList.add('hidden');
    if (mobileIcon) { mobileIcon.classList.remove('fa-times'); mobileIcon.classList.add('fa-bars'); }
}
function toggleMobileMenu() {
    if (mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.remove('hidden');
        mobileIcon.classList.remove('fa-bars');
        mobileIcon.classList.add('fa-times');
    } else closeMobileMenu();
}
if (mobileBtn) mobileBtn.addEventListener('click', toggleMobileMenu);
document.querySelectorAll('#mobileMenu a, #mobileMenu button').forEach(link => link.addEventListener('click', closeMobileMenu));

// Initialize
loadStudentDashboard().then(() => loadContent());