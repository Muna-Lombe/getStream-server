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
const functions = require("firebase-functions");

// const {fork} = require("child_process");
// const fs = require("fs");
// console.log(__dirname);
// /**
//  *
//  */
// class GetStreamServer {
//   // SET UP TWO SERVERS, ONE INITIAL AND ANOTHER RESTARTED
//   // START THE SERVER AS A CHILD PROCESS AND LISTEN FOR ERRORS
//   // eslint-disable-next-line valid-jsdoc
//   /**
//    *
//    */
//   constructor() {
//     this.handle="";
//   }
//   // eslint-disable-next-line valid-jsdoc
//   /**
//    *
//    * @returns
//    */
//   isFreshInstall() {
//     console.log("is fresh install", !fs.existsSync(__dirname+"/.env"));
//     return !fs.existsSync(__dirname+"/.env");
//   }

//   // eslint-disable-next-line valid-jsdoc
//   /**
//    *
//    * @param {*} process
//    * @returns
//    */
//   restartServer(process) {
//     const initArgs = process.spawnargs[1];
//     return fork(initArgs);
//   }
//   /**
//    *
//    * @param {*} processToRestart
//    */
//   updateServer(processToRestart) {
//     console.log("updating cred with procfile...");
//     const secondary = fork(__dirname+"/run_procfile");
//     secondary.stdio=[0, "pipe", "pipe"];
//     secondary.on("message", (message)=>{
//       if (message === "ERROR") {
//         console.log("error, what should I do now?");
//         secondary.send("STOP");
//       }
//       if (message === "COMPLETE") {
//         console.log("completed update, can now restart process");
//         secondary.send("STOP");
//       }
//     }).on("disconnect", (msg)=>{
//       console.log("update complete, restarting server", msg);
//       // process =
//       processToRestart;
//     });
//     secondary.send("START");
//   }

//   /**
//    *
//    * @param {*} process
//    */
//   logProcess(process) {
//     console.log("args", process.spawnargs);
//     process.stdio=[0, "pipe", "pipe"];
//     process.on("message", (message, handler) => {
//       console.log("message", message, handler);
//       if ( message === "server object" ) {
//         console.log("new message:", typeof message);

//         // exports.app = functions.https.onRequest(handler);
//       }
//       if (message === "ExpiredStreamClientError") {
//         console.log("error:", message, ", disconnecting to reset...");
//         process.send("STOP");
//       }
//       if (message === "SERVER STOPPED") {
//         console.log("message:", message, ", restarting...");
//       }
//     });
//     process.send("START");
//     process.on("disconnect", (err)=> {
//       console.log("primary disconnected");
//       this.updateServer(this.logProcess(this.restartServer(process)));
//     });
//   }
//   /**
//    *
//    */
//   start() {
//     // const process = fork(__dirname+"/start_server");
//     if (this.isFreshInstall()) {
//       const streamKeys = "STREAM_APP_ID\nSTREAM_API_KEY\nSTREAM_API_SECRET";
//       fs.appendFileSync("./.env", streamKeys);
//       // fs.truncateSync('./.env',0)
//       this.updateServer();
//     }
//     this.logProcess(fork(__dirname+"/start_server"));
//   }
// }

// const newServer = new GetStreamServer();
// newServer.start();
const express = require("express");
const cors = require("cors");
// const functions = require("firebase-functions");

// Requiring routes
const authRoutes = require("./routes/auth.js");
const inviteRoutes = require("./routes/invite.js");

const app = express();

// const PORT = process.env.PORT || 5000;

// TO MAKE CROSS-ORIGIN REQUESTS
app.use(cors());
// TO PASS JSON DATA
app.use(express.json());
// TO ENCODE THE URL
app.use(express.urlencoded());

// Creating routes://
require("dotenv").config();

// GET route
app.get("/", (req, res) =>{
  res.send("Hello, world!");
});

const server = {
  start: function() {
    return app.listen((err, req, res, next) => {
      console.log(`Server is running on port ${process.env.PORT}`);
    }).on("error", (err)=>{
      console.log("got something", err);
      server.stop();
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
app.use("/auth", authRoutes, (req, res)=>{
  console.log("status", res.status);
  server.stop();
});
app.use("/invite", inviteRoutes);

// process.on("message", (message) => {
//   if (message == "START") {
//     try {
//       console.log("Primary process received START message");

//       // server.start();
//       // functions.https.onRequest(server.start());

//       // const message = "server started...";
//       // process.send(message);

//       process.send("server object", server.start());
//       process.send(message);
//       process.on("unhandledRejection", (err)=>{
//         console.log("caught unhandled rejection in primary process", err);
//         if (err.name === "ExpiredStreamClientError") {
//           process.send(err.name);
//         }
//       });
//     } catch (error) {
//       console.log("logged error in primary process,", error);
//       process.send("ERROR");
//     }
//   }
//   if (message === "STOP") {
//     console.log("received STOP message from parent process, stopping server...");
//     server.stop();
//   }
// });
exports.app = functions.https.onRequest(app);
