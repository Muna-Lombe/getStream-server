const http = require('http');
const { fork } = require('child_process');

const host = 'localhost';
const port = 8000;


const requestListener = function (req, res) {
  if (req.url === '/total') {
    const child = fork(__dirname + '/getCount');
    child.stdio=[0,'pipe','pipe']
    child.on('message', (message) => {
      if(message === 'ERROR'){
        console.log('child process broke');
        res.writeHead(200);
        res.end(message);
        child.send('STOP');
        console.log("talking to doctor....")
        process.exit(1)
        
      }
      console.log('Returning /total results');
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(message);
      // res.setHeader('Content-Type', 'application/json');
      // res.writeHead(500);
      // res.end(error);
    })
    // .on('error', function(error){
    //  
    // })

    child.send('START');
  } else if (req.url === '/hello') {
    console.log('Returning /hello results');
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(`{"message":"hello"}`);
  }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});