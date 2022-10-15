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
  const errBuffer = [];
  let headers= "";
  let status = "";

  // ClientRequest.
  const req = https.request(req_opts, (resp) => {
    // catch response error
    if (resp.statusCode < 200 || resp.statusCode > 299) {
      resp.on("data", (chunk) => {
        errBuffer.push(chunk.toString());
      }).on("end", (data)=>{
        console.error("data", errBuffer.join());
        headers = JSON.stringify(resp.headers);
        status = {code: resp.statusCode, message: resp.statusMessage, ok: (resp.statusCode >= 200 && resp.statusCode <= 299)};
        console.error("msg", resp.statusCode, resp.statusMessage, req_data, req_opts);
        fs.appendFileSync("./errFile.txt", JSON.stringify({date: new Date().toTimeString() + new Date().toDateString(), data: errBuffer.join()}, ()=>{}, "\n"));
        reject(save_result(errBuffer.join(), headers, status));
        // reject(save_result({name: "App with this name already exists."}, headers, status));
        throw new Error();
      });
      // throw new Error(`"rejected request", ${resp.statusMessage}`);
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
  const getPostOrOptionData = async () =>{
    const res = await resolved_request(http_post, req_data=dataOrUrl, opts).then((resp) => resp).catch((err)=> console.error(err));
    const {json, headers, status} = await res;
    // console.log(headers)
    return {json, headers, status};
  };
  const getPostNoData = async () =>{
    const res = await resolved_request_no_data(http_post, opts).then((resp) => resp).catch((err)=> console.error(err));
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
}

module.exports = https_request;

// console.log(getNasaData(url,http_get))

