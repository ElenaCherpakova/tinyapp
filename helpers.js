const bcrypt = require("bcryptjs");

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

//Match the given e-mail with the records
const getUserByEmail = (email, userDataBase) => {
  for (const userID in userDataBase) {
    const user = userDataBase[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

//check urls for users
const urlsForUser = function(userid, urlDatabase) {
  const newObjectDatabase = {};
  for (let obj in urlDatabase) {
    if (urlDatabase[obj].userID === userid) {
      newObjectDatabase[obj] = urlDatabase[obj];
    }
  }
  return newObjectDatabase;
};

//check email and password combination of a user
const checkEmailAndPass = (email, password, userDataBase) => {
  const user = getUserByEmail(email, userDataBase);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  return false;
};

module.exports = {
  urlsForUser,
  generateRandomString,
  getUserByEmail,
  checkEmailAndPass,
};
