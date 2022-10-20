var express = require("express");
var app = express();

const axios = require("axios");
const {createAlchemyWeb3}  = require("@alch/alchemy-web3");

const env = {
    PINATA_KEY: "18647a349e88f15077eb",
    PINATA_SECRET_KEY: "eafa3a24300b85e682d7fc63b83ef148061eab2d1a3f3d87307ec21929b4637a",
    ALCHEMY_KEY: "https://eth-goerli.g.alchemy.com/v2/AXODOoFE9EUpK96e-jdHJgGIh3A5rtiM",
    API_KEY: "AXODOoFE9EUpK96e-jdHJgGIh3A5rtiM",
    PRIVATE_KEY: "ec7095193c3790752a871701e5095d28497cef5408caa0b555cd0454a88a9f11",
    API_ETHERSCAN: 'EPP7MJEBPS986NUJEA12SKMTAKCSC45QQ3',
    CONTRACT_ADDRESS: '0xbc70a502ed7e464fa67d9c7cca6e32d98c050e60',
    ACCOUNT_ADDRESS: '0xb0cdc7764b5fb49de4da135381c645ed72c59297',
}

const web3 = createAlchemyWeb3(env.ALCHEMY_KEY);
const ethers = require("ethers");

const contractJson = require("./json/MyNFT.json");
const abi = contractJson.abi;

const provider = new ethers.providers.AlchemyProvider("goerli", env.API_KEY);
const signers = new ethers.Wallet(env.PRIVATE_KEY, provider);

const myNFTContract = new ethers.Contract(env.CONTRACT_ADDRESS, abi, signers);

const mint = async(tokenURI) => {
    try {
        const nftTxn = await myNFTContract.mintNFT(signers.address, tokenURI);
        await nftTxn.wait();
        return {
            success: true, 
            status: nftTxn.hash
        };
    } catch (error) {
        return {
            success: false,
            status: error.message
        }
    }
}

const getTransactionFee = async(txHash) => {
    try {
        const infoTransaction = await axios.get(`https://api-goerli.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=EPP7MJEBPS986NUJEA12SKMTAKCSC45QQ3`)
            .then(result => result.data);
        
        const blockNumber = infoTransaction.result.blockNumber;

        const infoBlockNumber = await axios.get(`https://api-goerli.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${blockNumber}&boolean=true&&apikey=EPP7MJEBPS986NUJEA12SKMTAKCSC45QQ3`)
            .then(result => result.data.result);

        const transactionReceipt = await axios.get(`https://api-goerli.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=EPP7MJEBPS986NUJEA12SKMTAKCSC45QQ3`)
            .then(result => result.data);

            
        const baseFeePerGas = parseInt(infoBlockNumber.baseFeePerGas) / (10**8);
        const maxPriorityFeePerGas = parseInt(infoTransaction.result.maxPriorityFeePerGas) / (10 ** 8);
        const gasUsed = parseInt(transactionReceipt.result.gasUsed) / (10** 6);
        
        const transactionFee = (baseFeePerGas + maxPriorityFeePerGas) * gasUsed / (10**4);

        const getAllTransaction = await axios.get(`https://api-goerli.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${env.CONTRACT_ADDRESS}&address=${env.ACCOUNT_ADDRESS}&page=1&offset=1000&startblock=0&endblock=99999999&sort=asc&apikey=EPP7MJEBPS986NUJEA12SKMTAKCSC45QQ3`)
            .then(result => result.data.result)

        const tokenID = parseInt(getAllTransaction[getAllTransaction.length - 1].tokenID) + 1;

        return {
            success: true,
            result: `TokenID: ${tokenID},
            Transaction Hash: ${txHash},
            Transaction Fee: ${transactionFee} Ether
            `,
        }
    } catch (err) {
        return {
            success: false,
            result: 'Error in calculate transaction fee'
        }
    }
}

const getResult = async(tokenURI) => {
    const responseMint = await mint(tokenURI);

    if (responseMint.success) {
      try {
        const txHash = responseMint.status;
        const result = await getTransactionFee(txHash);

        return {
          success: true,
          status: result.result,
        }
      } catch (err) {
        return {
          success: false, 
          status: err.message,
        }
      }
    } else {
      return {
        success: false,
        status: responseMint.status
      }
    }
}

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(3306, function () {
    console.log('Node app is running on port 3306');
});

app.get("/", function(req, res) {
    res.send({success: true, message: "Hello"})
})

app.post('/mint', async (req, res) => {
    const data = {
        address: req.body.address,
        tokenURI: req.body.tokenURI,
    }

    const result = await getResult(data.tokenURI);
    return res.send({
        success: true,
        address: data.address,
        result: result
    })
})
