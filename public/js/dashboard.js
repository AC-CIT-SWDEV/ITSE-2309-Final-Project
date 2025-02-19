// dashboard.js (Dashboard)
document.addEventListener('DOMContentLoaded', function() {

    const dataDisplay = document.getElementById('dataDisplay');
    const dataForm = document.getElementById('dataForm');

    fetch('/api/data', {
        method: 'GET',
        credentials: 'include'
    }).then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = '/';
          } else {
            throw new Error('Network response was not ok');
          }
        }
        return response.json(); // If successful
      })
      .then(data => {
        const username = data.username;
        const welcomeElement = document.getElementById('welcome');
        if (welcomeElement) welcomeElement.textContent = `Welcome, ${username}!`;
        displayData(data.results);
      })
      .catch(error => {
        console.error('Error:', error);
      });

    const logoutButton = document.getElementById('logoutButton');

    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        fetch('/logout', { 
          method: 'GET',
          credentials: 'include' 
        })
      .then(response => {
          if (response.ok) {
            // Redirect to login (the server should already do this, but this is a fallback)
            window.location.href = '/'; 
          } else {
            // Handle errors if the logout fails
            console.error('Logout failed'); 
          }
        })
      .catch(error => {
          console.error('Error during logout:', error);
        });
      });
    }

    dataForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const newData = document.getElementById('newData').value;

        fetch('/api/data', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: newData })
        })
        .then(response => {
          if (!response.ok) {
              if (response.status === 401) {
                  // Redirect to login page
                  window.location.href = '/login'; 
              } else {
                  // Handle other errors
                  throw new Error('Network response was not ok');
              }
            }
          return response.json(); 
        })
      .then(data => {
            displayData(data);
            document.getElementById('newData').value = '';
        });
    });

    function displayData(data) {
        dataDisplay.innerHTML = '';
        data.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                <p>${item.data}</p>
                <button class="editButton" data-id="${item.id}">Edit</button> <button class="deleteButton" data-id="${item.id}">Delete</button>
            `;
            dataDisplay.appendChild(itemDiv);

            itemDiv.querySelector('.editButton').addEventListener('click', () => handleEdit(item));
            itemDiv.querySelector('.deleteButton').addEventListener('click', () => handleDelete(item.id));
        });
    }

    function handleEdit(item) {
        const newValue = prompt("Enter new value", item.data);
        if (newValue) {
            fetch(`/api/data/${item.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: newValue })
            })
            .then(response => {
              if (!response.ok) {
                  if (response.status === 401) {
                      // Redirect to login page
                      window.location.href = '/login'; 
                  } else {
                      // Handle other errors
                      throw new Error('Network response was not ok');
                  }
                }
              return response.json(); 
            })
          .then(data => displayData(data));
        }
    }

    function handleDelete(id) {
        if (confirm("Are you sure you want to delete this item?")) {
            fetch(`/api/data/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            .then(response => {
              if (!response.ok) {
                  if (response.status === 401) {
                      // Redirect to login page
                      window.location.href = '/login'; 
                  } else {
                      // Handle other errors
                      throw new Error('Network response was not ok');
                  }
                }
              return response.json(); 
            })
          .then(data => displayData(data));
        }
    }
});