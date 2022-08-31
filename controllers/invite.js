const { connect } = require("getstream");

const bcrypt = require("bcrypt");
const StreamChat = require("stream-chat").StreamChat;//Always remember to create an instance of streamchat by adding .StreamChat, like has been done.
const crypto = require("crypto");

//credentials

require('dotenv').config();
const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;
const app_id = process.env.STREAM_APP_ID;

const invite = async (req,res) =>{
    const client = StreamChat.getInstance(api_key, api_secret);
    try {
        
        const {receiverID,type, text} = req.body
        console.log('req body:', req.body)
        // sending invite request to user
        const sndInv = await client.sendUserCustomEvent(receiverID, { 
            type: type, 
            text: text 
        }); 
        const rec = client.queryUsers({id: receiverID}) 
        // request result
        console.log('req res: ', sndInv)
        res.status(200).json({res: sndInv});

    } catch (error) {
        console.log(error)
        res.status(500).json({message: error});
        
        }
};


module.exports = {invite};