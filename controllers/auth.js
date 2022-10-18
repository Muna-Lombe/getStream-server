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
const process = require("node:process")
// credentials

const dotenv = require("dotenv");

  let api_key = process.env.STREAM_API_KEY;
  let api_secret = process.env.STREAM_API_SECRET;
  let app_id = process.env.STREAM_APP_ID;
  let stamp = process.env.TIMESTAMP;

// let client;
const updateEnv = ()=> {
  const {appid, key, secret, timestamp} = fs.existsSync(process.cwd()+"/utils/trial_extender/collected/app1.json") ? 
                                JSON.parse(fs.readFileSync(process.cwd()+"/utils/trial_extender/collected/app1.json"))
                                : {appid:1,key:2,secret:3}
  
  // if(key.toString() !== process.env.STREAM_API_KEY.toString()){
    console.log("key match", key, api_key, key === api_key)
    api_key = process.env.STREAM_API_KEY= key;
    api_secret = process.env.STREAM_API_SECRET= secret;
    app_id = process.env.STREAM_APP_ID= appid
    stamp = process.env.TIMESTAMP= timestamp;

  // }
  console.log("\n......#######.....\n", appid, key, secret, timestamp,new Date(Number.parseInt(timestamp)),"\n......#######.....\n")
  console.log("\n......#######.....\n", app_id, api_key, api_secret, stamp,new Date(Number.parseInt(timestamp)),"\n......#######.....\n")
  console.log("\n......#######.....\n", process.env.STREAM_APP_ID, process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET, process.env.TIMESTAMP,new Date(Number.parseInt(timestamp)),"\n......#######.....\n")
   if(key.toString() === process.env.STREAM_API_KEY.toString()){
    return {appid, key, secret}
   }  
   return updateEnv()
}
const clientActive = async ()=>{
  dotenv.config();
  updateEnv();
  console.log("will connect to client with existing keys", stamp)
  console.log("key", api_key)

  let d1 = new Date(Number.parseInt(stamp));
  let d2 = new Date()
  const getDateDiffInDays = (a,b) => {

    return Math.floor((b - a) / (1000*60*60*24))
  }
  // return getDateDiffInDays(d1,d2) >=29 ? {expired: true} : StreamChat.getInstance(api_key, api_secret);
  return getDateDiffInDays(d1,d2) >=29
};


async function startUpdateProcessWith(args) {
  const child_process=fork(process.cwd()+"/build/run_procfile.js", (args && [args]));
  console.log("args", child_process.spawnargs);
  child_process.stdio=[0, "pipe", "pipe"];
  child_process.on("message", (message) => {
    console.log("message", message);
    if ( message === "COMPLETE" ) {
      console.log("return to server process...");
      child_process.send("STOP");
    }
    if (message === "ExpiredStreamClientError") {
      console.log("error:", message, ", disconnecting to reset...");
      child_process.send("STOP");
    }
    if (message === "SERVER STOPPED") {
      console.log("message:", message, ", restarting...");
    }
  });
  child_process.send("START");
  child_process.on("disconnect", (err)=> {
    console.log("child process disconnected");
  });
}

// error handling


const signup = async (req, res) =>{
  console.log("signing up");
  try {
    const client = await clientActive();
    if (client.expired) {
      console.log("client expr", client.expired);
      const expiredClient = new Error("Client is expired!");
      expiredClient.name = "ExpiredStreamClientError";
      throw expiredClient;
    }
    const {fullName, username, password, phoneNumber} = req.body;

    // random user ID using crypto
    const userId = crypto.randomBytes(16).toString("hex");

    // connection instance
    const serverClient = connect(api_key, api_secret, app_id);

    // console.log(serverClient)
    const hashedPassword = await bcrypt.hash(password, 10);

    const token = serverClient.createUserToken(userId);
    // const checkUsers = await client.queryUsers({name: username}).then(resp => resp.users).catch(err=> {return {code: err.code, message:err.message}});
    // console.log("users", checkUsers)
    // if(!checkUsers.users) return res.status(500).json({message: getUsers})
    const user = await serverClient.user(userId).getOrCreate({fullName, username, gender: "binary", occupation: "Xenomorph"});
    res.status(200).json({token, fullName, username, userId, hashedPassword, phoneNumber});
  } catch (error) {
    console.log(error);
    console.log("Starting config update...");
    res.status(500).json({message: "Looks like something is wrong on our side, please try again..."});
    if (error.name === "ExpiredStreamClientError") {
      await startUpdateProcessWith("cleanSlate");
    }
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
    const {appid, key, secret}=updateEnv()
    const {username, password} = req.body;
    console.log("logging creds before client init", api_key, api_secret, app_id, "\n--------------------\n")
    const serverClient = connect(key, secret, appid);

    const client = StreamChat.getInstance(key, secret);
    client.key=api_key;
    client.secret=api_secret;
    // client.createToken()
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
      //  console.log(permissions);
      res.status(200).json({token, fullName: getUsers[0].fullName, username: username, userId: getUsers[0].id, permissions: permissions || "no-perms", grants: grants});
    } else {
      // console.log("res: ", res);
      res.status(400).json({message: "Incorrect Username or Password"});
    }
  } catch (error) {
    console.log("error with stream-client", error);
    res.status(500).json({message: "Looks like something is wrong on our side, please try again..."});
    // if (error.name === "ExpiredStreamClientError") {
    //   await startUpdateProcessWith("cleanSlate");
    // }
    // res.status(500).json({message: error});
    // throw error;
    // res.send('error')
  }
};

const fetchauthor =async (req, res)=>{
  if (!api_key) return res.status(200).json({hash: "0"})
  const cryptyd = api_key;
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
