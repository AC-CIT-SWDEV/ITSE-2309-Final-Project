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

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

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

const withAuth = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        // If it's an API request, return 401 Unauthorized
        if (req.path.startsWith('/api')) { 
            return res.status(401).json({ error: 'Unauthorized' });
        } else {
            // Otherwise, allow access (e.g., to the login page)
            return next();
        }
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const username = decoded.accessToken;

        db.query('SELECT * FROM users WHERE username =?', [username], (err, results) => {
            if (err || results.length === 0) {
                // If it's an API request, return 401 Unauthorized
                if (req.path.startsWith('/api')) {
                    return res.status(401).json({ error: 'Unauthorized' });
                } else {
                    return next();
                }
            }

            // if user is authenticated, we will authorize access and append the id to
            // a request that requires the token in the first place
            const resUser = results[0];

            const user = {
                id: resUser.id,
                username: resUser.username
            }

            resUser.isAdmin ? user.isAdmin = true : null;
            
            req.body.user = user
            next();
        });

    } catch (err) {
        // If it's an API request, return 401 Unauthorized
        if (req.path.startsWith('/api')) {
            return res.status(401).json({ error: 'Unauthorized' });
        } else {
            // Otherwise, allow access (e.g., to the login page)
            return next();
        }
    }
};

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const [existingUser] = await db.promise().query('SELECT * FROM users WHERE username =?', [username]);

        if (existingUser.length === 0 ||!(await bcrypt.compare(password, existingUser[0].password))) {
            return res.status(401).json({ success: false });
        }

        res.clearCookie('token');

        const payload = {
            username: existingUser[0].username
        };
        
        res.json({ success: true, payload: payload });

        res.end();

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false });
    }
});

app.post('/api/bake-my-cookie', async (req, res) => {
    const accessToken = req.headers.authorization.split(' ')[1];
    const encodedToken = jwt.sign({ accessToken }, jwtSecret);
    const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Add 24 hours to current date
    res.cookie('token', encodedToken, {
        expires: expirationDate,
        httpOnly: true,
        path: "/",
    });
    res.status(200).send({message: "Successful Batch!"});
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});
  
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/signup.html'));
});
  
app.get('/dashboard', withAuth, (req, res) => { // withAuth protects the dashboard
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/api/data', withAuth, (req, res) => {
    const { id, username } = req.body.user; // Access user from req.user (set in withAuth)
    
    db.query('SELECT * FROM data WHERE user_id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch data' });
        } else {
            res.json({results: results, username: username});
        }
    });
});

app.post('/api/data', withAuth, (req, res) => {
    const { data } = req.body;
    const { id } = req.body.user;
    // Students will implement database query to insert data
    db.query('INSERT INTO data (user_id, data) VALUES (?, ?)', [id, data], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to add data' });
        } else {
            // After inserting, fetch and return the updated data
            db.query('SELECT * FROM data WHERE user_id = ?', [id], (err, results) => {
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

app.put('/api/data/:id', withAuth, (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
    const user_id  = req.body.user.id;

    db.query('UPDATE data SET data = ? WHERE id = ?', [data, id], (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update data' });
        } else {
            db.query('SELECT * FROM data WHERE user_id = ?', [user_id], (err, results) => { // Assuming you send id in the body
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Failed to fetch data' });
                } else {
                    console.log(results)
                    res.json(results);
                }
            });
        }
    });
});

app.delete('/api/data/:id', withAuth, (req, res) => {
    const { id } = req.params;
    const user_id  = req.body.user.id;

    db.query('DELETE FROM data WHERE id = ?', [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete data' });
        }

        // After successful deletion, fetch the updated data for the user
        db.query('SELECT * FROM data WHERE user_id = ?', [user_id], (err, results) => {
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
        // 1. Check if id already exists
        const [existingUser] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);

        if (existingUser.length > 0) {
            console.log(existingUser)
            if (existingUser[0].length > 0) {
                return res.status(400).json({ error: 'Username already exists!' });
            }
        }

        // 2. Hash the password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await db.promise().query('INSERT INTO Users (username, password) VALUES (?, ?)', [username, hashedPassword]);

        res.json({ message: 'User registered successfully' }); // Or redirect, etc.

    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
  
    res.redirect('/'); 
  });

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
