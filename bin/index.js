/* eslint-disable no-unreachable */
// /* eslint-disable max-len */

// const express = require("express");
// const cors = require("cors");
// const process = require("node:process");

// // Requiring routes
// const authRoutes = require("../routes/auth.js");
// const userRoutes = require("../routes/user.js");


// const app = express();

// const PORT = process.env.PORT || 5000;

// // TO MAKE CROSS-ORIGIN REQUESTS
// app.use(cors());
// // TO PASS JSON DATA
// app.use(express.json());
// // TO ENCODE THE URL
// app.use(express.urlencoded({extended: true}));

// // Creating routes://

// require("dotenv").config();

// // GET route
// app.get("/health", (req, res) =>{
//   res.status(200).send("Site is online!");
// });

// // eslint-disable-next-line no-unused-vars
// const server = {
//   start: function() {
//     return app.listen(() => {
//       console.log(`Server is running on port ${process.env.PORT}`);
//     });
//   },
//   stop: function() {
//     app.removeAllListeners();
//     process.send("SERVER STOPPED");
//     process.disconnect();
//     process.exit();
//   },
// };
// // POST route
// app.use("/auth", authRoutes);
// app.use("/user", userRoutes);
// app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`)
//     }).on('error', (err)=>{
//         console.log('got something', err)
//     });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const { fork } = require("child_process");
// const isFreshInstall = require("checkEnvExist.js")
// isFreshInstall
const process = require("node:process");
const { isFreshInstall } = require("../utils/checkEnvExist");
// const { server } = require("../utils/start_server");
const basepath = process.cwd();
// server
// SET UP TWO SERVERS, ONE INITIAL AND ANOTHER RESTARTED
// START THE SERVER AS A CHILD PROCESS AND LISTEN FOR ERRORS

function restart_server(process){
  const initArgs = process.spawnargs[1]
  return fork(initArgs)
}
function update_server(processToRestart){
  console.log('updating cred with procfile...')
    // const secondary = fork(basepath+"/build/run_procfile.js",)
    // secondary.stdio=[0,'pipe','pipe']
    // secondary.on('message', (message)=>{
    //   if(message === "ERROR"){
    //     console.log("error, what should I do now?")
    //     secondary.send("STOP")
    //   }
    //   if(message === "COMPLETE"){
    //     console.log("completed update, can now restart process")
    //     secondary.send("STOP")
    //   }
    // }).on('disconnect', (msg)=>{
    //   console.log('update complete, restarting server', msg)
    //   // process = 
    //   processToRestart
    // })
    // secondary.send('START')
    ////////////////////////////
    return 0;
  const child_process=fork(process.cwd()+"/build/run_procfile.js", (['cleanSlate']));
  console.log("args", child_process.spawnargs);
  child_process.stdio=[0, "pipe", "pipe"];
  child_process.on("message", (message) => {
    console.log("message", message);
    if ( message === "COMPLETE" ) {
      console.log("return to server process...");
      child_process.send("STOP");
    }
    if (message === "ExpiredStreamClientError") {
      console.log("error:", message, ", disconnecting to reset...");
      child_process.send("STOP");
    }
    if (message === "SERVER STOPPED") {
      console.log("message:", message, ", restarting...");
    }
  });
  child_process.send("START");
  child_process.on("disconnect", ()=> {
    console.log("child process disconnected");
    processToRestart
  });
}

function log_process(process){
  console.log("args",process.spawnargs)
  process.stdio=[0,'pipe','pipe']
  process.on('message', (message) => {
    console.log('message', message)
    if(message === "ExpiredStreamClientError"){
      console.log("error:", message, ", disconnecting to reset...")
      process.send('STOP')
    }
    if(message === "SERVER STOPPED"){
      console.log("message:", message, ", restarting...")
      // process.send('START')
      // process.kill(process.pid)
    }
  })


  process.send('START');
  process.on('disconnect', ()=>{
    update_server(log_process(restart_server(process)))
  })
}
isFreshInstall()
let serverProcess = fork(basepath+"/utils/start_server")
log_process(serverProcess)