const generateRandomString = function() {
  const math = Math.random().toString(36).substr(2, 6);
  console.log(math);

};

generateRandomString();