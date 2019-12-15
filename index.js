const request = require("request-promise-native");
const CryptoJS = require('crypto-js');
const querystring = require('querystring');
const fs = require('fs');

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
                const serverTimeObj = await request.get('https://trade.coss.io/c/api/v1/time', {json: true});
                const now = Date.now();
                console.log('Server time: ' + serverTimeObj.server_time);
                const balance = await getBalance(now);
                if (balance.includes('html')) {
                    const balance2 = await getBalance(serverTimeObj.server_time);
                    if (balance2.includes('html')) {
                        fs.writeFileSync(process.cwd() + '/log.txt', balance);
                        throw 'Invalid keys';
                    } else {
                        console.log('Your system time is not correct');
                        console.log('Coss.io Server Time: ', (new Date(serverTimeObj.server_time)).toTimeString());
                        console.log('Your Time: ', (new Date(now)).toTimeString());
                        throw 'Invalid time';
                    }
                }
                console.log('Success');
            } catch (e) {
                fs.writeFileSync(process.cwd() + '/log.txt', JSON.stringify(e));
                console.log('Error');
                console.log(e.error);
            }

            await askForKeys();
        })
    })
}

function getBalance(timestamp) {
    return privateGet("https://trade.coss.io/c/api/v1/account/balances", {timestamp: timestamp, recvWindow: 9999999999});
}

function privateGet(url, payload) {
    console.log('Request time: ' + payload.timestamp);
    const config = {
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': publicKey,
            'Signature': CryptoJS.HmacSHA256(querystring.stringify(payload), privateKey).toString(CryptoJS.enc.Hex),
            'X-Requested-With' : 'XMLHttpRequest'
        }
    };
    return request.get(url + '?' + querystring.stringify(payload), config);
}