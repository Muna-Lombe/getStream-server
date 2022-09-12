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
const fs = require("fs");
const os = require("os");


const {Console, error} = require("console");
const https_request = require("../curler");


// global count for login counter
let logincount = 0;
// global cred value
const logincred = 0;

// make a new logger, crude headers saver
// const headerCapture = new Console({
//   stdout: fs.createWriteStream("stringHeaderResponse.txt"),
//   // stderr: fs.createWriteStream("errStdErr.txt"),
// });

// let processpath;
try{
  
  // process.chdir('functions')
  if(process.cwd().includes("/functions/trial_extender")){
    process.chdir('../')
    // throw new Error("path is sub-path of functions, you need to go up one level.")
  }else{
    if(!process.cwd().includes("/functions")){
      throw new Error("path is sub-path of functions, you need to go up one level.")
    }
    console.log("path is set correctly")
  }
  // process.chdir('./functions')
}catch(err){
  console.error(err)
  process.chdir(process.cwd()+'/functions')
}

const basepath = process.cwd()//__dirname;


/**
 * Function to set update environment variables.
 * Takes a key and a value and
 * searches for the key in the existing '.env' file
 * and updates it value with the given value.
 */
function setEnvValue(key, value) {
  // read file from hdd & split if from a linebreak to a array
  const ENV_VARS = fs.readFileSync(process.cwd()+"/.env", "utf8").split(os.EOL);

  console.log("EOL out", ENV_VARS);
  // find the env we want based on the key
  // throw new Error(`env_vars: ${ENV_VARS}`)
  const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
    try {
      return line.match(new RegExp(key));
    } catch (error) {
      line=key;
    }
  }));

  console.log("target", target);
  // replace the key/value with the new value
  ENV_VARS.splice(target, 1, `${key}=${value}`);

  // console.log('fin env', ENV_VARS)
  // write everything back to the file system
  fs.writeFileSync(process.cwd()+"/.env", ENV_VARS.join(os.EOL));
  console.log("Env updated with", key, value);
}
// filesystem handler
/**
 * Short hand to performing synchronous fs operations.
 *
 * @param {string} type options: read, write
 * @param {string} path path to file
 * @param {string} file filename.withExtension
 * @param {StringObject} data stringified data
 * @param {Boolean} write_new
 * @param {Number} id
 * @return void
 */
async function fs_do(type, path, file, data, write_new=false, id=0) {
  if (type==="read") {
    const data = fs.readFileSync(`${path}/${file}`).toString();
    return data;
  }
  if (type==="write") {
    if (write_new === true) {
      return fs.writeFile(`${basepath}/trial_extender/collected/app${id}.json`, data, (err) => {
        if (err) throw err;
        console.log("file created and/or updated");
      });
    }
    return fs.writeFileSync(`${path}/${file}`, data);
  }
  if (type==="write_to_env") {
    console.log("attempting to write to .env in", process.cwd());
    if (fs.existsSync(process.cwd()+"/.env")) {
      Object.keys(data).map((key)=>{
        console.log(key, ":", data[key]);
        setEnvValue(key, data[key]);
      });
    }
  }
}

// proxy http request handler
/**
 * Proxy http request handler.
 * Extends the time between requests to prevent server-side blocking of ip.
 *  @prop lastRequest - saves the time since the last request
 * @prop makeRequest - first calculates how long to wait before making the request. This is done using the time since the last request.
 */

const requester = {
  lastRequest: new Date(2000, 0, 1),
  makeRequest: async function(method, url, options) {
    // first check when last request was made
    const timeSinceLast = (new Date()).getTime() - this.lastRequest.getTime();
    this.lastRequest = new Date();
    if (timeSinceLast < 1000) {
      this.lastRequest = new Date(this.lastRequest.getTime() + (1000 - timeSinceLast));
      await new Promise((resolve) => setTimeout(resolve, 1000-timeSinceLast));
    }
    const {json, headers, status} = await https_request(method, url, options);
    return {json, headers, status};
  },
};

