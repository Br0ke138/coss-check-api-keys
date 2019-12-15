const request = require("request-promise-native");
const CryptoJS = require('crypto-js');
const querystring = require('querystring');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

let publicKey = '';
let privateKey = '';

askForKeys();

async function askForKeys() {
    readline.question(`Enter public key: `, async (key1) => {
        publicKey = key1;
        readline.question(`Enter private key: `, async (key2) => {
            privateKey = key2
            try {
                const balance = await getBalance();
                if (balance.includes('html')) {
                    throw 'Invalid keys';
                }
                console.log('Success');
            } catch (e) {
                console.log('Error');
                console.log(e);
            }

            await askForKeys();
        })
    })
}

function getBalance() {
    return privateGet("https://trade.coss.io/c/api/v1/account/balances", {timestamp: Date.now(), recvWindow: 9999999999});
}

function privateGet(url, payload) {
    const config = {
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': publicKey,
            'Signature': CryptoJS.HmacSHA256(querystring.stringify(payload), privateKey).toString(CryptoJS.enc.Hex)
        }
    };
    return request.get(url + '?' + querystring.stringify(payload), config);
}