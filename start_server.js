const express = require('express');
const cors =  require('cors');
const res = require('express/lib/response');

//Requiring routes
const authRoutes = require('./routes/auth.js')
const inviteRoutes = require('./routes/invite.js')

const app = express();

const PORT = process.env.PORT || 5000;

// TO MAKE CROSS-ORIGIN REQUESTS
app.use(cors());
// TO PASS JSON DATA
app.use(express.json());
// TO ENCODE THE URL
app.use(express.urlencoded());

// Creating routes://
require('dotenv').config();

//GET route
app.get('/',(req, res) =>{
    res.send('Hello, world!');
});

//POST route
app.use('/auth', authRoutes);
app.use('/invite', inviteRoutes)


const server = {
  start: function(){
    return app.listen(PORT, (err, req, res, next) => {
      console.log(`Server is running on port ${PORT}`)
    }).on('error', (err)=>{
        console.log('got something', err)
    });
  },
  stop: async function(){
    app.removeAllListeners()
    process.send("SERVER STOPPED")
    process.disconnect()
    process.exit()
  }
}



process.on('message', (message) => {
  if (message == 'START') {
    try {
      console.log('Primary process received START message');
      
      server.start()
      let message = `server started...`;
      process.send(message);
      process.on('unhandledRejection',(err)=>{
        console.log('caught unhandled rejection in primary process', err)
        if(err.name === "ExpiredStreamClientError"){
          process.send(err.name)
        }
      })

    } catch (error) {
      console.log('logged error in primary process,', error)
      process.send('ERROR')
    }
  }
  if(message === 'STOP'){
    console.log('received STOP message from parent process, stopping server...')
    server.stop()
  }
})

