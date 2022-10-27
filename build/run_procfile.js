/* eslint-disable no-undef */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
/* eslint-disable camelcase */
const {execFile, exec, execFileSync, execSync} = require("child_process");
const basepath = process.cwd();

// eslint-disable-next-line require-jsdoc
function grant_rights(pathToFile) {
  console.log("granting rights exec file...", basepath);
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
  console.log("run_profile path", basepath);
  console.log("updating getStream config...");
  let completionStatus = "not complete";
  let pipe = [0, 1, 2];
  // execFileSync()
  return execFileSync(basepath + "/build/setup.sh", [args],{stdio:pipe})
}

process.stdio=[0, "pipe", "pipe"];
process.on("message", async (message) => {
  if (message == "START") {
    try {
      console.log("Updater process received START message");
      grant_rights(`${process.cwd()}/build/setup.sh`);
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