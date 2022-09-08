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
const https = require("https");
const zlib = require("zlib");
const fs = require("fs");
const save_result =(res, hed, stet) => {
  return {json: res, headers: hed, status: stet};
};


const http_get =(url, resolve, reject) => {
  const data = "";
  return https.get(url, (resp) => {
    let headers="";
    const jsonBuffer = [];
    let status = "";
    // catch response error
    if (resp.statusCode < 200 || resp.statusCode > 299) {
      reject(new Error("Failed to load page, status code: "+resp.statusCode +", " + resp.statusMessage + ",\n"));
    }

    // A chunk of data has been received.

    console.log("encoding", resp.headers["content-encoding"] );
    if (resp.headers["content-encoding"] === "gzip") {
      const gunzip = resp.pipe(zlib.createGunzip());
      gunzip.on("data", (chunk) => {
        jsonBuffer.push(chunk.toString());
      }).on("end", () => {
        // console.log("jsoni",jsonBuffer.join());
        headers = JSON.stringify(resp.headers);
        status = {code: resp.statusCode, message: resp.statusMessage, ok: (resp.statusCode >= 200 && resp.statusCode <= 299)};
        resolve(save_result(jsonBuffer.join(), headers, status));
      }).on("error", (er)=> {
        console.log("err", er, "unzipped", jsonBuffer.join());
      });
    } else {
      resp.on("data", (chunk) => {
        jsonBuffer.push(chunk.toString());
      }).on("end", () => {
        // console.log("jsoni",jsonBuffer.join());
        headers = JSON.stringify(resp.headers);
        status = {code: resp.statusCode, message: resp.statusMessage, ok: (resp.statusCode >= 200 && resp.statusCode <= 299)};
        resolve(save_result(jsonBuffer.join(), headers, status));
      });
    }
  }).on("error", (err) => {
    console.log(new Error("request reject", err));
    reject(err);
  });
};
const http_post = (req_data, req_opts, resolve, reject) => {
  const jsonBuffer = [];
  let headers= "";
  let status = "";

  // ClientRequest.
  const req = https.request(req_opts, (resp) => {
    // catch response error
    if (resp.statusCode < 200 || resp.statusCode > 299) {
      console.error("rejected request", resp.statusMessage);
      headers = JSON.stringify(resp.headers);
      status = {code: resp.statusCode, message: resp.statusMessage, ok: (resp.statusCode >= 200 && resp.statusCode <= 299)};
      fs.appendFileSync("./errFile.txt", JSON.stringify({msg: resp.statusMessage, url: req_opts, hdr: resp.headers}));
      reject(save_result({name: "App with this name already exists."}, headers, status));
      throw new Error(`"rejected request", ${resp.statusMessage}`);
    }

    // A chunk of data has been received.

    console.log("encoding", resp.headers["content-encoding"] );
    if (resp.headers["content-encoding"] === "gzip") {
      const gunzip = resp.pipe(zlib.createGunzip());
      gunzip.on("data", (chunk) => {
        jsonBuffer.push(chunk.toString());
      }).on("end", () => {
        // console.log("jsoni",jsonBuffer.join());
        headers = JSON.stringify(resp.headers);
        status = {code: resp.statusCode, message: resp.statusMessage, ok: (resp.statusCode >= 200 && resp.statusCode <= 299)};
        resolve(save_result(jsonBuffer.join(), headers, status));
      }).on("error", (er)=> {
        console.log("err", er, "unzipped", jsonBuffer.join());
      });
    } else {
      resp.on("data", (chunk) => {
        jsonBuffer.push(chunk.toString());
      }).on("end", () => {
        // console.log("jsoni",jsonBuffer.join());
        headers = JSON.stringify(resp.headers);
        status = {code: resp.statusCode, message: resp.statusMessage, ok: (resp.statusCode >= 200 && resp.statusCode <= 299)};
        resolve(save_result(jsonBuffer.join(), headers, status));
      });
    }
  }).on("error", (err) => {
    console.log(new Error("request reject", err.name, err.message, err.stack));
    reject(err);
  });
  req.write(req_data);
  req.end();
};

