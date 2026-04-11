const API_BASE = 'http://localhost:5000/api';
const ADMIN_KEY = 'MathQueryAdmin2025!';
let currentTab = 'enrollments';

// Auth
document.getElementById('authBtn').addEventListener('click', () => {
    const key = document.getElementById('adminKeyInput').value;
    if (key === ADMIN_KEY) {
        document.getElementById('adminContent').style.display = 'block';
        document.getElementById('loginMessage').classList.add('hidden');
        loadEnrollments();
        loadVideos();
        loadMaterials();
        loadLiveSessions();
    } else {
        document.getElementById('loginMessage').classList.remove('hidden');
    }
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab + 'Panel').classList.add('active');
        currentTab = btn.dataset.tab;
    });
});

// ---------- ENROLLMENTS ----------
async function loadEnrollments() {
    const res = await fetch(`${API_BASE}/admin/enrollments`, { headers: { 'x-admin-key': ADMIN_KEY } });
    const data = await res.json();
    document.getElementById('totalCount').textContent = data.count;
    const tbody = document.getElementById('enrollmentsTable');
    tbody.innerHTML = data.data.map(e => `
        <tr><td>${new Date(e.enrollmentDate).toLocaleDateString()}</td><td>${e.fullName}</td><td>${e.phone}<br>${e.email}</td><td>${e.upiId}</td>
        <td><span class="px-2 py-1 rounded text-xs font-semibold status-${e.status}">${e.status}</span></td>
        <td><button onclick="updateStatus('${e._id}','confirmed')" class="bg-green-500 text-white px-2 py-1 rounded text-xs">Confirm</button>
        <button onclick="updateStatus('${e._id}','rejected')" class="bg-red-500 text-white px-2 py-1 rounded text-xs ml-1">Reject</button></td></tr>
    `).join('');
}
window.updateStatus = async (id, status) => {
    await fetch(`${API_BASE}/admin/enrollment/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify({ status })
    });
    loadEnrollments();
};

// ---------- VIDEOS ----------
async function loadVideos() {
    const res = await fetch(`${API_BASE}/admin/videos`, { headers: { 'x-admin-key': ADMIN_KEY } });
    const videos = (await res.json()).data;
    const list = document.getElementById('videoList');
    list.innerHTML = videos.map(v => `
        <div class="bg-white p-4 rounded shadow flex justify-between items-center">
            <div><span class="font-medium">${v.title}</span> <span class="text-sm text-gray-500">${v.url}</span></div>
            <div>
                <button onclick="editVideo('${v._id}')" class="text-indigo-600"><i class="fas fa-edit"></i></button>
                <button onclick="deleteVideo('${v._id}')" class="text-red-600 ml-2"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}
window.deleteVideo = async (id) => {
    if (!confirm('Delete?')) return;
    await fetch(`${API_BASE}/admin/videos/${id}`, { method: 'DELETE', headers: { 'x-admin-key': ADMIN_KEY } });
    loadVideos();
};
window.editVideo = async (id) => {
    const res = await fetch(`${API_BASE}/admin/videos`);
    const videos = (await res.json()).data;
    const video = videos.find(v => v._id === id);
    if (!video) return;
    document.getElementById('videoId').value = video._id;
    document.getElementById('videoTitle').value = video.title;
    document.getElementById('videoUrl').value = video.url;
    document.getElementById('videoDesc').value = video.description || '';
    document.getElementById('videoOrder').value = video.order;
    document.getElementById('videoPublished').checked = video.isPublished;
    document.getElementById('videoModal').classList.remove('hidden');
};

document.getElementById('addVideoBtn').addEventListener('click', () => {
    document.getElementById('videoId').value = '';
    document.getElementById('videoForm').reset();
    document.getElementById('videoModal').classList.remove('hidden');
});
document.getElementById('videoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('videoId').value;
    const data = {
        title: document.getElementById('videoTitle').value,
        url: document.getElementById('videoUrl').value,
        description: document.getElementById('videoDesc').value,
        order: document.getElementById('videoOrder').value,
        isPublished: document.getElementById('videoPublished').checked
    };
    const url = id ? `${API_BASE}/admin/videos/${id}` : `${API_BASE}/admin/videos`;
    const method = id ? 'PUT' : 'POST';
    await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify(data)
    });
    document.getElementById('videoModal').classList.add('hidden');
    loadVideos();
});
document.querySelectorAll('.cancel-modal').forEach(btn => btn.addEventListener('click', () => {
    document.getElementById('videoModal').classList.add('hidden');
}));

