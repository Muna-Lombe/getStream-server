var fs = require('fs');
const fetch  = require('node-fetch');

// crude headers saver
const { Console, error } = require("console");

// var axios = require('axios').default;



// make a new logger
const headerCapture = new Console({
  stdout: fs.createWriteStream("stringHeaderResponse.txt"),
  // stderr: fs.createWriteStream("errStdErr.txt"),
});

var basepath = process.cwd();

// filesystem handler
async function fs_do(type,path,file,data, write_new=false, id=0){
  
  if(type==="read"){
    // if(!fs.readFileSync(`${path}/${file}`).toString()) return undefined;
    let data = fs.readFileSync(`${path}/${file}`).toString()
    return data;
  }
  if(type==="write"){
    if(write_new === true) return fs.writeFileSync(`${path}/collected/app${id}.json`,data)
    return fs.writeFileSync(`${path}/${file}`,data);
  }
  
}
// procxy
const requester = {
    lastRequest: new Date(2000,0,1),
    makeRequest: async function (url,options) {
        // first check when last request was made
        var timeSinceLast = (new Date()).getTime() - this.lastRequest.getTime();
        this.lastRequest = new Date();
        if (timeSinceLast < 1000) {
            this.lastRequest = new Date(this.lastRequest.getTime() + (1000 - timeSinceLast));
            await new Promise(resolve => setTimeout(resolve, 1000-timeSinceLast));
        }

        // make request here and return result
        const response = await fetch(url,options)
                  .then(resp=> {return resp}, rej => console.log('failed:', rej))
                  .catch(err => {console.log(err)});
        console.log('request status:', response.status)
        let json
        try {
          json = await response.json();
        } catch (error) {
          json = {detail: "no response body"}
        }
        
        return {json,response};
    }
};


// singup
async function signup(){
  console.log("signing up...")
  
  var url = "https://api.internal.temp-mail.io/api/v3/email/new";
  var eh = {
    "User-Agent": "PostmanRuntime/7.29.0",
    "Accept": "*/*",
    "Host": "api.internal.temp-mail.io",
    "Accept-Encoding": "gzip, deflate, br",
    "Content-Type": "application/x-www-form-urlencoded",
    "Content-Length": 0
  };
  var em_opts = {
              method: 'POST', // *GET, POST, PUT, DELETE, etc.
              headers: eh,
              redirect: 'follow', // manual, *follow, error
              referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
               // body data type must match "Content-Type" header
            
            }
            
  var res = await fetch(url,em_opts)
                  .then(resp=> {return resp.json()}, rej => console.log('failed:', rej))
                  .catch(err => {console.log(err)});
  var email = await res.email;
  // var res = await requester.makeRequest(url,em_opts)
  // var email = await res.json.email;
                

console.log("email res", email);

  var si = `email=${email.toString().replace('@','%40')}&username=${email.slice(0, 4)}&password=Aldebarandemoclese773&gotcha=&activate_chat_trial=true`;
  console.log(si)
  /*{
    email: email,
    username: email.slice(0, 4),
    password:"Aldebarandemoclese773",
    gotcha: '',
    activate_chat_trial:true
  }*/;

  var baseUrl = "https://getstream.io/api/accounts/signup/";
  var gh = {
    "Referer": "https://getstream.io/accounts/signup/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47",
    "Accept": "*/*",
    "Host": "getstream.io",
    "Accept-Encoding": "gzip, deflate, br",
   //"Connection": "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded",//"multipart/form-data; boundary=----WebKitFormBoundary40ftPa3qzAxhRqXt",//"application/x-www-form-urlencoded",
    "Content-Length": si.length
  };
  


  
  //getstream signups
  
  
  // let sr = await fetch(baseUrl, 
  //           { method: 'POST', // *GET, POST, PUT, DELETE, etc.
  //             headers: gh,
  //             redirect: 'follow', // manual, *follow, error
  //             referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  //             body: si ,
  //             // body data type must match "Content-Type" header
  //           })
  //           .then(resp=> {return Object.assign({json:resp.json(), res:resp, headers: resp.headers})}, rej => console.log('failed:', rej))
  //           // .then(resp=> {return resp.json()}, rej => console.log('failed:', rej))
  //           .catch(err => {console.log(err)});
  // // let h = new Headers(sr.headers);
  // // h.forEach((v,k)=>(console.log(`{${k}:${v}}`)))

  // var em_res =  await sr.json;
  var sh_opts = { method: 'POST', // *GET, POST, PUT, DELETE, etc.
              headers: gh,
              redirect: 'follow', // manual, *follow, error
              referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
              body: si , // body data type must match "Content-Type" header
            }
  var res = await requester.makeRequest(baseUrl,sh_opts)

  var em_res = await res.json;
  console.log(em_res);

 
  console.log(basepath);
  fs.writeFileSync(`${basepath}/non.env`,JSON.stringify(em_res));
  console.log("fs write out to non.env in signup complete")

  console.log("signed in:", res.response.ok)

  return em_res;
}

