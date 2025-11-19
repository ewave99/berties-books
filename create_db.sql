# Create database script for Berties books

# Create the database
CREATE DATABASE IF NOT EXISTS berties_books;
USE berties_books;

# Create the tables
CREATE TABLE IF NOT EXISTS books (
    id     INT AUTO_INCREMENT,
    name   VARCHAR(50),
    price  DECIMAL(5, 2),
    PRIMARY KEY(id));
CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(20),
    first_name VARCHAR(10),
    last_name VARCHAR(30),
    email VARCHAR(50),
    hashed_password CHAR(60),
    PRIMARY KEY (username)
);
CREATE TABLE IF NOT EXISTS logins (
    id INT AUTO_INCREMENT,
    username VARCHAR(20),
    login_datetime DATETIME,
    successful BOOLEAN,
    PRIMARY KEY(id)
);

# Create the application user
CREATE USER IF NOT EXISTS 'berties_books_app'@'localhost' IDENTIFIED BY 'qwertyuiop';
GRANT ALL PRIVILEGES ON berties_books.* TO ' berties_books_app'@'localhost';