
const { publicApi } = require('./lib/public-api');
const { ProxyAgent } = require('undici');

// Mock fetch and process env for node script without building
global.fetch = require('undici').fetch;
process.env.PROXY_URL = 'http://rltdhyuc:sdzsyd6npazz@31.59.20.176:6754'; // Use the proxy from env

async function test() {
    console.log('--- TEST 1: Ultimatum Mafia (Working) ---');
    const res1 = await publicApi.searchDramas('ultimatum mafia');
    if (res1.length > 0) {
        console.log('Result[0]:', JSON.stringify(res1[0], null, 2));
    } else {
        console.log('No results for Ultimatum Mafia');
    }

    console.log('\n--- TEST 2: Insinyur Modern di Desa Kuno (Failing) ---');
    const res2 = await publicApi.searchDramas('insinyur modern di desa kuno');
    if (res2.length > 0) {
        console.log('Result[0]:', JSON.stringify(res2[0], null, 2));
    } else {
        console.log('No results for Insinyur Modern...');
    }
}

test();
