
const process = require("node:process");
const fs = require("fs");

function isFreshInstall() {
  console.log(process.cwd());
  console.log("is fresh install", !fs.existsSync(process.cwd()+"/.env"));
  if (!fs.existsSync(process.cwd()+"/.env")) {
    let stamp = new Date("Jun 12 2022").valueOf();
    const streamKeys = "STREAM_APP_ID=1160285\nSTREAM_API_KEY=8tpzrxya45e2\nSTREAM_API_SECRET=2s6db45p654pasyzjk5btwda2ayqqhzyvdvjprepm6q9yvmw6wm4myvj6bxsetwn\nTIMESTAMP="+stamp;
    fs.appendFileSync("./.env", streamKeys);
    // fs.truncateSync('./.env',0)
    return isFreshInstall();
  }
  return false;
}
isFreshInstall();