// deletes contents of necessary files and folders to create a fresh setup
/**
 * When called, this function will synchronously go throw and truncate and delete files.
 * This is necessary to create a clean slate for a fresh setup
 * @return {boolean}
 */
async function cleanSlate() {
  try {
    fs.readdirSync(`${basepath}/trial_extender/collected`).map((file)=> fs.unlinkSync(`${basepath}/trial_extender/collected/${file}`, (err)=> {
      console.log("failed to delete, file might not exist", err);
    }));
    fs.truncateSync(`${basepath}/trial_extender/cleanedResponseHeader.json`, 0, (err)=>{
      console.log("failed to truncate", err);
    });
    fs.truncateSync(`${basepath}/trial_extender/collectiveStreamData.json`, 0, (err)=>{
      console.log("failed to truncate", err);
    });
    fs.truncateSync(`${basepath}/trial_extender/new_app_data.json`, 0, (err)=>{
      console.log("failed to truncate", err);
    });
    fs.truncateSync(`${basepath}/trial_extender/streamCred.json`, 0, (err)=>{
      console.log("failed to truncate", err);
    });
    fs.truncateSync(`${basepath}/trial_extender/streamData.json`, 0, (err)=>{
      console.log("failed to truncate", err);
    });
    fs.truncateSync(`${basepath}/trial_extender/streamData.txt`, 0, (err)=>{
      console.log("failed to truncate", err);
    });
    // fs.truncateSync(`${basepath}/trial_extender/stringHeaderResponse.txt`,0,(err)=>{
    //   console.log('failed to truncate', err)
    // })
    console.log("cleaned all slates, can proceed for fresh setup");
    return true;
  } catch (error) {
    console.log("something didnt happen right, there may be an error in the path");
    return false;
  }
}


// singup
console.log("basepath",basepath);
console.log("processpath",process.cwd());

/**
 * When called, this function will create a new account with getStream.io using a temporary email api
 * @param {Number} timeout
 * @returns
 */
async function signup(timeout=1000) {
  console.log("signing up...");

  // fetch new temp email
  const url = "https://api.internal.temp-mail.io/api/v3/email/new";
  const eh = {
    "User-Agent": "PostmanRuntime/7.29.0",
    "Accept": "*/*",
    "Host": "api.internal.temp-mail.io",
    "Accept-Encoding": "gzip, deflate, br",
    "Content-Type": "application/x-www-form-urlencoded",
    "Content-Length": 0,
  };
  const em_opts = {
    host: "api.internal.temp-mail.io",
    path: "/api/v3/email/new",
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: eh,
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    // body data type must match "Content-Type" header

  };
  const res = await requester.makeRequest("post_no_data", url, em_opts);

  console.log("temp email generated status:", res.status.code);
  if (res.status.code > 299) {
    setTimeout(async () => {
      console.log("retrying signup");
      signup(timeout+1000);
    }, timeout);
    return 0;
  }
  let email = await JSON.parse(res.json).email;
  let temp_email = email.split('@')
  email = temp_email[0]+"@bundy.com"
  console.error("temp email:", email);

  // create signup credentials and signup
  const si = `email=${email.toString().replace("@", "%40")}&username=${email.slice(0, 4)}&password=Aldebarandemoclese773&gotcha=&activate_chat_trial=true`;

  const baseUrl = "https://getstream.io/api/accounts/signup/";
  const host = "getstream.io";
  const urlpath = "/api/accounts/signup/";
  const gh = {
    "Origin": "https://getstream.io",
    "dnt": "1",
    "Referer": "https://getstream.io/accounts/signup/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47",
    "Accept": "*/*",
    "Host": "getstream.io",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded", // "multipart/form-data; boundary=----WebKitFormBoundary40ftPa3qzAxhRqXt",//"application/x-www-form-urlencoded",
    "Content-Length": si.toString().length,
  };

  const opts = {
    host: host,
    path: urlpath,
    scheme: "https",
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: gh,
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    // body: si , // body data type must match "Content-Type" header
  };
  const si_res = await requester.makeRequest("post", si, opts);
  console.error( si_res.json);
  const em_res = (typeof si_res.json) === "string" ? await JSON.parse(si_res.json) : si_res.json;
  console.log("sign up result", em_res);


  // check if streamCred.json file exists
  // if not, create new file
  let checkFile;
  try {
    checkFile = fs.readFileSync(`${basepath}/trial_extender/streamCred.json`);
  } catch (error) {
    fs.writeFile(`${basepath}/trial_extender/streamCred.json`, JSON.stringify([{"username": "TeamTay", "email": "lombemuna@hotmail.com", "first_name": "", "last_name": ""}]), (err) => {
      if (err) throw err;
      console.log("streamCred file created");
    });
    checkFile = fs.readFileSync(`${basepath}/trial_extender/streamCred.json`);
  }

  // save result of signup to files
  console.log("checkfile long?", checkFile.toString().length>2);
  fs.writeFileSync(`${basepath}/trial_extender/streamCred.json`, JSON.stringify(em_res));

  console.log("fs write out to streamCred in signup complete");

  console.log("sign up complete :", res.status.ok);

  return em_res;
}

