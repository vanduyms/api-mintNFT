const {env} = require("../env");
const axios = require("axios");
const fs = require("fs");

const key = env.PINATA_KEY;
const secret = env.PINATA_SECRET_KEY;

const FormData = require('form-data');

const pinFiletoIPFS = async(path) => {
  var data = new FormData();
  data.append('file', fs.createReadStream(path));
  data.append('pinataOptions', '{"cidVersion": 1}');
  data.append('pinataMetadata', '{"name": "Image", "keyvalues": {"company": "AIOZ"}}');

  var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
    headers: { 
      pinata_api_key: key,
      pinata_secret_api_key: secret,
      ...data.getHeaders(),
    },
    data : data
  };

  try {
    const res = await axios(config);
    return {
      success: true,
      pinataUrl: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash,
    }
  } catch (err) {
    return {
      success: false,
      error: err,
    }
  }
}

const pinJSONtoIPFS = async (data) => {
  var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: { 
      pinata_api_key: key,
      pinata_secret_api_key: secret,
    },
    data : data
  };

  try {
    const res = await axios(config);
    return {
      success: true,
      pinataUrl: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash
    }
  } catch(err) {
    return {
      success: false,
      error: err,
    }
  }
}

module.exports = {
    pinFiletoIPFS,
    pinJSONtoIPFS,
}