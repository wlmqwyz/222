const fs = require('fs');
const Web3 = require('web3');
const { abi, address } = require('./contractInfo.json'); // 合约的ABI和地址

const web3 = new Web3('https://eth-sepolia.g.alchemy.com/v2/FroxphsDHnff_m9M9yn1BMdml-siXCNC'); // 你的Web3提供者
web3.eth.accounts.wallet.add("ac30614b86d497df427395af21cac484f4242191b2df1ca8eda7ba9c90d6d565");
const contract = new web3.eth.Contract(abi, address);
const data = JSON.parse(fs.readFileSync('address.json', 'utf-8'));


async function uploadAddresses() {
    for (let key in data) {
        await contract.methods.setAddress(key, data[key]).send({ from: '0x3c581015C9C6d1f33Bd4A6CBA276f273643C211e', gas: 100000 });
    }
}

uploadAddresses().then(() => console.log('Addresses uploaded successfully.'));



