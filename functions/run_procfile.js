/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
/* eslint-disable camelcase */
const {execFile, exec, execFileSync} = require("child_process");
// eslint-disable-next-line require-jsdoc
function grant_rights() {
  console.log("granting rights exec file...");
  exec("chmod u+x Procfile.sh", (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
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
  execFileSync(__dirname + "/Procfile.sh", [args], {}, (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout:\n${stdout}`);
  });
  console.log("getStream config updated!");
  return "complete";
}

process.stdio=[0, "pipe", "pipe"];
process.on("message", (message) => {
  if (message == "START") {
    try {
      console.log("Secondary process received START message");
      grant_rights();
      execUpdate();
      const message = "COMPLETE";
      process.send(message);
      process.on("unhandledRejection", (err)=>{
        console.log("caught unhandled rejection in secondary process", err);
        if (err.name === "ExpiredStreamClientError") {
          process.send("ExpiredStreamClientError");
        }
        process.send("ERROR");
      });
    } catch (error) {
      console.log("logged error in secondary process, !", error);
      process.send("ERROR");
    }
  }
  if (message === "STOP") {
    console.log("Secondary process recieved STOP message, stopping...");
    process.disconnect();
    process.exit();
  }
});
