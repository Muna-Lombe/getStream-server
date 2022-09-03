const { fork, exec, execFile, spawn } = require("child_process");

const child = fork(__dirname+"/server/index")
child.on('message', function(message){
  console.log('Returning /total results');
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(message);
})
