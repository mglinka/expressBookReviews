const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

const getAllBooks = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books);
    }, 100); // Simulate async operation
  });
};

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Missing username or password" });
  } else if (doesExist(username)) {
    return res.status(404).json({ message: "User already exists." });
  } else {
    users.push({ username: username, password: password });
    return res
      .status(200)
      .json({ message: "User successfully registered. Please login." });
  }
});

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const allBooks = await getAllBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (e) {
    console.error("Error fetching all books:", e);
    res.status(500).send(e);
  }
});

// Get book details based on ISBN using Promises
public_users.get("/isbn/:isbn", (req, res) => {
  const targetISBN = req.params.isbn;
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const book = books[targetISBN];
      if (book) {
        resolve(book);
      } else {
        reject("ISBN not found.");
      }
    }, 100);
  })
    .then((book) => res.status(200).json(book))
    .catch((err) => {
      console.error("Error fetching book by ISBN:", err);
      res.status(404).json({ message: err });
    });
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  try {
    const booksArray = Object.values(await getAllBooks());
    const matchingBooks = booksArray.filter(
      (book) => book.author.toLowerCase() === req.params.author.toLowerCase()
    );
    if (matchingBooks.length > 0) {
      return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } else {
      return res.status(404).json({ message: "No books by that author." });
    }
  } catch (e) {
    console.error("Error fetching books by author:", e);
    res.status(500).send(e);
  }
});

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  try {
    const booksArray = Object.values(await getAllBooks());
    const matchingTitle = booksArray.filter(
      (book) => book.title.toLowerCase() === req.params.title.toLowerCase()
    )[0];
    if (matchingTitle) {
      return res.status(200).json(matchingTitle);
    } else {
      return res.status(404).json({ message: "Title not found." });
    }
  } catch (e) {
    console.error("Error fetching book by title:", e);
    res.status(500).send(e);
  }
});

//  Get book review
public_users.get("/review/:isbn", (req, res) => {
  const targetISBN = req.params.isbn;
  const targetBook = books[targetISBN];
  if (targetBook) {
    return res.status(200).send(JSON.stringify(targetBook.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "ISBN not found." });
  }
});

module.exports.general = public_users;
