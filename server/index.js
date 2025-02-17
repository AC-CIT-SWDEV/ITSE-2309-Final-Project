const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// MySQL Configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_user',
    password: 'your_password',
    database: 'your_database'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files (HTML, CSS, JS)

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Students will implement database query to check credentials
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) {
            console.error(err);
            res.json({ success: false });
        } else if (results.length > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    });
});

app.get('/data', (req, res) => {
  const username = req.query.username;
  // Students will implement database query to get user data
  db.query('SELECT * FROM data WHERE username = ?', [username], (err, results) => {
      if (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to fetch data' });
      } else {
          res.json(results);
      }
  });
});

app.post('/data', (req, res) => {
    const { username, data } = req.body;
    // Students will implement database query to insert data
    db.query('INSERT INTO data (username, data) VALUES (?, ?)', [username, data], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to add data' });
        } else {
            // After inserting, fetch and return the updated data
            db.query('SELECT * FROM data WHERE username = ?', [username], (err, results) => {
                if (err) {
                   console.error(err);
                    res.status(500).json({ error: 'Failed to fetch data' });
                } else {
                     res.json(results);
                }
            });
        }
    });
});

app.put('/data/:id', (req, res) => {
    const { id } = req.params;
    const { data } = req.body;

    db.query('UPDATE data SET data = ? WHERE id = ?', [data, id], (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update data' });
        } else {
            db.query('SELECT * FROM data WHERE username = ?', [req.body.username], (err, results) => { // Assuming you send username in the body
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Failed to fetch data' });
                } else {
                    res.json(results);
                }
            });
        }
    });
});

app.delete('/data/:id', (req, res) => {
    const { id } = req.params;
    const username = req.body.username; // Get username from the request body

    db.query('DELETE FROM data WHERE id =?', [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete data' });
        }

        // After successful deletion, fetch the updated data for the user
        db.query('SELECT * FROM data WHERE username =?', [username], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to fetch data after deletion' });
            }
            res.json(results); // Send the updated data back to the client
        });
    });
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Check if username already exists
        const [existingUser] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // 2. Hash the password
        const saltRounds = 12; // Adjust as needed (higher is more secure, but slower)
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await db.promise().query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

        res.json({ message: 'User registered successfully' }); // Or redirect, etc.

    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});



// ... (Other routes) ...

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});