// extracts cookies from raw string headers and saves them to file
/**
 * When called, this function will extract the csrf token and session id from a passed String
 * if the string doe not have this, nothing is returned
 * @param {String} header
 */
function setCookies(header) {
  const node_versions = process.versions;
  const getActualVersionOf = (version_str) => {
    return Number.parseFloat(version_str);
  };

  if (getActualVersionOf(node_versions.node) <= 14 || getActualVersionOf(node_versions.v8) <= 8.4) {
    console.warn(`System using node_version: ${node_versions.node} and V8_engine_version: ${node_versions.v8}
                    String.prototype.replaceAll is not supported.
                    Adding backward compatible replaceAll method to String,prototype...`);
    String.prototype.replaceAll = function(original, replacement) {
      RegExp.quote = function(str) {
        if ("([.?*+^$[\]\\(){}|-])".includes(str)) {
          return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        }
        return str;
      };
      const regex = new RegExp(RegExp.quote(original), "g");
      return this.toString().replace(regex, replacement);
    };
  }
  console.log("String.prototype.replaceAll() added :", String.prototype.replaceAll ? true : false);
  try {
    const replaceSymbol = /((?!\{)(\[*[a-zA-Z0-9]*\(*[a-zA-Z0-9]*\s*[a-zA-Z0-9]*\)\]\:*\s*[a-zA-Z0-9]*\(*[a-zA-Z0-9]*\s*[a-zA-Z0-9]*\)))/;
    const replaceHeader = /((([a-zA-Z0-9]*\s)(?=(\{))))/;
    const replaceLastSymbol = /(\[Symbol\(headers map sorted\)\]: null)/;
    const newHeader = header.replace(replaceHeader, "").replace(replaceSymbol, `${JSON.stringify(header[0])}:`).replaceAll("'", "\"").replaceAll("=>", "\:").replace(replaceLastSymbol, "\"s\"\: {}");
    try {
      JSON.parse(newHeader);
    } catch (er) {
      throw er;
    }
    const headerJson = JSON.parse(newHeader);
    const objectFromHeaderArr = Object.entries(headerJson)[0][1];
    const sortCookies = objectFromHeaderArr["set-cookie"].split(";");

    const finalCookies = Object.fromEntries(sortCookies.map((e, i)=>{
      const idx = e.indexOf("=");
      const key = e.slice((e[0] === " " ? 1:0), idx);
      const tempkey = key.split(",");
      const finalkey = tempkey[1] ? tempkey[1].slice((tempkey[1][0] === " " ? 1:0), tempkey[1].length) : key;
      const value =e.slice(idx+1, e.length);
      return [finalkey, value];
    }));

    fs.writeFileSync(`${basepath}/trial_extender/cleanedResponseHeader.json`, JSON.stringify(finalCookies));
    console.log("fs write out to CleandedRespHedr in LOGIN complete");
  } catch (error) {
    console.log("header typed changed, switching type 2 format...");
    const slicedHeader = header.slice(header.indexOf("set-cookie")-1, header.length);
    const newHeader = slicedHeader.slice(0, slicedHeader.indexOf("]")+1);

    // let clean_k = newHeader.slice(0,newHeader.indexOf(':')).replaceAll('\'','');

    const dirty_v = newHeader.slice(newHeader.indexOf(":")+1, newHeader.length)
        .split("\n")
        .filter((e)=> (!e.includes("[") && !e.includes("]")) ? e : console.log(""));
    const clean_v_arr = dirty_v.map((e)=> e.trimStart()).map((e)=> e.replaceAll("'", ""));
    const subbed_clean_v = clean_v_arr.map((e)=> e.split(";"));

    const jsonify = (string, pivot, prevObj = null) => {
      if (typeof string === "array") {
        for (let i = 0; i< string.length; i++) {
          const split_arr = string.toString().split(pivot);

          if (typeof prevObj === "object") return Object.assign({...prevObj, [split_arr[0]]: split_arr[1]});
          return Object.assign({[split_arr[0]]: split_arr[1]});
        }
      }
      if (typeof string === "string") {
        const split_arr = string.toString().split(pivot);

        if (typeof prevObj === "object") return Object.assign({...prevObj, [split_arr[0]]: split_arr[1]});
        return Object.assign({[split_arr[0]]: split_arr[1]});
      }
      if (typeof string === "object") {
        for (let i = 0; i< string.length; i++) {
          const split_arr = string[i].toString().split(pivot);

          if (typeof prevObj === "object") return Object.assign({...prevObj, [split_arr[0]]: split_arr[1]});
          return Object.assign({[split_arr[0]]: split_arr[1]});
        }
      }
    };
    let finalCookies = {};
    for (let i = 0; i< subbed_clean_v.length; i++) {
      finalCookies = jsonify(subbed_clean_v[i], "=", finalCookies);
    }
    console.log("final cookies", finalCookies);

    fs.writeFileSync(`${basepath}/trial_extender/cleanedResponseHeader.json`, JSON.stringify(finalCookies));
    console.log("fs write out to CleandedRespHedr in LOGIN complete");
  }
}

// login
/**
 * When called, this function will login with the user credentials already stored
 * or will call the signup function before proceeding.
 * @param {Number} counter
 * @returns
 */
async function login(counter = 0) {
  console.log("logging in..");

  if (counter > 5) return 0;
  // https://getstream.io/api/accounts/login/
  // username:Mutale
  // password:Aldebarandemoclese773

  // gets the user credentials from the streamCred.json
  async function fetchUserCred() {
    try {
      // await JSON.parse(fs.readFileSync(`${basepath}/trial_extender/streamCred.json`).toString())
      const streamCred = await JSON.parse(fs.readFileSync(`${basepath}/trial_extender/streamCred.json`).toString());

      const {email, username} = streamCred;
      return {email, username};
    } catch (e) {
      console.log("fetchUserCred Error:", e);
      logincount += 1;
      await signup();
      const streamCred = await JSON.parse(fs.readFileSync(`${basepath}/trial_extender/streamCred.json`).toString());

      const {email, username} = streamCred;
      return {email, username};
    }
  }


  // make post request to login
  const {email, username} = await fetchUserCred();
  console.log("fetched user cred: ", email, username);
  const li = `email=${email}&username=${username}&password=Aldebarandemoclese773&gotcha=&activate_chat_trial=true`;
  const baseUrl = "https://getstream.io/api/accounts/login/";
  const gh = {
    "Origin": "https://getstream.io",
    "dnt": "1",
    "Referer": "https://getstream.io/accounts/login/",
    "User-Agent": "PostmanRuntime/7.29.0",
    "Accept": "*/*",
    "Host": "getstream.io",
    "Accept-Encoding": "gzip, deflate, br",
    "Access-Control-Expose-Header": "set-cookie",
    // "Connection": "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded", // "multipart/form-data; boundary=----WebKitFormBoundary40ftPa3qzAxhRqXt",//"application/x-www-form-urlencoded",
    "Content-Length": li.length,
  };


  const gr_opts = {
    host: "getstream.io",
    path: "/api/accounts/login/",
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    scheme: "https",
    headers: gh,
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    // body: li // body data type must match "Content-Type" header
  };
  const lr = await requester.makeRequest("post", li, gr_opts);

  const em_res = await lr.json;
  console.log("login result:", em_res);
  console.log("stat:", lr.status.code);
  // ////////////////////////////////////////////////////////////////
  if (lr.status.code >= 400) {
    console.log("bad request"); /* signup() ;*/
    setTimeout(async () => {
      logincount += 1;
      await login(logincount);
    }, 2000);
    return 0;
  }

  // save result to cleaned response headers file
  console.log("login headers", JSON.parse(lr.headers)["set-cookie"]);
  const newCsrf = JSON.parse(lr.headers)["set-cookie"][0].split(";")[0];
  const newSessionid = JSON.parse(lr.headers)["set-cookie"][1].split(";")[0];
  fs.writeFileSync(`${basepath}/trial_extender/cleanedResponseHeader.json`, JSON.stringify({csrftoken: newCsrf.slice(newCsrf.indexOf("=")+1, newCsrf.length), sessionid: newSessionid.slice(newSessionid.indexOf("=")+1, newSessionid.length)}));
  return 1;

  // LEGACY CODE DO NOT DELETE
  // ///////////////////////////////////////////////////////////////
  // let res =  await lr.json;;

  // save log to file
  // first delete previous file
  // try {
  //   fs.truncate(`${basepath}/trial_extender/stringHeaderResponse.txt`,0, function(){console.log('String Header truncated')})
  // } catch (error) {
  //   console.log('stringHeaderResponse does not exist')
  //   fs.writeFile(`${basepath}/trial_extender/stringHeaderResponse.txt`,JSON.stringify(lr.headers), (err) => {
  //     if (err) throw err;
  //     console.log('string Header Response created');
  //   })

  // }
  // console.log("writing to string headers...")
  // // headerCapture.log(lr.response.headers)//lr.resp.headers['set-cookie']);
  // console.log("String Headers Response created, in login()")

  // let cookie = await JSON.parse(JSON.stringify((fs.readFileSync("stringHeaderResponse.txt").toString())));
  // // console.log("cookie", cookie)
  // if(cookie.toString().length > 5){ setCookies(cookie)};
  // console.log("logged in:", lr.response.ok)
  // return 1;
}

// get user
// create app from cred
/**
 * When called, this function creates an app under the saved user account.
 * For this function to operate normally, a csrfToken, sessionId and usertoken must exist.
 * @param {Number} app_count
 * @returns
 */
async function createApp(app_count=0) {
  console.log("creating app...");

  // get tokens and user cred
  const {id, csrftoken, sessionid, user_token} = await JSON.parse(fs.readFileSync(`${basepath}/trial_extender/cleanedResponseHeader.json`).toString()); // JSON.parse(JSON.stringify(fs_do('read',basepath,'cleanedResponseHeader.json')))
  const {username} = await JSON.parse(fs.readFileSync(`${basepath}/trial_extender/streamCred.json`).toString());
  console.log("creapp", id, csrftoken, sessionid);

  // if no tokens or credentials exist, generate them first
  // if these conditions are true, this instance of the function will loop back to the genApp function and then exit with completing
  if (typeof id === undefined || typeof csrftoken === undefined || typeof sessionid === undefined || typeof user_token === undefined || typeof dnt === undefined) {
    console.log("undefined id or user_token,\n retrying createApp");
    await genApp();
    return 0;
  }

  // set request properties and make request
  const baseurl = `https://getstream.io/api/dashboard/organization/${id}/app/`;
  const cad = {
    name: `${username}_app${app_count}`,
    region: "singapore",
    chat_region: "singapore",
    development_mode: "True",
    template_app: "",
  };
  // calculate content length
  Object.prototype.size = function(obj) {
    let size = 0; let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        size++;
      }
    }
    return size;
  };

  const jcad = JSON.stringify(cad);

  const scad = `chat_region=${cad.chat_region}&development_mode=${cad.development_mode}&name=${cad.name}&region=${cad.region}&template_app=%20%22%22`;
  const cadh = {
    "Referer": "https://dashboard.getstream.io/",
    "Origin": "https://dashboard.getstream.io",
    "scheme": "https",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36 Edg/104.0.1293.63",
    "Accept": "*/*",
    "Host": "getstream.io",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Content-Type": "application/json", // "application/x-www-form-urlencoded",//"application/json",//"multipart/form-data; boundary=----WebKitFormBoundary40ftPa3qzAxhRqXt",//"application/x-www-form-urlencoded",
    "Content-Length": jcad.length,
    "Cookie": `csrftoken=${csrftoken}; sessionid=${sessionid}`,
    "User-Token": `user_token=${user_token}; Path=/; Expires=Fri, 25 Aug 2023 12:54:07 GMT;`,
    "x-csrftoken": `${csrftoken}`,
    "dnt": "1",
  };

  const cadh_opts = {
    // credentials : "include",
    host: "getstream.io",
    path: `/api/dashboard/organization/${id}/app/`,
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: cadh,
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    // body: jcad // body data type must match "Content-Type" header
  };
  console.log({baseurl, cadh_opts});

  const car = await requester.makeRequest("post", jcad, cadh_opts);
  let data = await car.json;

  // reruns the function with a new app count incase an app with this name already exists
  if (car.status.code === 400 || JSON.parse(data).name[0] === "App with this name already exists.") {
    console.log("App with this name already exists \ncreating new app");
    createApp(app_count+1);
    return 0;
  }
  data = JSON.parse(data);
  data["setup_code_example"] = 0;

  // saves request result to new_app_data.json file
  fs_do("write", basepath, "/trial_extender/new_app_data.json", JSON.stringify(data));
  const {res} = await getUser(csrftoken, sessionid);
  const apps = await extractUserDetails("appData", res).then((resp)=>resp.apps);
  const appname = Object.keys(apps[Object.keys(apps)[0]][0])[0];
  const app = apps[Object.keys(apps)[0]][0][appname];
  console.log("apps", appname);

  let {appid, key, secret}={};
  try {
    ({appid, key, secret}=await JSON.parse(fs.readFileSync(`${basepath}/trial_extender/collected/${appname}.json`).toString()));
  } catch (err) {
    ({appid, key, secret}= app);
  }
  console.log("line 543", appid, key, secret);
  // return 0
  const stream_env_cred = {
    STREAM_APP_ID: appid.toString(),
    STREAM_API_KEY: key.toString(),
    STREAM_API_SECRET: secret.toString(),
  };
  fs_do("write", basepath, "/trial_extender/collectiveStreamData.json", JSON.stringify(apps));

  fs_do("write_to_env", basepath, ".env", stream_env_cred);
  return 0;
}
/**
 * Function simply checks if credentials are valid
 * @returns
 */
