const TEAMS_FLOW_URL = process.env.TEAMS_FLOW_URL;
const RUNNER_EMP_ID = process.env.RUNNER_EMP_ID;
const RUNNER_NAME = process.env.RUNNER_NAME;

// ฟังก์ชันส่ง Teams Notification
export async function sendTeamsNotification(number) {
    if (!TEAMS_FLOW_URL) {
        console.error("❌ Missing TEAMS_FLOW_URL");
        return;
    }

    const payload = {
        type: "mfa_request",
        jobName: "humatrix-login",
        system: "CardX MyHumatrix",
        title: "CardX Login Request",
        mfaNumber: String(number),
        message: "Please verify in Microsoft Authenticator app",
        requestedAt: new Date().toISOString(),
        empId: RUNNER_EMP_ID || "",
        runnerName: RUNNER_NAME || ""
    };

    const headers = {
        "content-type": "application/json"
    };

    try {
        const response = await fetch(TEAMS_FLOW_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        console.log("📨 Teams Flow Response:", response.status, responseText);
        if (!response.ok) {
            console.error("❌ Failed to call Teams Flow:", response.status, responseText);
            return;
        }

        console.log("✅ Teams notification sent!");
        if (responseText) {
            console.log("📨 Flow response:", responseText);
        }
    } catch (error) {
        console.error("❌ Error sending Teams notification:", error);
    };
};