// signup();
// login
async function login(counter = 0) {
  console.log("logging in..")

  if(counter > 5) return 0;
  // https://getstream.io/api/accounts/login/
  // username:Mutale
  // password:Aldebarandemoclese773
  function fetchCred(){
    try{
      let {email, username} = JSON.parse(fs.readFileSync(`${process.cwd()}/non.env`).toString()); //JSON.parse(fs_do('read', basepath,'non.env')) //JSON.parse(fs.readFileSync(`${process.cwd()}/non.env`).toString());
      return {email, username} ;
    }catch(e){
      return false;
    }
    
  }
  if(fetchCred() === false){
    return 0;
    await signup();
    login(++counter);
  }

  function setCookies(header){
    try {
        let replaceSymbol = /((?!\{)(\[*[a-zA-Z0-9]*\(*[a-zA-Z0-9]*\s*[a-zA-Z0-9]*\)\]\:*\s*[a-zA-Z0-9]*\(*[a-zA-Z0-9]*\s*[a-zA-Z0-9]*\)))/;
        let replaceHeader = /((([a-zA-Z0-9]*\s)(?=(\{))))/;
        let replaceLastSymbol = /(\[Symbol\(headers map sorted\)\]: null)/;
        let newHeader = header.replace(replaceHeader,'').replace(replaceSymbol,`${JSON.stringify(header[0])}:`).replaceAll('\'','\"').replaceAll('=>','\:').replace(replaceLastSymbol,'\"s\"\: {}');
        try{
          JSON.parse(newHeader)
        }catch(er){
          throw er;
        }
        let headerJson = JSON.parse(newHeader);
        let objectFromHeaderArr = Object.entries(headerJson)[0][1];
        let sortCookies = objectFromHeaderArr['set-cookie'].split(';')
        
        let finalCookies = Object.fromEntries(sortCookies.map((e,i)=>{
          let idx = e.indexOf('=');
          let key = e.slice((e[0] === ' ' ? 1:0), idx)
          let tempkey  = key.split(',');
          let finalkey = tempkey[1] ? tempkey[1].slice((tempkey[1][0] === ' ' ? 1:0), tempkey[1].length) : key;
          let value =e.slice(idx+1, e.length);
          return[finalkey,value ];
        }))
        fs.writeFileSync(`${basepath}/cleanedResponseHeader.json`,JSON.stringify(finalCookies))
        console.log("fs write out to CleandedRespHedr in LOGIN complete")
        

    } catch (error) {
          console.log("header typed changed, switching type 2 format...")
          let slicedHeader = header.slice(header.indexOf("set-cookie")-1, header.length)
          let newHeader = slicedHeader.slice(0,slicedHeader.indexOf("]")+1)
      
          // let clean_k = newHeader.slice(0,newHeader.indexOf(':')).replaceAll('\'','');

          let dirty_v = newHeader.slice(newHeader.indexOf(':')+1,newHeader.length)
                                  .split('\n')
                                  .filter((e)=> (!e.includes('[') && !e.includes(']')) ? e : console.log(''))
          let clean_v_arr = dirty_v.map((e)=> e.trimStart()).map((e)=> e.replaceAll('\'',''))
          let subbed_clean_v = clean_v_arr.map((e)=> e.split(';'))

          let jsonify = (string,pivot, prevObj = null) => {
            if(typeof string === "array"){
              for(let i = 0; i< string.length; i++){
                let split_arr = string.toString().split(pivot)
              
                if(typeof prevObj === "object") return Object.assign({...prevObj,[split_arr[0]]: split_arr[1] })
                return Object.assign({[split_arr[0]]: split_arr[1]})
              }
            }
            if(typeof string === 'string'){
              let split_arr = string.toString().split(pivot)
            
              if(typeof prevObj === "object") return Object.assign({...prevObj,[split_arr[0]]: split_arr[1] })
              return Object.assign({[split_arr[0]]: split_arr[1]})
            }
            if(typeof string === 'object'){
              for(let i = 0; i< string.length; i++){
                let split_arr = string[i].toString().split(pivot)
              
                if(typeof prevObj === "object") return Object.assign({...prevObj,[split_arr[0]]: split_arr[1] })
                return Object.assign({[split_arr[0]]: split_arr[1]})
              }
            }
            
          }
          let finalCookies = {}
          for(let i = 0; i< subbed_clean_v.length; i++){
            finalCookies = jsonify(subbed_clean_v[i],"=", finalCookies)
          }
          
        

          // return -1;
          
          // console.log("",finalCookies)
        fs.writeFileSync(`${basepath}/cleanedResponseHeader.json`,JSON.stringify(finalCookies))
        console.log("fs write out to CleandedRespHedr in LOGIN complete")

    }
    
    
    
    
  }
  var {email, username} = fetchCred();
  console.log("fetch cred",email, username);
  var li = `email=${email}&username=${username}&password=Aldebarandemoclese773&gotcha=&activate_chat_trial=true`;
  var baseUrl = "https://getstream.io/api/accounts/login/";
  var gh = {
    "Referer": "https://getstream.io/accounts/signup/",
    "User-Agent": "PostmanRuntime/7.29.0",
    "Accept": "*/*",
    "Host": "getstream.io",
    "Accept-Encoding": "gzip, deflate, br",
    "Access-Control-Expose-Header": "set-cookie",
   //"Connection": "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded",//"multipart/form-data; boundary=----WebKitFormBoundary40ftPa3qzAxhRqXt",//"application/x-www-form-urlencoded",
    "Content-Length": li.length
  };
  
  //getstream signups
  // let lr = await fetch(baseUrl, 
  //           { method: 'POST', // *GET, POST, PUT, DELETE, etc.
  //             headers: gh,
  //             redirect: 'follow', // manual, *follow, error
  //             referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  //             body: li // body data type must match "Content-Type" header
  //           })
  //           .then(resp=> {return {res: resp.json(), resp:resp}}, rej => console.log('failed:', rej))
  //           .catch(err => {console.log(err)});
  let gr_opts =  { method: 'POST', // *GET, POST, PUT, DELETE, etc.
              headers: gh,
              redirect: 'follow', // manual, *follow, error
              referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
              body: li // body data type must match "Content-Type" header
            }
  var lr = await requester.makeRequest(baseUrl,gr_opts)

  // var em_res = await lr.json;
  console.log("stat:", lr.response.status)
  //////////////////////////////////////////////////////////////////
  if(lr.response.status > 400){console.log("bad request"); /*signup() ;*/ setTimeout(() => {
    login(++counter)
  }, 2000); };
  /////////////////////////////////////////////////////////////////
  // let res =  await lr.json;;

  // save log to file
  headerCapture.log(lr.response.headers)//lr.resp.headers['set-cookie']);
  console.log("fs write out to stringRespHedr in LOGIN complete")

  let cookie = await JSON.parse(JSON.stringify((fs.readFileSync("stringHeaderResponse.txt").toString()))); // JSON.parse(JSON.stringify(await fs_do('read',basepath,"stringHeaderResponse.txt"))) ;// JSON.parse(JSON.stringify((fs.readFileSync("stringHeaderResponse.txt").toString())));
  // console.log("cookie", cookie)
  if(cookie.toString().length > 5){ setCookies(cookie)};
  console.log("logged in:", lr.response.ok)
  return 1;
}

// get user
// create app from cred
async function createApp(app_count){
  console.log("creating app...")
  // await genApp();
  let {id, csrftoken, sessionid, user_token} = await JSON.parse(fs.readFileSync(`${process.cwd()}/cleanedResponseHeader.json`).toString()) // JSON.parse(JSON.stringify(fs_do('read',basepath,'cleanedResponseHeader.json')))
  console.log("creapp", id, csrftoken, sessionid)
  if(typeof id === undefined || typeof csrftoken === undefined || typeof sessionid === undefined || typeof user_token === undefined || typeof dnt === undefined){
    createApp(app_count)
    return 0;
  };
  //             https://getstream.io/api/dashboard/organization/1141868/app/
  let baseurl = `https://getstream.io/api/dashboard/organization/${id}/app/`
  let cad = {
              name: `App${app_count}`, 
              region: "singapore", 
              chat_region: "singapore", 
              development_mode: 'True', 
              template_app: ""
  }
  //calculate content length
  Object.prototype.size = function(obj) {
    let size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)){
          size++
        };
    };
    return size;
  };
  
  let jcad = JSON.stringify(cad);
            //  `chat_region=${cad.region}&development_mode=${cad.development_mode}&name=${cad.name}&region=${cad.region}&template_app=%20%22%22`
  let scad = `chat_region=${cad.chat_region}&development_mode=${cad.development_mode}&name=${cad.name}&region=${cad.region}&template_app=%20%22%22`
  let cadh = {
    "Referer": "https://dashboard.getstream.io/",
    "Origin": "https://dashboard.getstream.io",
    // "path": `/api/dashboard/organization/${id}/app/`,
    
    "scheme": "https",
    // "User-Agent": "PostmanRuntime/7.29.0",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36 Edg/104.0.1293.63",
    "Accept": "*/*",
    "Host": "getstream.io",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Content-Type": "application/json",//"application/x-www-form-urlencoded",//"application/json",//"multipart/form-data; boundary=----WebKitFormBoundary40ftPa3qzAxhRqXt",//"application/x-www-form-urlencoded",
    "Content-Length": jcad.length,
    "Cookie":`csrftoken=${csrftoken}; sessionid=${sessionid}`,
    "User-Token":`user_token=${user_token}; Path=/; Expires=Fri, 25 Aug 2023 12:54:07 GMT;`,
    "x-csrftoken": `${csrftoken}`,
    "dnt":"1"
    
  
  }
  let cadh_opts = { 
              // credentials : "include",
              method: 'POST', // *GET, POST, PUT, DELETE, etc.
              headers: cadh,
              redirect: 'follow', // manual, *follow, error
              referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
              body: jcad // body data type must match "Content-Type" header
            }
  console.log({baseurl,cadh_opts})
  // return -1;
  //perform request
  // let car = await fetch(baseurl, cadh_opts)
  //           .then(resp=> {return {res: resp.json(), resp:resp}}, rej => console.log('failed:', rej))
  //           .catch(err => {console.log(err)});
  // let data = await car.res;
  var car = await requester.makeRequest(baseurl,cadh_opts)
  // let data = await car.json;

  console.log("data", car)
  if(car.response.status === 400 || car.json.name[0] === "App with this name already exists."){
    createApp(app_count+1)
  }
  fs_do('write',basepath,'new_app_data.json',JSON.stringify(car.json))
  return 0;
}
async function getOptions(){
  console.log("fetching options...")
  let {id,csrftoken, sessionid,user_id,user_token} = fs.readFileSync(`${process.cwd()}/cleanedResponseHeader.json`).toString() ? await JSON.parse(fs.readFileSync(`${process.cwd()}/cleanedResponseHeader.json`).toString()) : {} // JSON.parse(JSON.stringify(fs_do('read',basepath,'cleanedResponseHeader.json'))) 
  let baseurl = `https://getstream.io/api/dashboard/organization/${id}/app/`
  let newCleanedResponseHeaders = {
    id,
    csrftoken,
    user_id,
    user_token,
    sessionid,
  }
   let goh = {
      "Referer": "https://dashboard.getstream.io",
      "Origin": "https://dashboard.getstream.io",
      "User-Agent": "PostmanRuntime/7.29.0",
      "Accept": "*/*",
      "Host": "getstream.io",
      "Accept-Encoding": "gzip, deflate, br",
      "Access-Control-Request-Headers" :"content-type,x-csrftoken",
      "Access-Control-Request-Method": "POST",
      "Cookie":`csrftoken=${csrftoken}; sessionid=${sessionid}` ,
      
    //"Connection": "keep-alive",
      
    }
    let goh_opts =  { method: 'OPTIONS', // *GET, POST, PUT, DELETE, etc.
                headers: goh,
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                  // body data type must match "Content-Type" header
              }
    var gor = await requester.makeRequest(baseurl,goh_opts)
    // let res = await gor.json;
    if (gor.response.status === 200){
      fs.writeFileSync(`${basepath}/cleanedResponseHeader.json`,JSON.stringify(newCleanedResponseHeaders))
    }
}
async function genApp(command="continue"){
  console.log("generating app...")
  
  let {id,csrftoken, sessionid, user_token, dnt} = fs.readFileSync(`${process.cwd()}/cleanedResponseHeader.json`).toString() ? await JSON.parse(fs.readFileSync(`${process.cwd()}/cleanedResponseHeader.json`).toString()) : {} // JSON.parse(JSON.stringify(fs_do('read',basepath,'cleanedResponseHeader.json'))) 
  //JSON.parse(fs.readFileSync(`${process.cwd()}/cleanedResponseHeader.json`).toString())
  console.log("ut fail", (typeof user_token) === 'undefined')
  
  if(typeof user_token === 'undefined' || typeof dnt === 'undefined' || command === "new_cred"){
    console.log("tok load fail",csrftoken === 'undefined')
    if(csrftoken === 'undefined' || command === "new_cred") { 
      console.log("retrying..")
      setTimeout(() => {
        login() && genApp()
      }, 3000);
      return 0;
    };
    // return -1;
    let baseurl = 'https://getstream.io/api/accounts/user/';
    // let basepath = process.cwd();
    let guh = {
      "Referer": "https://getstream.io/accounts/signup/",
      "User-Agent": "PostmanRuntime/7.29.0",
      "Accept": "*/*",
      "Host": "getstream.io",
      "Accept-Encoding": "gzip, deflate, br",
      "Access-Control-Expose-Header": "set-cookie",
      "Cookie":`csrftoken=${csrftoken}; sessionid=${sessionid}` ,
      
    //"Connection": "keep-alive",
      
    }
    let guh_opts =  { method: 'GET', // *GET, POST, PUT, DELETE, etc.
                headers: guh,
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                  // body data type must match "Content-Type" header
              }
  //  let gr = await fetch(baseurl, guh_opts)
  //             .then(resp=> {return {res: resp.json(), resp:resp}}, rej => console.log('failed:', rej))
  //             .catch(err => {console.log(err)});
    
  //   // if(gr.resp.status !== 200){setTimeout(() => {
  //   //     return login();
  //   //   }, 3000); };
  //   let res = await gr.res
    var gr = await requester.makeRequest(baseurl,guh_opts)
    let res = await gr.json;
    console.log("final res:", res)
    console.log("genned app in:",gr.response.ok)
    let apps = {}
    let [org_id,app_id,user_token, user_id, appkey, appsec] = [
      res.organizations[0].id,
      res.organizations[0].apps[0].id,
      res.organizations[0].apps[0].api_access[0].user_token,
      res.organizations[0].apps[0].api_access[0].user_id,
      res.organizations[0].apps[0].api_access[0].key, 
      res.organizations[0].apps[0].api_access[0].secret
    ];
    
    // apps = res.organizations
    res.organizations.map((org)=> {
      let o_id = org.id
      let o_apps = []
      org.apps.map((app,idx) => { 
        let fidx = idx+1
        let obj = {
          appid: app.id,
          user_token: app.api_access[0].user_token,
          user_id: app.api_access[0].user_id,
          key: app.api_access[0].key,
          secret: app.api_access[0].secret

        }
        fs_do('write','','',JSON.stringify(obj),true, fidx)
        o_apps = [...o_apps, {['app'+fidx]: obj}]
      })
      
      apps = {...apps,[o_id]: o_apps }
    })
    console.log(org_id, user_token,user_id, appkey, appsec)
    let cookieString = "id:"+org_id.toString()+"\n"
                        +"appid:"+org_id.toString()+"\n"
                        + "user_token:"+user_token.toString()+"\n"
                        + "user_id:"+user_id.toString()+"\n"
                        +"appkey:"+appkey.toString()+"\n"
                        +"appsec:"+appsec.toString()+"\n"
    
    // return fs.writeFileSync(`${basepath}/streamData.txt`,JSON.stringify({id,appkey,appsec}))
    fs_do('write',basepath,'streamData.txt',cookieString)
    fs_do('write',basepath,'streamData.json',JSON.stringify({id,user_id,user_token,appkey,appsec}))
    fs_do('write',basepath,'collectiveStreamData.json',JSON.stringify(apps))
    fs_do('write',basepath,'cleanedResponseHeader.json',JSON.stringify({id:org_id,csrftoken,sessionid,user_id,user_token}))
    console.log("gen app creds", id, csrftoken, sessionid, cookieString)
    console.log("fs write out to streamData and cleandedRespHedr in genapp complete")
    // fs.writeFileSync(`${basepath}/cleanedResponseHeader.json`,JSON.stringify(finalCookies))

    
    getOptions()
    createApp(3)
    return 0;
  }
  createApp(3)
  return 0;
}

// signup()
// login()
genApp();
// getOptions()
// createApp(3)
// regex
// (\[*[a-zA-Z0-9]*\(*[a-zA-Z0-9]*\s*[a-zA-Z0-9]*\)\])
// codnitional looknehind
// (?(?!\{)(\[*[a-zA-Z0-9]*\(*[a-zA-Z0-9]*\s*[a-zA-Z0-9]*\)\]:\s*[a-zA-Z0-9]*\(*[a-zA-Z0-9]*\s*[a-zA-Z0-9]*\))|(\,))
// (?(([a-zA-Z0-9]*\s)(?=(\{))))
// (\=\>)