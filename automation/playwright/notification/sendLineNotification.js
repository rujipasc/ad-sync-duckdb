const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;
const LINE_USER_ID = process.env.LINE_USER_ID;

// ฟังก์ชันส่ง LINE (แก้ไข Syntax แล้ว)
async function sendLineNotification(number) {
    if (!LINE_ACCESS_TOKEN || !LINE_USER_ID) {
        console.error("❌ Missing LINE_ACCESS_TOKEN or LINE_USER_ID");
        return;
    }

    const url = 'https://api.line.me/v2/bot/message/push';

    // แก้ไข Syntax JSON Object ให้ถูกต้อง
    const payload = {
        to: LINE_USER_ID,
        messages: [
            {
                type: "flex",
                altText: `Login Code: ${number}`,
                contents: {
                    type: "bubble",
                    body: {
                        type: "box",
                        layout: "vertical",
                        contents: [
                            {
                                type: "text",
                                text: "🔐 CardX Login Request",
                                weight: "bold",
                                color: "#1DB446", // LINE Green
                                size: "sm"
                            },
                            {
                                type: "text",
                                text: number, // ใช้ตัวแปร number ที่รับเข้ามา
                                weight: "bold",
                                size: "4xl",
                                align: "center",
                                margin: "lg",
                                color: "#000000"
                            },
                            {
                                type: "text",
                                text: "Please verify in Authenticator app",
                                size: "xs",
                                color: "#aaaaaa",
                                align: "center",
                                margin: "md"
                            }
                        ]
                    }
                }
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("❌ Failed to send LINE:", response.status, await response.text());
        } else {
            console.log("✅ LINE Notification sent!");
        }
    } catch (error) {
        console.error("❌ Network error sending LINE:", error);
    }
}