async function getOptions() {
  console.log("fetching options...");
  const {id, csrftoken, sessionid, user_id, user_token} = fs.readFileSync(`${basepath}/trial_extender/cleanedResponseHeader.json`).toString() ? await JSON.parse(fs.readFileSync(`${basepath}/trial_extender/cleanedResponseHeader.json`).toString()) : {}; // JSON.parse(JSON.stringify(fs_do('read',basepath,'cleanedResponseHeader.json')))
  const baseurl = `https://getstream.io/api/dashboard/organization/${id}/app/`;
  const newCleanedResponseHeaders = {
    id,
    csrftoken,
    user_id,
    user_token,
    sessionid,
  };
  const goh = {
    "Referer": "https://dashboard.getstream.io",
    "Origin": "https://dashboard.getstream.io",
    "dnt": "1",
    "User-Agent": "PostmanRuntime/7.29.0",
    "Accept": "*/*",
    "Host": "getstream.io",
    "Accept-Encoding": "gzip, deflate, br",
    "Access-Control-Request-Headers": "content-type,x-csrftoken",
    "Access-Control-Request-Method": "POST",
    "Cookie": `csrftoken=${csrftoken}; sessionid=${sessionid}`,

    // "Connection": "keep-alive",

  };
  const goh_opts = {
    host: "getstream.io",
    path: `/api/dashboard/organization/${id}/app/`,
    method: "OPTIONS", // *GET, POST, PUT, DELETE, etc.
    headers: goh,
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    // body data type must match "Content-Type" header
  };
  const gor = await requester.makeRequest("options", baseurl, goh_opts);
  // let res = await gor.json;

  if (gor.status.code === 200) {
    console.log("get options response 200, updating cleanedResponseHeader.json ");
    fs.writeFileSync(`${basepath}/trial_extender/cleanedResponseHeader.json`, JSON.stringify(newCleanedResponseHeaders));
  }
  return 0;
}

