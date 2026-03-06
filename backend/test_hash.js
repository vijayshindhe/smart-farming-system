const bcrypt = require("bcrypt");
console.log("Starting hash");
bcrypt.hash("password", 10).then(res => console.log("Hashed:", res)).catch(err => console.error(err));
