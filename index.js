require("dotenv").config();
const express = require("express");
const sequelize = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

const routes  = require('./api/routes')

// test database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log("Error: " + err);
  });

//middleware 
app.use(express.json());

// inport routes
app.use('/api', routes)


app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(PORT, (req, res) => {
  console.log(`server is listening at http://localhost:${PORT}`);
});
