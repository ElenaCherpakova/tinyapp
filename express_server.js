const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { request } = require("express");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const generateRandomString = function () {
  return Math.random().toString(36).substr(2, 6);
};

//DATA
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//function for looping throw the object if the key exists
const getUserByEmail = function(email, userDataBase) {
  for (const user in userDataBase) {
    if (userDataBase[user].email === email) {
      return userDataBase[user];
    }
  }
  return null;
}



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { 
    urls: urlDatabase, 
    user: user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(req.body); 
  res.redirect(`/urls`); 
});

//Delete 
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls/'); 
});

//Update 
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect('/urls/'); 
});


app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
    };
    res.render('login', templateVars)
});


const checkEmailAndPass = function(email, password, userDataBase) {
  for (const user in userDataBase) {
    if (userDataBase[user].email === email && userDataBase[user].password === password) {
      return true;
    }
  }
  return false;
}


app.post("/login", (req, res) => {
  const newEmail = req.body.email;
  console.log(newEmail);
  const newPassword = req.body.password;
    if (!checkEmailAndPass(newEmail, newPassword, users)) {
      res.status(403).send("User with this e-mail cannot be found");
    } else {
      const user = getUserByEmail(newEmail, users)
      console.log(user);
      res.cookie('user_id', user.id);
      res.redirect("/urls");
    } 
  })

app.post("/logout", (req, res) => {
  const user = req.body.user;
  res.clearCookie('user_id', user)
  res.redirect('/urls'); 
})

app.get("/register", (req, res) => {
  const templateVars = { 
  user: users[req.cookies["user_id"]]
  };
  res.render('register', templateVars)
})


app.post('/register', (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  if (!newEmail || !newPassword) {
    res.status(400).send("E-mail and Password is invalid");
  } else if (getUserByEmail(newEmail, users)) {
    res.status(400).send("E-mail already exist");
  } else {
  const newId = generateRandomString();
  users[newId] = ({id: newId, email: newEmail, password: newPassword});
  console.log(users)
  res.cookie('user_id', users[newId].id);
  res.redirect('/urls')
  }
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
