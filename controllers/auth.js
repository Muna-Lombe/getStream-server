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
const {fork} = require("child_process");
const fs = require("fs");
const bcrypt = require("bcrypt");
const StreamChat = require("stream-chat").StreamChat;// Always remember to create an instance of streamchat by adding .StreamChat, like has been done.
const crypto = require("crypto");
// const process = require("node:process")
// credentials

require("dotenv").config();

const basepath = process.cwd();

// check for and return valid cred
const getValidCred = () =>{
  let api_key = process.env.STREAM_API_KEY;
  let api_secret = process.env.STREAM_API_SECRET;
  let app_id = process.env.STREAM_APP_ID;
  let stamp = process.env.TIMESTAMP;
  let {appid, key, secret, timestamp} = fs.existsSync(`${basepath}/utils/trial_extender/collected/app1.json`) ? 
                                        JSON.parse(fs.readFileSync(`${basepath}/utils/trial_extender/collected/app1.json`))
                                        : {appid:app_id, key:api_key, secret:api_secret, timestamp:stamp}
  let initCred, uptCred;
  initCred = {app_id, api_key, api_secret, timestamp:stamp};
  uptCred = {app_id:appid, api_key:key, api_secret:secret, timestamp};
  if(key === api_key) return initCred;
  return uptCred;
}

const clientActive = async ()=>{
  let d1 = new Date(Number.parseInt(getValidCred().timestamp));
  let d2 = new Date()
  const getDateDiffInDays = (a,b) => {

    return Math.floor((b - a) / (1000*60*60*24))
  }
  // return getDateDiffInDays(d1,d2) >=29 ? {expired: true} : StreamChat.getInstance(api_key, api_secret);
  return getDateDiffInDays(d1,d2) >=29
};



const client = StreamChat.getInstance(getValidCred().api_key, getValidCred().api_secret);
// error handling
const signup = async (req, res) =>{
  console.log("signing up");
  try {
    const isActive = await clientActive();
    if (isActive){
      console.log("client expr", client.expired);
      const expiredClient = new Error("Client is expired!");
      expiredClient.name = "ExpiredStreamClientError";
      throw expiredClient;
    }
    const {fullName, username, password, phoneNumber} = req.body;

    // random user ID using crypto
    const userId = crypto.randomBytes(16).toString("hex");

    // credentials
    const {api_key, api_secret, app_id} = getValidCred()
    // connection instance
    const serverClient = connect(api_key, api_secret, app_id);


    const hashedPassword = await bcrypt.hash(password, 10);

    const token = serverClient.createUserToken(userId);
    const user = await serverClient.user(userId).getOrCreate({fullName, username, gender: "binary", occupation: "Xenomorph"});
    res.status(200).json({token, fullName, username, userId, hashedPassword, phoneNumber});
  } catch (error) {
    console.log(error);
    console.log("Starting config update...");
    res.status(500).json({message: "Looks like something is wrong on our side, please try again..."});
  
    throw error;
  }
};


const login = async (req, res) =>{
  try {
    const isActive = await clientActive();
    if (isActive) {
      console.log("client expr", isActive);
      const expiredClient = new Error("Client is expired!");
      expiredClient.name = "ExpiredStreamClientError";
      console.log(api_key, api_secret)
      // return 0;
      throw expiredClient;
    }
    const {app_id, api_key, api_secret}=getValidCred()
    const {username, password} = req.body;
    console.log("logging creds before client init", api_key, api_secret, app_id, "\n--------------------\n")
    const serverClient = connect(api_key, api_secret, app_id);

    console.log("post client init", api_key,serverClient.apiKey, client.key, "\n--------------------\n")
    
    const getUsers = await client.queryUsers({name: username}).then((resp) => resp.users).catch((err)=> {
      console.log("getuser error", err);
      return {errCode: err.code || 1, message: err.message};
    });
    console.log("get users", getUsers);
    if (getUsers.errCode || getUsers.length < 1) return res.status(400).json({message: "User not found!"});

    const success = await bcrypt.compare(password, getUsers[0].hashedPassword); // .then((result)=> (console.log("password matched", password) && "resolved")).catch((err)=> false);
    const token = serverClient.createUserToken(getUsers[0].id);

    if (success) {
      const {permissions} = await client.listPermissions(); // List of Permission objects
      const {grants} = await client.getChannelType("messaging");
      
      res.status(200).json({token, fullName: getUsers[0].fullName, username: username, userId: getUsers[0].id, permissions: permissions || "no-perms", grants: grants});
    } else {
      
      res.status(400).json({message: "Incorrect Username or Password"});
    }
  } catch (error) {
    console.log("error with stream-client", error);
    res.status(500).json({message: "Looks like something is wrong on our side, please try again..."});
    
    throw error;
    
  }
};

const fetchauthor =async (req, res)=>{
  if (!getValidCred().api_key) return res.status(200).json({hash: "0"})
  const cryptyd = getValidCred().api_key;
  const salt = await bcrypt.genSalt(cryptyd.toString().length);
  const hash = await bcrypt.hash(cryptyd, salt);
  const pivot = crypto.randomInt(10,hash.toString().length)
  console.log("key", cryptyd)
  const encrypt =(hash, key, pivot)=>{
    // slice key
    const hash1 = hash.toString().slice(0, pivot);
    const hash2 = hash.toString().slice(pivot, hash.toString().length);
    const crypt = hash1+key+hash2+"!"+key.toString().length+hash1.slice(5,9)+(key.toString().length+pivot);
    return crypt;
  };
  console.log("hash:", encrypt(hash, cryptyd, pivot));
  return res.status(200).json({hash: encrypt(hash, cryptyd, pivot)});
};

const test = async (req, res) =>{
  setTimeout(() => {
    res.status(200).json({token: "TKO"});
  }, 3000);
};
module.exports = {signup, login, fetchauthor, test};
