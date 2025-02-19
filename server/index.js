/***********************************************************************

MAKE ADJUSTMENTS ONLY WHERE INSTRUCTED

    IF YOU SEE THE FOLLOWING COMMENT BORDER: *-*-*-*-*-*-*-*-*
    IT IS A SIGNAL THAT YOU WILL CHANGE SOMETHING WITHIN THE CODE BLOCK BELOW IT!


I PROVIDE A COPY OF THE CODE YOU ARE NOT SUPPOSED TO CHANGE IN CASE YOU ACCIDENTALLY
DO!
***********************************************************************/

/***********************************************************************

BACK END SETUP

DO NOT ALTER THE FOLLOWING:

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const cors = require('cors');
const app = express();

const domain = 'http://localhost';
const port = 3000;

const jwtSecret = 'ip234i234!!!asdn_d';

const corsOptions = {
    origin: `${domain}:${port}`,
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

***********************************************************************/
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const cors = require('cors');
const app = express();

const domain = 'http://localhost';
const port = 3000;

const jwtSecret = 'ip234i234!!!asdn_d';

const corsOptions = {
    origin: `${domain}:${port}`,
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

/*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*

    MYSQL SETUP

    1. CHANGE mysql_DB to match your database name

-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*/

// MySQL Configuration
const mysql_host = 'localhost';
const mysql_user = 'root';
const mysql_password = 'root';
const mysql_db = ''; // <-- 1. CHANGE HERE

const db = mysql.createConnection({
    host: mysql_host,
    user: mysql_user,
    password: mysql_password,
    database: mysql_db
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

/***********************************************************************

WITH AUTH MINIMALLY PREVENTS UNAUTHORIZED ACCESS TO CERTAIN API REQUESTS
AND CAN REDIRECT USERS FROM ACCESSING THE DASHBOARD WHEN NO TOKEN (cookie)
IS PRESENT (requires username and password)

DO NOT ALTER THE FOLLOWING:

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

            // only include the admin property if the user account is actually an admin
            resUser.isAdmin ? user.isAdmin = true : null;

            if (req.path.startsWith('/api/admin') && !results[0].isAdmin) { 
                return res.status(401).json({ error: 'Unauthorized' });
            }

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

***********************************************************************/

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

            // only include the admin property if the user account is actually an admin
            resUser.isAdmin ? user.isAdmin = true : null;

            if (req.path.startsWith('/api/admin') && !results[0].isAdmin) { 
                return res.status(401).json({ error: 'Unauthorized' });
            }

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

/***********************************************************************

ENDPOINTS TO DEFINE ROUTES FOR HTML PAGES AND LOGIN/COOKIE FUNCTIONALITY

DO NOT ALTER THE FOLLOWING:

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});
  
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/signup.html'));
});
  
app.get('/dashboard', withAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/'); 
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

***********************************************************************/

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});
  
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/signup.html'));
});
  
