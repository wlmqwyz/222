import Web3 from 'web3';

let web3;

if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
        // 请求用户授权
        window.ethereum.enable();
    } catch (error) {
        console.error("User denied account access")
    }
} else if (window.web3) {
    // 旧版 dapp 浏览器支持
    web3 = new Web3(window.web3.currentProvider);
} else {
    // 设置默认Web3提供者（比如Infura）
    const provider = new Web3.providers.HttpProvider(
        "https://sepolia.infura.io/v3/de64464d68ee4171a0cba0d0d8a18e9d"
    );
    web3 = new Web3(provider);
}

export default web3;

