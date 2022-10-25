const ethers = require("ethers");
const process = require("../env");

const etherscan = require("./etherscan");
const abi = require("../json/MyNFT.json").abi;

const provider = new ethers.providers.AlchemyProvider("goerli", process.env.API_KEY);
const signers = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const myNFTContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, signers);

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

const getResult = async(tokenURI) => {
    const responseMint = await mint(tokenURI);

    if (responseMint.success) {
      try {
        const txHash = responseMint.status;
        const result = await etherscan.getTransactionFee(txHash);

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

module.exports = {
    getResult: getResult,
}