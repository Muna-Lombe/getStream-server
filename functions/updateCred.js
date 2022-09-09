const {fork} = require("child_process");
const fs = require("fs");
console.log(__dirname);
/**
 *
 */
class GetStreamServer {
  // SET UP TWO SERVERS, ONE INITIAL AND ANOTHER RESTARTED
  // START THE SERVER AS A CHILD PROCESS AND LISTEN FOR ERRORS
  // eslint-disable-next-line valid-jsdoc
  /**
   *
   */
  constructor() {
    this.handle="";
  }
  // eslint-disable-next-line valid-jsdoc
  /**
   *
   * @returns
   */
  isFreshInstall() {
    console.log("is fresh install", !fs.existsSync(__dirname+"/.env"));
    return !fs.existsSync(__dirname+"/.env");
  }

  // eslint-disable-next-line valid-jsdoc
  /**
   *
   * @param {*} process
   * @returns
   */
  restartServer(process) {
    const initArgs = process.spawnargs[1];
    return fork(initArgs);
  }
  /**
   *
   * @param {*} processToRestart
   */
  updateServer(processToRestart) {
    console.log("updating cred with procfile...");
    const secondary = fork(__dirname+"/run_procfile");
    secondary.stdio=[0, "pipe", "pipe"];
    secondary.on("message", (message)=>{
      if (message === "ERROR") {
        console.log("error, what should I do now?");
        secondary.send("STOP");
      }
      if (message === "COMPLETE") {
        console.log("completed update, can now restart process");
        secondary.send("STOP");
      }
    }).on("disconnect", (msg)=>{
      console.log("update complete, restarting server", msg);
      // process =
      processToRestart;
    });
    secondary.send("START");
  }

  /**
   *
   * @param {*} process
   */
  logProcess(process) {
    console.log("args", process.spawnargs);
    process.stdio=[0, "pipe", "pipe"];
    process.on("message", (message, handler) => {
      console.log("message", message, handler);
      if ( message === "server object" ) {
        console.log("new message:", typeof message);

        // exports.app = functions.https.onRequest(handler);
      }
      if (message === "ExpiredStreamClientError") {
        console.log("error:", message, ", disconnecting to reset...");
        process.send("STOP");
      }
      if (message === "SERVER STOPPED") {
        console.log("message:", message, ", restarting...");
      }
    });
    process.send("START");
    process.on("disconnect", (err)=> {
      console.log("primary disconnected");
      this.updateServer(this.logProcess(this.restartServer(process)));
    });
  }
  /**
   *
   */
  start() {
    // const process = fork(__dirname+"/start_server");
    if (this.isFreshInstall()) {
      const streamKeys = "STREAM_APP_ID\nSTREAM_API_KEY\nSTREAM_API_SECRET";
      fs.appendFileSync("./.env", streamKeys);
      // fs.truncateSync('./.env',0)
      this.updateServer();
    }
    this.logProcess(fork(__dirname+"/start_server"));
  }
}

const newServer = new GetStreamServer();
newServer.start();
