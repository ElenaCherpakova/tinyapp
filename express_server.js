const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const { request } = require("express");
const cookieSession = require("cookie-session");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const { generateRandomString, getUserByEmail, urslForUser, checkEmailAndPass } = require('./helpers')

const bcrypt = require('bcryptjs');
const password = "purple-monkey-dinosaur"; 
const hashedPassword = bcrypt.hashSync(password, 10);

app.use(cookieSession({
  name: 'session',
  keys: ['Elena14']
}))


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



const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};


app.get("/urls", (req, res) => {
  const user_id = req.session["user_id"];
  const user = users[user_id];
  const templateVars = { urls: urslForUser(urlDatabase, user_id), user: user };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const user_id = req.session["user_id"];
  if (!user_id) {
    res.redirect('/login')
  }
  const user = users[user_id];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session["user_id"];
  const user = users[user_id];
  const { longURL } = urlDatabase[req.params.shortURL] || {};
  if (!longURL) {
    return res.status(404).send(`<h1 style="text-align: center; color:red">Error: 404 Page is not found</h1>`)
    // return res.redirect("/urls") 
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL,
    user: user
  };
  res.render("urls_show", templateVars);
});


  app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  });



app.get("/", (req, res) => {
  res.send("/register");
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
  if (!req.session.user_id) {
    return res.status(404).send("Need to Login to create/modify a TinyAppURL")
  }
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  console.log(req.body)
  urlDatabase[shortURL] = { longURL, userID:req.session.user_id };

  res.redirect(`/urls/${shortURL}`); 
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session["user_id"];
  const shortURL = req.params.shortURL;
  if (shortURL in urlDatabase) {
    if (userID === urlDatabase[shortURL].userID) {
      delete urlDatabase[shortURL];
      res.redirect('/urls/'); 
    }
  }
  res.send("<h4>You are not autorized to delete it</h4>") 
});


app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL ;
  urlDatabase[shortURL] = { longURL: req.body.newURL, userID: req.session.user_id }
  res.redirect('/urls/'); 
});



app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.session["user_id"]]
    };
    res.render('login', templateVars)
});


app.post("/login", (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;
    if (!checkEmailAndPass(newEmail, newPassword, users)) {
      res.status(403).send("User with this e-mail cannot be found");
    } else {
      const user = getUserByEmail(newEmail, users)
      req.session.user_id = user.id;
      res.redirect("/urls");
    } 
  })

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login'); 

})

app.get("/register", (req, res) => {
  const templateVars = { 
  user: users[req.session["user_id"]]
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
  users[newId] = ({ id: newId, email: newEmail, password: bcrypt.hashSync(newPassword, 10)});
  req.session.user_id = users[newId].id;
  res.redirect('/urls')
  }
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

