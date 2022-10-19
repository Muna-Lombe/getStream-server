/* eslint-disable no-undef */
/* eslint-disable max-len */
const express = require("express");
const cors = require("cors");
// const process = require("node:process");
// const basepath = process.cwd();

// Requiring routes
const authRoutes = require("../routes/auth.js");
const userRoutes = require("../routes/user.js");


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

// POST route
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
const server = {
  start: function() {
    return app.listen(PORT,() => {
      console.log(`Server is running on port ${PORT}`);
    })
  },
  stop: async function() {
    app.removeAllListeners();
    process.send("SERVER STOPPED");
    process.disconnect();
    process.exit();
    
  },
};


process.on("message", (message) => {
  if (message == "START") {
    try {
      console.log("Primary process received START message");
      server.start()
      process.send("server started");
      process.on("unhandledRejection", (err)=>{
        console.log("caught unhandled rejection in primary process", err);
        if (err.name === "ExpiredStreamClientError") {
          process.send(err.name);
        }
      });
    } catch (error) {
      console.log("logged error in primary process,", error);
      process.send("ERROR");
    }
  }
  if (message === "STOP") {
    console.log("received STOP message from parent process, stopping server...");
    server.stop();
  }
});