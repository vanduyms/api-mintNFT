const process = require("../env");

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

        // Phí giao dịch: (baseFeePerGas + maxPriorityFeePerGas) * gasUsed  --- đơn vị ETH
        const transactionFee = (baseFeePerGas + maxPriorityFeePerGas) * gasUsed / (10**4);

        const getAllTransaction = await axios.get(`https://api-goerli.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${process.env.CONTRACT_ADDRESS}&address=${env.ACCOUNT_ADDRESS}&page=1&offset=1000&startblock=0&endblock=99999999&sort=asc&apikey=EPP7MJEBPS986NUJEA12SKMTAKCSC45QQ3`)
            .then(result => result.data.result)

        // Lấy token của NFT vừa mint
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

module.exports = {
    getTransactionFee: getTransactionFee,
}