const express = require('express');
const cors =  require('cors');
const res = require('express/lib/response');

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
//checking routes
// console.log('app routes:',app._router)

// Server status
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));