const http_options = http_post;

async function resolved_get(url, req) {
  return new Promise((resolve, reject) => {
    req(url, resolve, reject);
  });
}
async function resolved_request(req, req_data, opts) {
  return new Promise((resolve, reject) => {
   opts ? req(req_data, opts, resolve, reject) : req(req_data, resolve, reject);
  });
}
async function resolved_request_no_data(req, opts) {
  return new Promise((resolve, reject) => {
    req(opts, resolve, reject);
  });
}

// EXAMPLES
// /////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////
// get req

const getNasaData = async (url, req) =>{
  const data = await resolved_get(url, req);
  const res = await data;
  return res;
};
const url = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY";
// //////////////////////////
// post req
function https_request(method, dataOrUrl, opts) {
  // let email = "mherbaatu@archKabwe.ry"
  // let data = `email=${email.toString().replace('@','%40')}&username=${email.slice(0, 4)}&password=Aldebarandemoclese773&gotcha=&activate_chat_trial=true`;
  // // let si_data = new URLSearchParams(`email=${email.toString().replace('@','%40')}&username=${email.slice(0, 4)}&password=Aldebarandemoclese773&gotcha=&activate_chat_trial=true`);
  // console.log(si_data)

  // let baseUrl = "https://getstream.io/api/accounts/signup/";
  // let host = "getstream.io"
  // let urlpath = '/api/accounts/signup/'
  // let gh = {
  //   "Origin": "https://getstream.io",
  //   "dnt":"1",
  //   "Referer": "https://getstream.io/accounts/signup/",
  //   "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47",
  //   "Accept": "*/*",
  //   "Host": "getstream.io",
  //   "Accept-Encoding": "gzip, deflate, br",
  //   "Connection": "keep-alive",
  //   "Content-Type": "application/x-www-form-urlencoded",//"multipart/form-data; boundary=----WebKitFormBoundary40ftPa3qzAxhRqXt",//"application/x-www-form-urlencoded",
  //   "Content-Length": si_data.toString().length
  // };

  // let opts = {
  //             host: host,
  //             // authority: host,
  //             path: urlpath,
  //             scheme:'https',
  //             method: 'POST', // *GET, POST, PUT, DELETE, etc.
  //             headers: gh,
  //             redirect: 'follow', // manual, *follow, error
  //             referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  //             // body: si , // body data type must match "Content-Type" header
  //           }

  const getPostOrOptionData = async () =>{
    const res = await resolved_request(http_post, req_data=dataOrUrl, opts).then((resp) => resp).catch((err)=> err);
    const {json, headers, status} = await res;
    // console.log(headers)
    return {json, headers, status};
  };
  const getPostNoData = async () =>{
    const res = await resolved_request_no_data(http_post, opts).then((resp) => resp).catch((err)=> console.log(err));
    const {json, headers, status} = await res;
    // console.log(headers)
    return {json, headers, status};
  };
  const getData = async () =>{
    const res = await resolved_get(dataOrUrl, http_get).then((resp) => resp).catch((err)=> console.log(err));
    const {json, headers, status} = await res;
    // console.log(headers)
    return {json, headers, status};
  };
  // console.log(getData(http_post))
  return (method.toString().toLowercase === "get" ?
          getData() :
          method.toString().toLowercase === "post_no_data" ?
          getPostNoData() :
          getPostOrOptionData());

  //  let getSiData =  async(req) =>{
  //   let data = await resolved_get(baseUrl,req).then(resp => resp).catch(err=> console.log(err))
  //   let res = await data
  //   return res
  // }
  // console.log(getSiData(http_get))
}

module.exports = https_request;

// console.log(getNasaData(url,http_get))

