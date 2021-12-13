const bcrypt = require("bcryptjs");

const generateRandomString = function () {
  return Math.random().toString(36).substr(2, 6);
};

//Match the given e-mail with the records
const getUserByEmail = function (email, userDataBase) {
  for (const userID in userDataBase) {
    const user = userDataBase[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

//check email and password combination of a user
const checkEmailAndPass = function (email, password, userDataBase) {
  const user = getUserByEmail(email, userDataBase);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  return false;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  checkEmailAndPass,
};
