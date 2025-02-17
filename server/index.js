const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;

const jwtSecret = 'ip234i234!!!asdn_d';

// MySQL Configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'password_vault'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000",
      optionsSuccessStatus: 200,
    })
  );

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../public/error.html'));
// });

const withAuth = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('login.html'); // Redirect to login if no token
    }

    try {
        // Verify and decode the JWT
        const decoded = jwt.verify(token, jwtSecret);

        // Access the secret key (username in this case)
        const username = decoded.username;

        db.query('SELECT * FROM users WHERE username =?', [username], (err, results) => {
            if (err || results.length === 0) {
                return res.redirect('login.html'); // User not found or error
            }

            // go next!
            next();
        });

    } catch (err) {
        // Token is invalid or expired
        return res.redirect('login.html');
    }
};

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const [existingUser] = await db.promise().query('SELECT * FROM users WHERE username =?', [username]);

        if (existingUser.length === 0 ||!(await bcrypt.compare(password, existingUser[0].password))) {
            return res.status(401).json({ success: false });
        }

        const payload = {
            username: existingUser.username,
        };

        // Generate the JWT with a 10-minute expiry
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '10m' });

        // Set the token as a cookie
        res.cookie('token', token, { httpOnly: true, maxAge: 10 * 60 });

        res.json({ success: true, token });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false });
    }
});

app.get('/dashboard.html', withAuth, (req, res) => {
    console.log(res)
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/api/data', withAuth, (req, res) => {
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

app.post('/api/data', withAuth, (req, res) => {
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

app.put('/api/data/:id', (req, res) => {
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

app.delete('/api/data/:id', (req, res) => {
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

app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Check if username already exists
        const [existingUser] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);

        if (existingUser[0].length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // 2. Hash the password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await db.promise().query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

        res.json({ message: 'User registered successfully' }); // Or redirect, etc.

    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
