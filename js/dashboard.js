// dashboard.js (Dashboard)
document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username'); // Retrieve username

    if (!username) {
       window.location.href = 'index.html'; // Redirect to login if not logged in
       return;
    }

    const dataDisplay = document.getElementById('dataDisplay');
    const dataForm = document.getElementById('dataForm');

    // Fetch user data
    fetch('/data?username=' + username)
    .then(response => response.json())
    .then(data => {
        displayData(data);
    });

    dataForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const newData = document.getElementById('newData').value;

        fetch('/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, data: newData })
        })
        .then(response => response.json())
        .then(data => {
            displayData(data); // Update displayed data
            document.getElementById('newData').value = ''; // Clear input field
        });
    });

    function displayData(data) {
        dataDisplay.innerHTML = ''; // Clear current data
        data.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                <p>${item.data}</p>
                <button class="editButton" data-id="${item.id}">Edit</button> <button class="deleteButton" data-id="${item.id}">Delete</button>
            `;
            dataDisplay.appendChild(itemDiv);

            //Event listeners for edit and delete buttons
            itemDiv.querySelector('.editButton').addEventListener('click', () => handleEdit(item));
            itemDiv.querySelector('.deleteButton').addEventListener('click', () => handleDelete(item.id));
        });
    }

    function handleEdit(item) {

       const newValue = prompt("Enter new value", item.data);
       if(newValue) {
           fetch(`/data/${item.id}`, {
               method: 'PUT',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({data: newValue})
           })
           .then(response => response.json())
           .then(data => displayData(data));
       }
    }

    function handleDelete(id) {
        if (confirm("Are you sure you want to delete this item?")) {
            fetch(`/data/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => displayData(data));
        }
    }

});