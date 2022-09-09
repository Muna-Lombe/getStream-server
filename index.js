
const { fork, exec, execFile, spawn } = require("child_process");
const fs = require('fs')



// SET UP TWO SERVERS, ONE INITIAL AND ANOTHER RESTARTED
// START THE SERVER AS A CHILD PROCESS AND LISTEN FOR ERRORS
function isFreshInstall(){
  console.log("is fresh install", !fs.existsSync(__dirname+'.env') && !fs.existsSync(process.cwd()+'.env'))
  return (!fs.existsSync(__dirname+'.env') && !fs.existsSync(process.cwd()+'.env'))
}

function restart_server(process){
  const initArgs = process.spawnargs[1]
  return fork(initArgs)
}
function update_server(processToRestart){
  console.log('updating cred with procfile...')
    const secondary = fork(__dirname+"/run_procfile")
    secondary.stdio=[0,'pipe','pipe']
    secondary.on('message', (message)=>{
      if(message === "ERROR"){
        console.log("error, what should I do now?")
        secondary.send("STOP")
      }
      if(message === "COMPLETE"){
        console.log("completed update, can now restart process")
        secondary.send("STOP")
      }
    }).on('disconnect', (msg)=>{
      console.log('update complete, restarting server', msg)
      // process = 
      processToRestart
    })
    secondary.send('START')
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
  process.on('disconnect', (err)=>{
    update_server(log_process(restart_server(process)))
  })
}
let childProcess = fork(__dirname+"/start_server")

if(isFreshInstall()){
  let streamKeys = `STREAM_APP_ID
STREAM_API_KEY
STREAM_API_SECRET
`
  fs.appendFileSync('./.env',streamKeys)
  // fs.truncateSync('./.env',0)
  update_server()
}
log_process(childProcess)