// ---------- MATERIALS ----------
async function loadMaterials() {
    const res = await fetch(`${API_BASE}/admin/materials`, { headers: { 'x-admin-key': ADMIN_KEY } });
    const materials = (await res.json()).data;
    const list = document.getElementById('materialList');
    list.innerHTML = materials.map(m => `
        <div class="bg-white p-4 rounded shadow flex justify-between items-center">
            <div><span class="font-medium">${m.title}</span> <span class="text-sm text-gray-500">${m.fileType}</span></div>
            <div>
                <button onclick="editMaterial('${m._id}')" class="text-indigo-600"><i class="fas fa-edit"></i></button>
                <button onclick="deleteMaterial('${m._id}')" class="text-red-600 ml-2"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}
window.deleteMaterial = async (id) => {
    if (!confirm('Delete?')) return;
    await fetch(`${API_BASE}/admin/materials/${id}`, { method: 'DELETE', headers: { 'x-admin-key': ADMIN_KEY } });
    loadMaterials();
};
window.editMaterial = async (id) => {
    const res = await fetch(`${API_BASE}/admin/materials`);
    const materials = (await res.json()).data;
    const mat = materials.find(m => m._id === id);
    if (!mat) return;
    document.getElementById('materialId').value = mat._id;
    document.getElementById('materialTitle').value = mat.title;
    document.getElementById('materialDesc').value = mat.description || '';
    document.getElementById('materialOrder').value = mat.order;
    document.getElementById('materialPublished').checked = mat.isPublished;
    document.getElementById('materialModal').classList.remove('hidden');
};

document.getElementById('addMaterialBtn').addEventListener('click', () => {
    document.getElementById('materialId').value = '';
    document.getElementById('materialForm').reset();
    document.getElementById('materialModal').classList.remove('hidden');
});
document.getElementById('materialForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('materialId').value;
    const formData = new FormData();
    formData.append('title', document.getElementById('materialTitle').value);
    formData.append('description', document.getElementById('materialDesc').value);
    formData.append('order', document.getElementById('materialOrder').value);
    formData.append('isPublished', document.getElementById('materialPublished').checked);
    const fileInput = document.getElementById('materialFile');
    if (fileInput.files[0]) formData.append('file', fileInput.files[0]);
    
    const url = id ? `${API_BASE}/admin/materials/${id}` : `${API_BASE}/admin/materials`;
    const method = id ? 'PUT' : 'POST';
    await fetch(url, {
        method,
        headers: { 'x-admin-key': ADMIN_KEY },
        body: formData
    });
    document.getElementById('materialModal').classList.add('hidden');
    loadMaterials();
});
document.querySelectorAll('.cancel-material-modal').forEach(btn => btn.addEventListener('click', () => {
    document.getElementById('materialModal').classList.add('hidden');
}));

// ---------- LIVE SESSIONS ----------
async function loadLiveSessions() {
    const res = await fetch(`${API_BASE}/admin/live-sessions`, { headers: { 'x-admin-key': ADMIN_KEY } });
    const sessions = (await res.json()).data;
    const list = document.getElementById('liveList');
    list.innerHTML = sessions.map(s => `
        <div class="bg-white p-4 rounded shadow flex justify-between items-center">
            <div><span class="font-medium">${s.title}</span> <span class="text-sm text-gray-500">${new Date(s.scheduledAt).toLocaleString()}</span></div>
            <div>
                <button onclick="editLive('${s._id}')" class="text-indigo-600"><i class="fas fa-edit"></i></button>
                <button onclick="deleteLive('${s._id}')" class="text-red-600 ml-2"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}
window.deleteLive = async (id) => {
    if (!confirm('Delete?')) return;
    await fetch(`${API_BASE}/admin/live-sessions/${id}`, { method: 'DELETE', headers: { 'x-admin-key': ADMIN_KEY } });
    loadLiveSessions();
};
window.editLive = async (id) => {
    const res = await fetch(`${API_BASE}/admin/live-sessions`);
    const sessions = (await res.json()).data;
    const sess = sessions.find(s => s._id === id);
    if (!sess) return;
    document.getElementById('liveId').value = sess._id;
    document.getElementById('liveTitle').value = sess.title;
    document.getElementById('liveDesc').value = sess.description || '';
    document.getElementById('liveScheduledAt').value = new Date(sess.scheduledAt).toISOString().slice(0,16);
    document.getElementById('liveDuration').value = sess.duration;
    document.getElementById('liveMeetingLink').value = sess.meetingLink;
    document.getElementById('liveActive').checked = sess.isActive;
    document.getElementById('liveModal').classList.remove('hidden');
};

document.getElementById('addLiveBtn').addEventListener('click', () => {
    document.getElementById('liveId').value = '';
    document.getElementById('liveForm').reset();
    document.getElementById('liveModal').classList.remove('hidden');
});
document.getElementById('liveForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('liveId').value;
    const data = {
        title: document.getElementById('liveTitle').value,
        description: document.getElementById('liveDesc').value,
        scheduledAt: document.getElementById('liveScheduledAt').value,
        duration: document.getElementById('liveDuration').value,
        meetingLink: document.getElementById('liveMeetingLink').value,
        isActive: document.getElementById('liveActive').checked
    };
    const url = id ? `${API_BASE}/admin/live-sessions/${id}` : `${API_BASE}/admin/live-sessions`;
    const method = id ? 'PUT' : 'POST';
    await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify(data)
    });
    document.getElementById('liveModal').classList.add('hidden');
    loadLiveSessions();
});
document.querySelectorAll('.cancel-live-modal').forEach(btn => btn.addEventListener('click', () => {
    document.getElementById('liveModal').classList.add('hidden');
}));