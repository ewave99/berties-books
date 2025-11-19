// Import modules
const express = require("express")
const bcrypt = require('bcrypt');

// Create a new router
const router = express.Router()

// The salt for the hashing algorithm
const saltRounds = 10;

// Render registration form page for a new user.
router.get('/register', function (req, res, next) {
    res.render('register.ejs')
});

// Render login page for user.
router.get("/login", function (req, res, next) {
    res.render("login.ejs");
});

// Render page that lists all the users in the 'users' table in our database.
router.get('/list', function (req, res, next) {
    // Query database to get list of users.
    const sqlQuery = "SELECT username, first_name, last_name FROM users ORDER BY username ASC";
    // Execute the query.
    db.query(sqlQuery, (err, result) => {
        if (err)
            next(err);
        else
            res.render("list_users.ejs", {userData: result});
    });
});

// Render the registration success page.
router.post('/registered', function (req, res, next) {
    // Save data in database
    const plainPassword = req.body.password;
    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
        // Store hashed password in your database.
        const dbQuery = `INSERT INTO users (username, first_name, last_name, email, hashed_password)
        VALUES (?, ?, ?, ?, ?)`;
        const {username, first, last, email} = req.body;
        const newRecord = [username, first, last, email, hashedPassword];

        db.query(dbQuery, newRecord, (err, result) => {
            if (err)
                next(err);
            else {
                let message = `Hello, ${username}. You are now registered! We will send an email to you at ${email}.`;
                message += `Your password is ${plainPassword} and your hashed password is ${hashedPassword}`;
                res.send(message);
            }
        })
    });                                                                        
}); 

// Process the user's login details and render either a success or failure page.
router.post("/loggedin", function (req, res, next) {
    // Select the hashed password from the database, where the username matches the username entered.
    const sqlQuery = "SELECT hashed_password FROM users WHERE username = ?";
    const params = [req.body.username];
    db.query(sqlQuery, params, (err, result) => {
        if (err)
            // If username does not exist in database... Send an error message.
            res.send(err);
        else {
            let hashedPassword = result[0].hashed_password;
            // Compare the user's password with the hashed password in the database.
            bcrypt.compare(req.body.password, hashedPassword, function (err, result) {
                const username = req.body.username;

                const datetime = new Date();
                const year = datetime.getFullYear();
                const month = datetime.getMonth();
                const day = datetime.getDate();
                const hour = datetime.getHours();
                const min = datetime.getMinutes();
                const sec = datetime.getSeconds();

                const dateString = `${year}-${month}-${day} ${hour}:${min}:${sec}`;

                const successful = result;

                const sqlQuery = "INSERT INTO logins (username, login_datetime, successful) VALUES (?, ?, ?)";
                const params = [username, dateString, successful];

                if (err)
                    res.send(err);
                else
                    db.query(sqlQuery, params, (err, result) => {
                        if (err)
                            res.send(err);
                        if (successful === true)
                            res.send("Login successful.");
                        else
                            res.send("Sorry, your login was unsuccessful. Password did not match. Attempt has been logged.");
                    });
            });
        }
    });
});

// Export the router object so index.js can access it
module.exports = router;