async function inspect() {
    const url = 'https://smslenz.lk/api/send-sms';
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
        message: "Rush Jewels Test!",
        msg: "Rush Jewels Test!",
        text: "Rush Jewels Test!"
    };

    try {
        console.log(`Sending POST JSON to ${url}...`);
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Content-Type: ${res.headers.get('content-type')}`);
        console.log(`Body (first 1000 chars):`);
        console.log(text.slice(0, 1000));
    } catch (err) {
        console.error('Error:', err);
    }
}

inspect();
