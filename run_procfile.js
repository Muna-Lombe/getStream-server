const { execFile, exec, execFileSync } = require('child_process');
function grant_rights(){
  exec('chmod u+x Procfile.sh', (error, stdout, stderr) => {
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
}
function exec_proc(){
  let complete = ""
  
 let proc =  execFileSync(__dirname + '/Procfile.sh',['cleanSlate'], (error, stdout, stderr) => {
        console.log("rights granted, executing file...")

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
      return "complete"
    }

process.stdio=[0,'pipe','pipe']
process.on('message', (message) => {
  if (message == 'START') {
    try {
      console.log('Secondary process received START message');
      console.log("granting rights exec file...")
      grant_rights()
      
      exec_proc()
      let message = 'COMPLETE';
      process.send(message);
      process.on('unhandledRejection',(err)=>{
        console.log('caught unhandled rejection in secondary process', err)
        if(err.name === "ExpiredStreamClientError"){
          process.send('ERROR')
        }
        process.send('ERROR')
      })

    } catch (error) {
      console.log('logged error in secondary process, !', error)
      process.send('ERROR')
    }
  }
  if(message === 'STOP'){
    console.log('Secondary process recieved STOP message, stopping...')
    process.disconnect()
    process.exit()
  }
})
