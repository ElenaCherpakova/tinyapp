const bcrypt = require('bcryptjs');

const generateRandomString = function () {
  return Math.random().toString(36).substr(2, 6);
};

const getUserByEmail = function(email, userDataBase) {
  for (const user in userDataBase) {
    if (userDataBase[user].email === email) {
      return userDataBase[user];
    }
  }
  return null;
}

const urslForUser = (urlDatabase, id) => {
  return Object.fromEntries(Object.entries(urlDatabase).filter(url => url[1].userID === id));
};

const checkEmailAndPass = function(email, password, userDataBase) {
  for (const user in userDataBase) {
    if (userDataBase[user].email === email &&  bcrypt.compareSync(password, userDataBase[user].password)) {
      return true;
    }
  }
  return false;
}


module.exports = { generateRandomString, getUserByEmail, urslForUser, checkEmailAndPass };