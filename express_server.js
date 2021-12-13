//import external modules
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { request } = require("express");
const cookieSession = require("cookie-session");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur";
const hashedPassword = bcrypt.hashSync(password, 10);

// Middlewares initialization

app.use(
  cookieSession({
    name: "session",
    keys: ["Elena14"],
  })
);

//Functions
const {
  generateRandomString,
  getUserByEmail,
  checkEmailAndPass,
} = require("./helpers");

//Database for the users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

/*ROUTING*/

//GET - Root
app.get("/", (req, res) => {
  const user_id = req.session["user_id"];
  if (user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// GET - urls Index Page
app.get("/urls", (req, res) => {
  const user_id = req.session["user_id"];
  const user = users[user_id];
  const urls = {};
  for (const url in urlDatabase) {
    if (user_id === urlDatabase[url].userID) {
      urls[url] = urlDatabase[url].longURL;
    }
  }
  const templateVars = { urls: urls, user: user };
  res.render("urls_index", templateVars);
});

//GET - Generate a new short URL from a long URL
app.get("/urls/new", (req, res) => {
  const user_id = req.session["user_id"];
  if (!user_id) {
    res.redirect("/login");
  }
  const user = users[user_id];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

//GET - Login page for Registered User
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("login", templateVars);
});

//GET - Short url page where you can edit long URLs
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session["user_id"];
  const user = users[user_id];
  const { longURL } = urlDatabase[req.params.shortURL] || {};
  if (!longURL) {
    return res
      .status(404)
      .send(
        `<h1 style="text-align: center; color:red">Error: 404 Page is not found</h1>`
      );
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL,
    user: user,
  };
  res.render("urls_show", templateVars);
});

//GET - redirecting to the Long URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//GET - New User Registration
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("register", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

//POST - handles user input form submission
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(404).send("Need to Login to create/modify a TinyAppURL");
  }
  const userID = req.session["user_id"];
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  console.log(req.body);
  urlDatabase[shortURL] = { longURL, userID };

  res.redirect(`/urls/${shortURL}`);
});

//POST - Handles to Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res
      .status(403)
      .send("Invalid credentials. Please <a href ='/login'>try again</a>.");
  }
  const user = checkEmailAndPass(email, password, users);
  if (user) {
    req.session["user_id"] = user.id;
    res.redirect("/urls");
  } else {
    res
      .status(403)
      .send(
        `Your credential doesn't match. Please <a href ='/login'>try again</a>.`
      );
  }
});

//POST - Handles users Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//POST - Validate the registration, forward user to list of urls
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res
      .status(400)
      .send(
        "Missing email or password. Please <a href ='/register'>try again</a>."
      );
  }
  const user = getUserByEmail(email, users);
  if (user) {
    return res
      .status(400)
      .send(
        "E-mail already exists. Please <a href ='/register'>try again</a>."
      );
  }
  const newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: email,
    password: bcrypt.hashSync(password, 10),
  };
  req.session.user_id = users[newID].id;
  res.redirect("/urls");
});

//POST - Short url page where user can edit long URLs
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.updatedURL;
  console.log("hellog", req.body.updatedURL);
  res.redirect("/urls/");
});

//POST - Delete a link off url list
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session["user_id"];
  const shortURL = req.params.shortURL;
  if (shortURL in urlDatabase) {
    if (userID === urlDatabase[shortURL].userID) {
      delete urlDatabase[shortURL];
      res.redirect("/urls/");
    }
  }
  res.send("<h4>You are not autorized to delete it</h4>");
});

// Server listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
