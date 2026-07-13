const paths = [
    'api/v1/send',
    'api/send',
    'api/v1/send-sms',
    'api/send-sms',
    'api/v1/sms/send',
    'api/v1/sms',
    'api/sms',
    'sms/send',
    'api/v3/sendsms',
    'api/v2/sendsms',
    'api/sendsms',
    'api/v1/sendsms',
    'api/v2/send',
    'api/v3/send',
    'api/v1/sms/send-sms',
    'api/sms/send-sms',
];

const credentials = {
    userId: 2113,
    user_id: 2113,
    userID: 2113,
    apiKey: "b2ae1961-39fd-44e3-b23d-13ab495274ed",
    api_key: "b2ae1961-39fd-44e3-b23d-13ab495274ed",
    senderId: "Rush Jewels",
    sender_id: "Rush Jewels",
    senderID: "Rush Jewels",
    recipient: "94777498608",
    recipient_number: "94777498608",
    to: "94777498608",
    number: "94777498608",
    message: "Rush Jewels POS Test!",
    msg: "Rush Jewels POS Test!",
    text: "Rush Jewels POS Test!"
};

async function testAll() {
    console.log("Scanning smslenz.lk endpoints...");
    const host = 'https://smslenz.lk';

    for (const path of paths) {
        const url = `${host}/${path}`;
        
        // 1. Test POST JSON
        try {
            console.log(`\n[POST JSON] Testing: ${url}`);
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
                signal: AbortSignal.timeout(3000)
            });
            const text = await res.text();
            console.log(`Status: ${res.status}`);
            console.log(`Response snippet: ${text.slice(0, 300)}`);
            if (res.status === 200 && (text.includes('success') || text.includes('campaign_id') || text.includes('sent'))) {
                console.log(`>>> SUCCESS POST JSON: ${url} <<<`);
                return;
            }
        } catch (err) {
            console.log(`POST failed: ${err.message}`);
        }

        // 2. Test GET (Query Params)
        try {
            // Test query param combinations
            const params = new URLSearchParams({
                user_id: '2113',
                api_key: 'b2ae1961-39fd-44e3-b23d-13ab495274ed',
                sender_id: 'Rush Jewels',
                recipient: '94777498608',
                to: '94777498608',
                message: 'Rush Jewels POS Test GET!'
            });
            const getUrl = `${url}?${params.toString()}`;
            console.log(`[GET] Testing: ${getUrl.slice(0, 80)}...`);
            const res = await fetch(getUrl, {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            const text = await res.text();
            console.log(`Status: ${res.status}`);
            console.log(`Response snippet: ${text.slice(0, 300)}`);
            if (res.status === 200 && (text.includes('success') || text.includes('campaign_id') || text.includes('sent'))) {
                console.log(`>>> SUCCESS GET: ${url} <<<`);
                return;
            }
        } catch (err) {
            console.log(`GET failed: ${err.message}`);
        }
    }
}

testAll();
