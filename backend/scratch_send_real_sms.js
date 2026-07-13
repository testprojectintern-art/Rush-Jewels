async function sendRealSms() {
    const url = 'https://smslenz.lk/api/send-sms';
    
    // According to the documentation, parameters are:
    // user_id, api_key, sender_id, contact, message
    const params = new URLSearchParams({
        user_id: '2113',
        api_key: 'b2ae1961-39fd-44e3-b23d-13ab495274ed',
        sender_id: 'Rush Jewels',
        contact: '+94777498608',
        message: 'Rush Jewels POS integration test message!'
    });

    // Let's try POST with URL-encoded parameters (highly compatible with PHP backends)
    try {
        console.log(`Sending URL-encoded POST to ${url}...`);
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Response: ${text}`);
    } catch (err) {
        console.error('POST Error:', err);
    }

    // Let's also try GET just in case
    try {
        const getUrl = `${url}?${params.toString()}`;
        console.log(`Sending GET to ${getUrl}...`);
        const res = await fetch(getUrl, {
            method: 'GET'
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Response: ${text}`);
    } catch (err) {
        console.error('GET Error:', err);
    }
}

sendRealSms();
