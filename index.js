const express = require('express');
const cors =  require('cors');
const res = require('express/lib/response');
const { fork } = require('child_process');
//Requiring routes
const authRoutes = require('./routes/auth.js')
const inviteRoutes = require('./routes/invite.js')

const app = express();

const PORT = process.env.PORT || 5000;




require('dotenv').config();

// TO MAKE CROSS-ORIGIN REQUESTS
app.use(cors());
// TO PASS JSON DATA
app.use(express.json());
// TO ENCODE THE URL
app.use(express.urlencoded());

// Creating routes://

//GET route
app.get('/',(req, res) =>{
    res.send('Hello, world!');
});

//POST route
app.use('/auth', authRoutes);
app.use('/invite', inviteRoutes)
// app.use((err, req, res) => {
//     if (! err) {
//         return next();
//     }
//     // const child = fork(__dirname + '/Procfile.sh');
//     // child.stdio=[0,'pipe','pipe']
//     // child.on('message', (message) => {
//     //     if(message === 'ERROR'){
//     //         console.log('child process broke');
//     //         res.writeHead(200);
//     //         res.end(message);
//     //         child.send('STOP');
//     //         console.log("talking to doctor....")
//     //         process.exit(1)
//     //     }
//     // })
//     console.log('there is a big error')
//     res.status(500);
//     res.send('500: Internal server error');
// });
//checking routes
// console.log('app routes:',app._router)

// Server status
app.listen(PORT, (err, req, res, next) => {
    console.log(`Server is running on port ${PORT}`)
}).on('error', (err)=>{
    console.log('got something', err)
    if(err.name === "ExpiredStreamClientError"){
        console.log("expired client detected")
        // const child = fork(__dirname + '/Procfile.sh');
//     // child.stdio=[0,'pipe','pipe']
//     // child.on('message', (message) => {
//     //     if(message === 'ERROR'){
//     //         console.log('child process broke');
//     //         res.writeHead(200);
//     //         res.end(message);
//     //         child.send('STOP');
//     //         console.log("talking to doctor....")
//     //         process.exit(1)
//     //     }
//     // })

    }
});

