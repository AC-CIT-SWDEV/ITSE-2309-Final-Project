// script.js (Login Page)
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/api/login', {  // Send login request to the server
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = 'dashboard.html'; // Redirect to dashboard
        } else {
            alert('Invalid credentials');
        }
    });
});

// Check for existing token on login page load
document.addEventListener('DOMContentLoaded', function() {
    if (document.cookie) {

        const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=');

        if (token) {
            // If token exists, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    };
});