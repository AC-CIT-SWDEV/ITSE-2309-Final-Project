/***********************************************************************

DO NOT ALTER THIS PAGE!!

***********************************************************************/
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    await fetch('/api/login', {  // Send login request to the server
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(async data => {
        if (data.success) {
            // bake the cookie!
            try {
                await fetch(`/api/bake-my-cookie`, {
                  method: 'POST',
                  credentials: 'include',
                  headers: {
                    'Authorization': `Bearer ${data.payload.username}`,
                  },
                }).then(response => response.json())
                  .then(data => {
                    console.log(data.message);
                  })
                  .catch(err => {
                    console.log(err);
                  });
                
                  window.location.href = '/dashboard';
                  
              } catch (err) {
                console.log(err);
              }    

        } else {
            alert('Invalid credentials');
        }
    });
});