// gets user from passed tokens
/**
 * When called, this function will return user data from the credentials passed.
 * The data returned includes app tokens and organization data.
 * @param {string} csrftoken
 * @param {string} sessionid
 * @returns
 */
async function getUser(csrftoken, sessionid) {
  const baseurl = "https://getstream.io/api/accounts/user/";
  // let basepath = basepath;
  const guh = {
    "Origin": "https://dashboard.getstream.io",
    "dnt": "1",
    "Referer": "https://getstream.io/accounts/signup/",
    "User-Agent": "PostmanRuntime/7.29.0",
    "Accept": "*/*",
    "Host": "getstream.io",
    "Accept-Encoding": "gzip, deflate, br",
    "Access-Control-Expose-Header": "set-cookie",
    "Cookie": `csrftoken=${csrftoken}; sessionid=${sessionid}`,
  };
  const guh_opts = {
    host: "getstream.io",
    path: "/api/accounts/user/",
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    headers: guh,
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    // body data type must match "Content-Type" header
  };

  const gr = await requester.makeRequest("get", baseurl, guh_opts);
  const res = await JSON.parse(gr.json);
  return {res, gr};
}
// extracts user details from the data passed
/**
 *
 * @param {String} extract options: 'orgData','appData'
 * @param {Array} data
 * @returns
 */
