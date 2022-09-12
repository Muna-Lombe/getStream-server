/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
/* eslint-disable camelcase */
const {execFile, exec, execFileSync, execSync} = require("child_process");
// eslint-disable-next-line require-jsdoc
function grant_rights() {
  console.log("granting rights exec file...");
  execSync("chmod u+x Procfile.sh", (error, stdout, stderr) => {
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
async function execUpdate() {
  const args = process.argv[2];
  console.log("run_profile path", __dirname);
  console.log("updating getStream config...");
  const proc = execFile(__dirname + "/Procfile.sh", [args], (error, stdout, stderr) => {
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
  proc.stdio = [0, "pipe", "pipe"];
  proc.stdout.on("data", (data)=>{
    console.log("received data", data);
  });
  proc.stdout.on("error", (data)=>{
    console.log("received error", data);
  });
  proc.stdout.on("close", (data)=>{
    console.log("received close", data);
  });
  proc.stdout.on("pause", (data)=>{
    console.log("received pause", data);
  });
  proc.stderr.on("data", (data)=>{
    console.log("received data", data);
  });
  proc.stderr.on("error", (data)=>{
    console.log("received error", data);
  });
  proc.on("message", (msg)=>{
    console.log("received msg", msg);
  });
  proc.on("error", (msg)=>{
    console.log("received msg", msg);
  });
  proc.on("close", (msg)=>{
    console.log("received msg", msg);
  });
  proc.on("disconnect", (msg)=>{
    console.log("getStream config updated!");
    return "complete";
  });
}

process.stdio=[0, "pipe", "pipe"];
process.on("message", async (message) => {
  if (message == "START") {
    try {
      console.log("Secondary process received START message");
      grant_rights();
      await execUpdate().then((result)=>{
        console.log("received result", result);
        if (result === "complete") {
          console.log("update complete, getStream config updated!");
          const message = "COMPLETE";
          process.send(message);
        }
      }).catch((err)=>{
        console.log("error happend in", err);
      });
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
