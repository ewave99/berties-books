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
            next(err);
        else {
            let hashedPassword = result[0].hashed_password;
            // Compare the user's password with the hashed password in the database.
            bcrypt.compare(req.body.password, hashedPassword, function (err, result) {
                if (err)
                    next(err);
                else if (result === true)
                    res.send("Login successful.");
                else
                    res.send("Sorry, your login was unsuccessful. Password did not match.");
            });
        }
    });
}, function (err) {
    res.send(err);
});

// Export the router object so index.js can access it
module.exports = router;