async function extractUserDetails(extract, data) {
  if (extract === "orgData") {
    const org = [
      data.organizations[0].id,
      data.organizations[0].chat_trial_expired,
      data.organizations[0].apps[0].id,
      data.organizations[0].apps[0].api_access[0].user_token,
      data.organizations[0].apps[0].api_access[0].user_id,
      data.organizations[0].apps[0].api_access[0].key,
      data.organizations[0].apps[0].api_access[0].secret,
    ];
    return {org};
  }
  if (extract === "appData") {
    let apps = {};
    data.organizations.map((org)=> {
      const o_id = org.id;
      let o_apps = [];
      org.apps.map((app, idx) => {
        if (idx !== 0) {
          const fidx = idx+1;
          const obj = {
            appid: app.id,
            user_token: app.api_access[0].user_token,
            user_id: app.api_access[0].user_id,
            key: app.api_access[0].key,
            secret: app.api_access[0].secret,

          };
          // creates an app.json file in the collected folder
          // content is stringified object
          fs_do("write", "", "", JSON.stringify(obj), true, fidx-1);
          o_apps = [...o_apps, {[`app${fidx-1}`]: obj}];
        }
      });

      apps = {...apps, [o_id]: o_apps};
    });
    console.log("extracted app:", JSON.stringify(apps));

    return {apps};
  }
}

