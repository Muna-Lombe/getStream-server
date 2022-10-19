/* eslint-disable no-undef */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
/* eslint-disable camelcase */
const {execFile, exec, execFileSync, execSync} = require("child_process");
// const process = require("node:process");
const { exit } = require("process");
// eslint-disable-next-line require-jsdoc
function grant_rights(pathToFile) {
  console.log("granting rights exec file...", process.cwd());
  execSync(`chmod u+x ${pathToFile}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`stderr:`, stderr);
      return;
    }

    console.log(`stdout:\n${stdout}`);
  });
  console.log("rights granted, executing file...");
}
 function execUpdate() {
  const args = process.argv[2];
  console.log("run_profile path", __dirname);
  console.log("updating getStream config...");
  let completionStatus = "not complete";
  let pipe = [0, "pipe", "pipe"];
  // execFileSync()
  return execFileSync(__dirname + "/setup.sh", [args],{stdio:pipe})//,  (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`error: ${error.message}`);
  //     // return;
  //   }

  //   if (stderr) {
  //     console.error(`stderr: ${stderr}`);
  //     let errStr = "GetOrCreateChannel failed with error:"
  //     if(stderr.includes(errStr)){
  //       // updateProcess.send("update done")
  //       console.log("update completed, should exit proc process now")
  //       // exit()
  //       // return "completed"
  //       updateProcess.emit('exit')
  //     }
  //     // return;
  //   }
  //   console.log(`stdout:\n${stdout}`);
  // });
  
  
}

process.stdio=[0, "pipe", "pipe"];
process.on("message", async (message) => {
  if (message == "START") {
    try {
      console.log("Updater process received START message");
      grant_rights(`${process.cwd()}/build/setup.sh`);
      // await execUpdate().then((result)=>{
      //   console.log("received result", result);
      //   if (result === "complete") {
      //     console.log("update complete, getStream config updated!");
      //     const message = "COMPLETE";
      //     process.send(message);
      //   }
      // }).catch((err)=>{
      //   console.log("error happend in", err);
      // });
      // let updateProcess = execUpdate();
      // updateProcess.stdio = [0, "pipe", "pipe"];
      // updateProcess.stdout.on("data", (data)=>{
      //   console.log("received data", data);
      // });
      // updateProcess.stdout.on("error", (data)=>{
      //   console.log("received error", data);
      // });
      // updateProcess.stdout.on("close", (data)=>{
      //   console.log("received close", data);
      //   // updateProcess.disconnect();
      //   // updateProcess.send("update done")
      //   console.log("returning completed")
      //   // return "completed";
      // });
      // updateProcess.stdout.on("pause", (data)=>{
      //   console.log("received pause", data);
      // });
      // updateProcess.stderr.on("data", (data)=>{
      //   console.log("received data", data);
      // });
      // updateProcess.stderr.on("error", (data)=>{
      //   console.log("received error", data);
      // });
      // updateProcess.on("message", (msg)=>{
      //   console.log("received message-msg", msg);
      // });
      // updateProcess.on("error", (msg)=>{
      //   console.log("received error-msg", msg);
      // });
      // updateProcess.on("close", (msg)=>{
      //   console.log("received close-msg", msg);
        
      // });
      // updateProcess.on("disconnect", (msg)=>{
      //   console.log("getStream config updated!");
      //   completionStatus ="complete";
        
      // });
      // updateProcess.on("exit", (msg)=>{
      //   console.log("received exit-msg", msg);
        
      // })
      execUpdate();
      console.log("------------- Proc Process Complete!! ------------");
      process.send("COMPLETE");
  // return completionStatus;
      // console.log("update Status", updateStatus)
      process.on("unhandledRejection", (err)=>{
        console.log("caught unhandled rejection in updater process", err);
        if (err.name === "ExpiredStreamClientError") {
          process.send("ExpiredStreamClientError");
        }
        process.send("ERROR");
      });
    } catch (error) {
      console.log("logged error in updater process, !", error);
      process.send("ERROR");
    }
  }
  if (message === "STOP") {
    console.log("Updater process recieved STOP message, stopping...");
    process.disconnect();
    process.exit();
  }
});
module.exports={grant_rights}