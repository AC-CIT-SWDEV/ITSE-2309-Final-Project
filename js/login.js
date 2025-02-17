// script.js (Login Page)
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {  // Send login request to the server
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('username', username); // Store username for dashboard
            window.location.href = 'dashboard.html'; // Redirect to dashboard
        } else {
            alert('Invalid credentials');
        }
    });
});