app.get('/dashboard', withAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/'); 
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

/*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*

    API ENDPOINTS HANDLING SQL

    YOU MUST PROVIDE THE SQL TO MAKE THE ENDPOINTS WORK CORRECTLY!

    HOW TO WRITE SQL QUERIES IN THE FOLLOWING FORMAT: ...query(sql, [...])

        - sql: This is a variable that holds the SQL query as a string. It contains the SQL statement you want to execute (e.g., SELECT * FROM users).
        - values/[...]: This is an array of values that will replace placeholders (if any) within your SQL query.

        EXAMPLE: 
            - sql: SELECT * FROM users WHERE username =? AND password =?
            - values: [username, password]
                - The first ? will be replaced with the provided value of username.
                - The second ? will be replaced with the provided value of password.

    You can see an example of what your SQL will look like @ line 188

-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*/

const SQL_SELECT_ALL_USERS = `
    -- Select all columns from the 'users' table
    -- expect 'username'to be provided
    
    YOUR SQL STATEMENT HERE <-- replace
`;

const SQL_INSERT_NEW_USER = `
    -- Insert a new row into the 'users' table
    -- expect 'username' to be provided
    -- expect 'password' to be provided
    
    YOUR SQL STATEMENT HERE <-- replace
`;

const SQL_SELECT_DATA = `
    -- Select all columns from the 'data' table
    -- expect 'user_id' to be provided
    
    YOUR SQL STATEMENT HERE <-- replace
`;

const SQL_INSERT_DATA = `
    -- Insert a new row into the 'data' table.
    -- expect 'user_id' to be provided
    -- expect 'data' to be provided
    
    YOUR SQL STATEMENT HERE <-- replace
`;

const SQL_UPDATE_DATA = `
    -- Update the 'data' table
    -- expect 'data' to be provided
    -- expect 'id' to be provided
    
    YOUR SQL STATEMENT HERE <-- replace
`;

const SQL_DELETE_DATA = `
    -- Delete from the 'data' table
    -- expect 'id' to be provided
    
    YOUR SQL STATEMENT HERE <-- replace
`;

const SQL_ADMIN_SELECT = `
    -- Select the 'id', 'username', and 'isAdmin' columns
    -- from the 'users' table
    
    YOUR SQL STATEMENT HERE <-- replace
`;

const SQL_ADMIN_LIKE_DATA = `
    -- Select all columns from the 'data' table
    -- where the 'data' column matches the provided 'filter' using the LIKE operator
    -- expect '%filter%' to be provided for your LIKE operator
    
    YOUR SQL STATEMENT HERE <-- replace
`;

/*-*-*-*-*-* 
    BONUS +2 points

    - If your SQL runs without error here AND proves to function correctly!

*-*-*-*-*-* */
const SQL_ADMIN_DELETE = `
    -- Delete from the 'users' table
    -- where the 'id' matches the provided 'userId'
    
    YOUR SQL STATEMENT HERE <-- replace
`;

/***********************************************************************

ACTUAL ENDPOINTS USING THE SQL STATEMENTS YOU COMPLETE

DO NOT ALTER CODE BETWEEN LINES 405 - 576

***********************************************************************/

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const [existingUser] = await db.promise().query(SQL_SELECT_ALL_USERS, [username]);

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

app.get('/api/data', withAuth, (req, res) => {
    const { id, username, isAdmin } = req.body.user;
    
    db.query(SQL_SELECT_DATA, [id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch data' });
        } else {
            const response = {
                results: results, 
                username: username
            }

            isAdmin ? response.isAdmin = true : null;

            res.json(response);
        }
    });
});

app.post('/api/data', withAuth, (req, res) => {
    const { data } = req.body;
    const { id } = req.body.user;
    // Students will implement database query to insert data
    db.query(SQL_INSERT_DATA, [id, data], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to add data' });
        } else {
            // After inserting, fetch and return the updated data
            db.query(SQL_SELECT_DATA, [id], (err, results) => {
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

    db.query(SQL_UPDATE_DATA, [data, id], (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update data' });
        } else {
            db.query(SQL_SELECT_DATA, [user_id], (err, results) => {
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

app.delete('/api/data/:id', withAuth, (req, res) => {
    const { id } = req.params;
    const user_id  = req.body.user.id;

    db.query(SQL_DELETE_DATA, [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete data' });
        }

        db.query(SQL_SELECT_DATA, [user_id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to fetch data after deletion' });
            }
            res.json(results);
        });
    });
});

app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [existingUser] = await db.promise().query(SQL_SELECT_ALL_USERS, [username]);

        if (existingUser.length > 0) {
            if (existingUser[0].length > 0) {
                return res.status(400).json({ error: 'Username already exists!' });
            }
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await db.promise().query(SQL_INSERT_NEW_USER, [username, hashedPassword]);

        res.json({ message: 'User registered successfully' });

    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

app.get('/api/admin/users', withAuth, (req, res) => {
    db.query(SQL_ADMIN_SELECT, (err, results) => {
      if (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
      res.json(results);
    });
});

app.delete('/api/admin/users/:id', withAuth, (req, res) => {
    const userId = req.params.id;
  
    db.query(SQL_ADMIN_DELETE, [userId], (err, results) => {
      if (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ error: err });
      }
      res.json({ message: 'User deleted successfully' });
    });
});

app.get('/api/data/filter', withAuth, (req, res) => {
    const filter = req.query.filter;
  
    if (!filter) {
      return res.status(400).json({ error: 'Missing filter parameter' });
    }
  
    db.query(SQL_ADMIN_LIKE_DATA, [`%${filter}%`], (err, results) => {
      if (err) {
        console.error("Error filtering data:", err);
        return res.status(500).json({ error: 'Failed to filter data' });
      }
      res.json(results);
    });
});

/***********************************************************************

MAKE ENDPOINTS AVAILABLE ON SPECIFIED PORT

DO NOT ALTER THE FOLLOWING:

app.listen(port, () => {
    console.log(`Server listening on port ${port} | Navigate to ${domain}:${[port]}`);
});

***********************************************************************/

app.listen(port, () => {
    console.log(`Server listening on port ${port} | Navigate to ${domain}:${[port]}`);
});