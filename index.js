
const { fork, exec, execFile, spawn } = require("child_process");




// SET UP TWO SERVERS, ONE INITIAL AND ANOTHER RESTARTED
// START THE SERVER AS A CHILD PROCESS AND LISTEN FOR ERRORS

function restart_server(process){
  const initArgs = process.spawnargs[1]
  return fork(initArgs)
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
      log_process(restart_server(process))
    })
    secondary.send('START')
  })
}
let process = fork(__dirname+"/start_server")

log_process(process)


