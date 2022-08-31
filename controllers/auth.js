const { connect } = require("getstream");

const bcrypt = require("bcrypt");
const StreamChat = require("stream-chat").StreamChat;//Always remember to create an instance of streamchat by adding .StreamChat, like has been done.
const crypto = require("crypto");

//credentials

require('dotenv').config();
const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;
const app_id = process.env.STREAM_APP_ID;

const signup = async (req,res) =>{
    try {
        
        const {fullName, username, password, phoneNumber} = req.body

        //random user ID using crypto
        const userId = crypto.randomBytes(16).toString('hex');
        
        //connection instance
        const serverClient = connect(api_key, api_secret, app_id);
    

        const hashedPassword = await bcrypt.hash(password,10);

        const token = serverClient.createUserToken(userId);
        
        res.status(200).json({token, fullName, username,userId, hashedPassword, phoneNumber});

    } catch (error) {
        console.log(error)
        res.status(500).json({message: error});
        
    }
};


const login = async (req,res) =>{
    const {username, password} = req.body;

    const serverClient = connect(api_key, api_secret, app_id);

    const client = StreamChat.getInstance(api_key, api_secret);
    const { users } = await client.queryUsers({name: username});
    
    try {

        if(!users.length) return res.status(400).json({message: "User not found!"});

        const success = await bcrypt.compare(password, users[0].hashedPassword)

        const token = serverClient.createUserToken(users[0].id);

        if(success){
            const { permissions } = await client.listPermissions(); // List of Permission objects
                const { grants } = await client.getChannelType("messaging"); 
            //  console.log(permissions);
            res.status(200).json({token, fullName: users[0].fullName, username: username, userId: users[0].id, permissions: permissions || "no-perms", grants: grants});
        }else{
            console.log('res: ',res)
            res.status(500).json({message: "Incorrect Username or Password"})

        }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
        
    }
};

const fetchauthor =async (req,res)=>{
    const pivot = 5;
    const cryptyd = api_key;
    const salt = await bcrypt.genSalt(cryptyd.toString().length)
    const hash = await bcrypt.hash(cryptyd, salt)
    const encrypt =(hash,key, pivot)=>{
        //slice key
        let hash1 = hash.toString().slice(0,pivot);
        let hash2 = hash.toString().slice(pivot,hash.toString().length)
        let crypt = hash1+key+hash2+"!"+pivot+"#"+key.toString().length
        return crypt
    }
    console.log("hash:",encrypt(hash,cryptyd, pivot))
    return res.status(200).json({hash:encrypt(hash,cryptyd, pivot)})
    
}

module.exports = {signup,login, fetchauthor};