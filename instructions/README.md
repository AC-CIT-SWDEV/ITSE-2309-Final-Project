## ITSE 2309 Final Project - Student Instructions

### **Project Setup**

1. **Clone the repository:**
   - Open your command prompt (CMD) or terminal.
   - Navigate to a suitable directory where you want to maintain the project (e.g., `C:\Projects` or `Documents\Code`).
    - Run the following command to clone the repository:
    ```bash
     git clone https://github.com/AC-CIT-SWDEV/ITSE-2309-Final-Project.git
     ```

2. **Install dependencies:**
   - Navigate to the `server` directory within the cloned project:
     - Assuming you're in the directory > \ITSE-2309-Final-Project>
     ```bash
     cd server
     ```

   - Install the required npm packages:

     ```bash
     npm install
     ```
    > You should see this if **npm install** succeeded!\
    ***It may find vulnerabilities, this is okay!***

    ![Image of successfull npm i cmd](./image-help/npm-i-success.png "Successfull npm i")

1. **Configure database connection:**
   - Open the `index.js` file within the `server` directory using a text editor.
   - Locate the following line of code:

     ```javascript
     const mysql_db = ''; // <-- 1. CHANGE HERE 
     ```

   - Change `''` to the name of your local MySQL database.

2. **Start the server:**
   - In your command prompt or terminal (while still in the `server` directory), run the following command:

     ```bash
     npm start
     ```

   - This will start the Node.js server and automatically refresh the application whenever you make changes to the code.
   - You can now access the application in your browser at [http://localhost:3000](http://localhost:3000).
    
    > You should see this if **npm start** succeeded!

    ![Image of successfull npm start](./image-help/npm-start-working.png "Successfull npm start")

### **Database Setup**

1. **Connect to MySQL:**
   - Open your MySQL Shell.
   - Connect to your local MySQL server using the following command:

     ```sql
     \connect root@localhost
     ```

   - Enter your MySQL root password when prompted.
     - Your password should be **root**
   - Enter SQL mode:

     ```sql
     \sql
     ```
     
    - Create a database called **notes**.
        ```sql
        create database notes;
        ```
    - Use our new database **notes**.
        ```sql
        use notes;
        ```

2. **Create tables:**
   - Create the necessary tables in your database!

   > Table 1: users | *all lowercase table name*
   - user_id | int
   - username | varchar(255)
   - password | varchar(255)
   - isAdmin | BOOLEAN 

   > Table 2: data | *all lowercase table name*
   - id | int 
   - user_id | int
   - data | TEXT
   
  > **Make sure to include auto_incremenet for your Primary Keys!**-
  
  > **Make sure to include NOT NULL for all Primary Keys & Foreign Keys!** 

### **Complete the API Endpoints**

1. **Edit `index.js`:**
   - Navigate back to the `index.js` file within the `server` directory.
   - Locate the sections marked with comments like `-- YOUR SQL STATEMENT HERE`.
   - Write the SQL statements to complete the API endpoints based on the provided instructions and comments.
  
    ![Image of successfull npm start](./image-help/sql-statements-block.png "Successfull npm start")

2. **Test your code:**
   - Observe the output in your command prompt or terminal for any error messages.
   - Test the functionality of the application in your browser.
   - Use the MySQL Shell to view the data in your database and verify that your SQL statements are working correctly.
   - **For any (1) user in your users table, set the isAdmin column to 1 (*aka true*) and login with that user. You should then try the admin features in the dashboard**


### > Good luck, and have fun building your final project!
