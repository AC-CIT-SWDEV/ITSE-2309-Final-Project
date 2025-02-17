// signup.js (Client-side JavaScript for signup)

document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // HERE, WE SEND THE USERNAME AND PASSWORD WITHIN THE BODY OF OUR REQUEST TO THE BACKEND AT ENDPOING '/signup'

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            window.location.href = 'index.html'; // Redirect to login page
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error during signup:', error);
        alert('An error occurred during signup.');
    }
});