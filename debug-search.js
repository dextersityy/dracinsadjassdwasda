
const { publicApi } = require('./lib/public-api');
const { ProxyAgent } = require('undici');

// Mock fetch and process env for node script without building
global.fetch = require('undici').fetch;
process.env.PROXY_URL = 'http://rltdhyuc:sdzsyd6npazz@31.59.20.176:6754';

async function test() {
    console.log('Searching for "insinyur modern di desa kuno"...');
    const searchResults = await publicApi.searchDramas('insinyur modern di desa kuno');
    console.log('Search Results:', JSON.stringify(searchResults, null, 2));

    if (searchResults.length > 0) {
        const firstBookId = searchResults[0].bookId;
        console.log(`\nFetching detail for bookId: ${firstBookId}...`);
        const detail = await publicApi.getDramaDetail(firstBookId);
        console.log('Detail Result:', JSON.stringify(detail, null, 2));
    } else {
        console.log('No dramas found.');
    }
}

test();
