const baseUrl = 'http://localhost:3000/api';

function showSection(id) {
    document.querySelectorAll('main > section').forEach(sec => sec.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    
    if(id === 'feedback') loadFeedback();
    if(id === 'transcript') loadTranscript();
}

async function login(e) {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    try {
        const res = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();
        if(res.ok && data.success) {
            document.getElementById('navbar').style.display = 'block';
            document.getElementById('user-display-name').innerText = u;
            showSection('dashboard');
        } else {
            document.getElementById('login-error').innerText = data.message || 'Error occurred. (Check console for raw output)';
        }
    } catch(err) {
        document.getElementById('login-error').innerText = "Network Error!";
    }
}

async function logout() {
    await fetch(`${baseUrl}/logout`, { method: 'POST' });
    document.getElementById('navbar').style.display = 'none';
    showSection('login-section');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-error').innerText = '';
}

async function searchCourse(e) {
    e.preventDefault();
    const q = document.getElementById('searchInput').value;

    const res = await fetch(`${baseUrl}/courses/search?q=${encodeURIComponent(q)}`, {
        headers: { 'Accept': 'text/html' }
    });
    
    const text = await res.text();
    
    document.getElementById('searchResults').innerHTML = text; 
}

async function loadTranscript() {
    // Note: Implicitly calls without ?student_id= to let server read session.
    
    const res = await fetch(`${baseUrl}/transcript`);
    const data = await res.json();
    
    const tbody = document.querySelector('#transcriptTable tbody');
    tbody.innerHTML = '';
    if(Array.isArray(data)) {
        data.forEach(row => {
            tbody.innerHTML += `<tr><td>${row.course_name}</td><td>${row.grade}</td><td>${row.comments}</td></tr>`;
        });
    }
}

async function postFeedback(e) {
    e.preventDefault();
    const c = document.getElementById('fbCourse').value;
    const msg = document.getElementById('fbComment').value;
    
    await fetch(`${baseUrl}/feedback`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ course_name: c, comment: msg })
    });
    
    document.getElementById('fbCourse').value = '';
    document.getElementById('fbComment').value = '';
    loadFeedback();
}

async function loadFeedback() {
    const res = await fetch(`${baseUrl}/feedback`);
    const data = await res.json();
    const list = document.getElementById('feedbackList');
    list.innerHTML = '';
    if(Array.isArray(data)) {
        data.forEach(item => {
            
            list.innerHTML += `<div class="feedback-item"><strong>${item.username}</strong> (${item.course_name}): <br/>${item.comment}</div>`;
        });
    }
}

async function updateProfile(e) {
    e.preventDefault();
    const bio = document.getElementById('profileBio').value;
    
    const res = await fetch(`${baseUrl}/profile/update`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ profile_bio: bio })
    });
    if(res.ok) alert('Profile saved!');
}

async function uploadDocument(e) {
    e.preventDefault();
    const formData = new FormData(document.getElementById('uploadForm'));
    const res = await fetch(`${baseUrl}/upload-submission`, {
        method: 'POST',
        body: formData
    });
    const data = await res.json();
    if(data.success) {
        document.getElementById('uploadResult').innerText = "Uploaded to " + data.path;
    }
}

async function pingServer(e) {
    e.preventDefault();
    const host = document.getElementById('pingHost').value;
    const res = await fetch(`${baseUrl}/system/diagnostics`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ host })
    });
    const data = await res.json();
    const resultBox = document.getElementById('pingResult');
    resultBox.style.display = 'block';
    resultBox.innerText = data.output;
}
