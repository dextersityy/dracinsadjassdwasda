
async function testNetshort() {
    const NETSHORT_BASE = 'https://api.sansekai.my.id/api/netshort';
    const headers = { 'Content-Type': 'application/json' };

    console.log("--- Testing Homepage (Theaters) ---");
    try {
        const res = await fetch(`${NETSHORT_BASE}/theaters`, { headers });
        console.log("Status:", res.status);
        if (res.ok) {
            const json = await res.json();
            console.log("Response Type:", typeof json, Array.isArray(json) ? "Array" : "Object");
            if (Array.isArray(json) && json.length > 0) {
                console.log("First Item Keys:", Object.keys(json[0]));
                console.log("First Item Sample:", JSON.stringify(json[0], null, 2));
            } else {
                console.log("JSON Preview:", JSON.stringify(json, null, 2).substring(0, 500));
            }
        }
    } catch (e) {
        console.error("Homepage Error:", e);
    }

    console.log("\n--- Testing Search ---");
    try {
        const res = await fetch(`${NETSHORT_BASE}/search?query=ceo`, { headers });
        console.log("Status:", res.status);
        if (res.ok) {
            const json = await res.json();
            console.log("Search Result Preview:", JSON.stringify(json, null, 2).substring(0, 500));
        }
    } catch (e) {
        console.error("Search Error:", e);
    }

    console.log("\n--- Testing Episodes ---");
    try {
        // Using ID from previous list: 1997949622037180417
        const res = await fetch(`${NETSHORT_BASE}/allepisode?shortPlayId=1997949622037180417`, { headers });
        console.log("Status:", res.status);
        if (res.ok) {
            const json = await res.json();
            console.log("Episodes Response Type:", typeof json, Array.isArray(json) ? "Array" : "Object");
            console.log("Episodes Preview:", JSON.stringify(json, null, 2).substring(0, 500));
        }
    } catch (e) {
        console.error("Episodes Error:", e);
    }
}

testNetshort();
