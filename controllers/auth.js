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

// credentials

require("dotenv").config();
function isFreshInstall() {
  console.log(process.cwd());
  console.log("is fresh install", !fs.existsSync(process.cwd()+"/.env"));
  if (!fs.existsSync(process.cwd()+"/.env")) {
    const streamKeys = "STREAM_APP_ID=1160285\nSTREAM_API_KEY=8tpzrxya45e2\nSTREAM_API_SECRET=2s6db45p654pasyzjk5btwda2ayqqhzyvdvjprepm6q9yvmw6wm4myvj6bxsetwn";
    fs.appendFileSync("./.env", streamKeys);
    // fs.truncateSync('./.env',0)
    return true;
  }
  return false;
}
isFreshInstall();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;
const app_id = process.env.STREAM_APP_ID;
// const api_key = "8tpzrxya45e2";
// const api_secret = "2s6db45p654pasyzjk5btwda2ayqqhzyvdvjprepm6q9yvmw6wm4myvj6bxsetwn";
// const app_id = "1160285";


const client = StreamChat.getInstance(api_key, api_secret);

const clientNotActive = async ()=>{
  const active = await client.queryUsers({}).then((resp) => resp.users&&false).catch((err)=> {
    console.log("err:", err.code, err.message);
    return err.code ===2;
  });
  console.log("expired client?", active);
  return active;
};


async function startUpdateProcessWith(args) {
  const child_process=fork(process.cwd()+"/run_procfile", (args && [args]));
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
    const clientExpired = await clientNotActive();
    if (clientExpired) {
      console.log("client expr", clientExpired);
      const expiredClient = new Error("Client is expired!");
      expiredClient.name = "ExpiredStreamClientError";
      //   res.status(500).json({message: expiredClient.name});
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
    const clientExpired = await clientNotActive();
    if (clientExpired) {
      console.log("client expr", clientExpired);
      const expiredClient = new Error("Client is expired!");
      expiredClient.name = "ExpiredStreamClientError";
      //   res.status(500).json({message: expiredClient.name});
      console.log("Starting config update...");
      // res.status(500).json({message: "Looks like something is wrong on our side, please try again..."});
      // await startUpdateProcessWith();
      throw expiredClient;
    }

    const {username, password} = req.body;

    const serverClient = connect(api_key, api_secret, app_id);

    // const client = StreamChat.getInstance(api_key, api_secret);

    const getUsers = await client.queryUsers({name: username}).then((resp) => resp.users).catch((err)=> {
      console.log("getuser error", err);
      return {errCode: err.code, message: err.message};
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
    if (error.name === "ExpiredStreamClientError") {
      await startUpdateProcessWith("cleanSlate");
    }
    // res.status(500).json({message: error});
    // throw error;
    // res.send('error')
  }
};

const fetchauthor =async (req, res)=>{

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
