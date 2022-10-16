/* eslint-disable max-len */

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// const express = require("express");
// const server = express();
// server.get("/some-data", (request, response) => {
//   response.send("Hello world");
// });


const express = require("express");
const cors = require("cors");

// Requiring routes
const authRoutes = require("./routes/auth.js");
const userRoutes = require("./routes/user.js");


const app = express();

const PORT = process.env.PORT || 5000;

// TO MAKE CROSS-ORIGIN REQUESTS
app.use(cors());
// TO PASS JSON DATA
app.use(express.json());
// TO ENCODE THE URL
app.use(express.urlencoded({extended: true}));

// Creating routes://
require("dotenv").config();

// GET route
app.get("/health", (req, res) =>{
  res.status(200).send("Site is online!");
});

// eslint-disable-next-line no-unused-vars
const server = {
  start: function() {
    return app.listen((err, req, res, next) => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  },
  stop: function() {
    app.removeAllListeners();
    process.send("SERVER STOPPED");
    process.disconnect();
    process.exit();
  },
};
// POST route
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.listen(PORT, (err, req, res, next) => {
      console.log(`Server is running on port ${PORT}`)
    }).on('error', (err)=>{
        console.log('got something', err)
    });

