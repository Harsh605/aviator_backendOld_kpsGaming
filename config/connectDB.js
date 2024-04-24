const mysql = require("mysql2/promise");

const connection = mysql.createPool({
  host: "localhost",
  user: "harsh",
  password: "Harsh@123",
  database: "daman",
});
// "start": "pm2 start src/server.js"
//console.log("===== DataBase is Connected Succesfully======");

module.exports = connection;
