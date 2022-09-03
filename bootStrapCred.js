const { fork, exec, execFile, spawn } = require("child_process");

execFile(__dirname+"/server/trial_extender/non.js", (error, stdout, stderr) => {
  if (error) {
    console.error(`error: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }

  console.log(`stdout:\n${stdout}`);
})