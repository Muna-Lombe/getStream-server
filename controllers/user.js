/* eslint-disable no-undef */

/* eslint-disable no-prototype-builtins */
/* eslint-disable require-jsdoc */
/* eslint-disable valid-typeof */
/* eslint-disable no-useless-catch */
/* eslint-disable no-extend-native */
/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable valid-jsdoc */

const {connect} = require("getstream");
const bcrypt = require("bcrypt");
const StreamChat = require("stream-chat").StreamChat;// Always remember to create an instance of streamchat by adding .StreamChat, like has been done.
const crypto = require("crypto");
// credentials

require("dotenv").config();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;
const app_id = process.env.STREAM_APP_ID;



const client = StreamChat.getInstance(api_key, api_secret);

const create =()=>{

};

const read =()=> {

};

const update=async (req, res)=>{
  try {
    const {id, set} = req.body;
    // const client = StreamChat.getInstance(api_key, api_secret);

    const userToUpdate = await client.queryUsers({id: id})
        .then((resp) => resp.users).catch((err)=> {
          console.log("getuser error", err);
          return {errCode: err.code, message: err.message};
        });
    console.log("get users", userToUpdate);
    if (userToUpdate.errCode || userToUpdate.length < 1) return res.status(400).json({message: "User not found!"});

    const updatedUser = await client.partialUpdateUser({id: id, set: set})
        .then((res) => res)
        .catch((err) =>{
          return {error: 1};
        });// await
    // const token = serverClient.createUserToken(userToUpdate[0].id);

    if (!updatedUser.error) {
      const {permissions} = await client.listPermissions(); // List of Permission objects
      const {grants} = await client.getChannelType("messaging");
      //  console.log(permissions);
      res.status(200).json({...updatedUser});
    } else {
      // console.log("res: ", res);
      console.log("user updated error", updatedUser);
      res.status(400).json({message: "Could not update user information, try again in a minute."});
    }
  } catch (error) {
    console.log("update server error", error);
    res.status(500).json({message: "Looks like something is wrong on our side, please try again..."});
  }
};

const remove=()=>{

};

module.exports = {create, read, update, remove};