// main function of program, this will generate the app.
/**
 * This is the entry point of the program.
 * When called, this function will generate an app based on the credentials that already exist in select files.
 * If no files exist, fallback functions will be called to signup and login before continuing.
 * If either the mode is set to cleanSlate,
 * the function will first will all user data and credentials before proceeding.
 * This wil force a fresh setup to occur
 * If the command is set to 'new cred',
 * the function will create new csrf token and session id.
 * @param {string} mode options: cleanSlate, default state
 * @param {string} command options: continue, new cred
 * @returns
 */
async function genApp(mode="default state", command="continue") {
  if (mode === "cleanSlate") {
    await cleanSlate();
  }
  console.log("generating app...");

  const {id, csrftoken, sessionid, user_token} = fs.readFileSync(`${basepath}/trial_extender/cleanedResponseHeader.json`).toString() ? await JSON.parse(fs.readFileSync(`${basepath}/trial_extender/cleanedResponseHeader.json`).toString()) : {}; // JSON.parse(JSON.stringify(fs_do('read',basepath,'cleanedResponseHeader.json')))
  // JSON.parse(fs.readFileSync(`${basepath}/trial_extender/cleanedResponseHeader.json`).toString())

  console.log("no csrf_token: ", (typeof csrftoken) === "undefined");
  if ((typeof id) === "undefined" || (typeof user_token) === "undefined" || (typeof sessionid) === "undefined" || (typeof csrftoken )=== "undefined" || command === "new_cred") {
    console.log("one of tokens missing or new credentials requested, ");
    console.log("csrftoken", csrftoken);
    console.log("sessionid", sessionid);
    console.log("id", id);
    // console.log("user_token", user_token);
    console.log("command", command)
    if ((typeof sessionid) === "undefined" || (typeof csrftoken) === "undefined") {
      console.log("retrying in 3 seconds..")
      // setTimeout(async () => {
        console.log("retrying login..");
        await login(logincount+1);
        console.log("retrying generate app...");
        await genApp();
      // }, 3000);
      return 0;
    }
    console.log("attempting refetch of tokens...")
    const {res, gr} = await getUser(csrftoken, sessionid);
    // console.log("generate app req->res:", res)
    console.log("generated app: ", gr.status.ok);
    // return 0
    const [org_id, chat_trial_expired, app_id, user_token, user_id, appkey, appsec] = await extractUserDetails("orgData", res).then((resp)=> resp.org);

    if (chat_trial_expired.toString() === "true") {
      console.log("chat trial expired, attempting with recent credentials!");
      await signup();
      await login(logincount);
      await genApp();
      return 0;
    }

    await extractUserDetails("appData", res);

    console.log(org_id, user_token, user_id, appkey, appsec);
    const cookieString = "id:"+org_id.toString()+"\n"+
                        "appid:"+app_id.toString()+"\n" +
                        "user_token:"+user_token.toString()+"\n" +
                        "user_id:"+user_id.toString()+"\n"+
                        "appkey:"+appkey.toString()+"\n"+
                        "appsec:"+appsec.toString()+"\n";


    fs_do("write", basepath, "/trial_extender/streamData.txt", cookieString);

    fs_do("write", basepath, "/trial_extender/streamData.json", JSON.stringify({org_id, user_id, user_token, appkey, appsec}));

    fs_do("write", basepath, "/trial_extender/cleanedResponseHeader.json", JSON.stringify({id: org_id, csrftoken, sessionid, user_id, user_token}));
    console.log("gen app creds", org_id, csrftoken, sessionid, cookieString);
    console.log("fs write out to streamData and cleandedRespHedr in genapp complete");

    console.log("get user complete, getting options");
    await getOptions();
    await createApp(1);
    return 0;
  }
  await createApp(1);
  return 0;
}

const args = process.argv.slice(2).length > 0 ? process.argv.slice(2)[0] : null;

if (args === "cleanDirs") {
  return cleanSlate();
}

genApp(args);
// cleanSlate()

