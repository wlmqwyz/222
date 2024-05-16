const KovanTokens = require('../KovanTokens');
const { abi, address } = require('./contractInfo.json'); 
const tokens = KovanTokens();

// 设置好Web3实例和合约实例
const Web3 = require('web3');
const web3 = new Web3('https://eth-sepolia.g.alchemy.com/v2/FroxphsDHnff_m9M9yn1BMdml-siXCNC');
web3.eth.accounts.wallet.add("ac30614b86d497df427395af21cac484f4242191b2df1ca8eda7ba9c90d6d565");
const contract = new web3.eth.Contract(abi, address);

async function uploadTokenAddresses() {
    for (const token of tokens) {
        // 使用setTokenAddress方法上传每个代币的名称和地址
        const receipt = await contract.methods.setTokenAddress(token.name, token.address).send({ from: '0x3c581015C9C6d1f33Bd4A6CBA276f273643C211e', gas: 3000000 });
        console.log(`Uploaded address for token named ${token.name}: ${token.address}`);
        console.log(`Transaction receipt: ${receipt.transactionHash}`);

        const receipt1 = await contract.methods.setPoolAddress(token.name, token.pooladdress).send({ from: '0x3c581015C9C6d1f33Bd4A6CBA276f273643C211e', gas: 3000000 });
        console.log(`Uploaded address for token named ${token.name}: ${token.pooladdress}`);
        console.log(`Transaction receipt: ${receipt1.transactionHash}`);
    }
}

// 使用代币名称查询地址
async function querytokenAddress(tokenName) {
    const address = await contract.methods.getTokenAddress(tokenName).call();
    console.log(`Address for ${tokenName} is ${address}`);

    const address1 = await contract.methods.getPoolAddress(tokenName).call();
    console.log(`Address for ${tokenName} is ${address1}`);
}

// 示例用法
uploadTokenAddresses().then(() => {
    console.log('All addresses have been uploaded successfully.');
    // 假设我们要查询"DAI"的地址
    return querytokenAddress("MENG");
}).catch(console.error);

