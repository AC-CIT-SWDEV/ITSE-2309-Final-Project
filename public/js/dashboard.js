// dashboard.js (Dashboard)
document.addEventListener('DOMContentLoaded', function() {

    const dataDisplay = document.getElementById('dataDisplay');
    const dataForm = document.getElementById('dataForm');

    // Fetch user data (no need to send username, it's in the JWT)
    fetch('api/data', {
        method: 'GET',
        credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
            displayData(data);
        });

    dataForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const newData = document.getElementById('newData').value;

        fetch('/api/data', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: newData }) // No need to send username
        })
      .then(response => response.json())
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
            fetch(`http://localhost:3000/api/data/${item.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: newValue })
            })
          .then(response => response.json())
          .then(data => displayData(data));
        }
    }

    function handleDelete(id) {
        if (confirm("Are you sure you want to delete this item?")) {
            fetch(`/api/data/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
          .then(response => response.json())
          .then(data => displayData(data));
        }
    }
});