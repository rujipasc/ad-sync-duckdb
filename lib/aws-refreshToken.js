import { execSync, spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PS_SCRIPT_PATH = path.join(__dirname, "../script/aws-authen.ps1");

export const ensureSsoAuthenticated = async () => {
    const profile = process.env.AWS_PROFILE || "cardx";
    const proxy = process.env.HTTPS_PROXY;

    console.log(`🔍 [Auth] Checking AWS SSO session [${profile}]...`);

    try {
        execSync(`aws sts get-caller-identity --profile ${profile} --no-verify-ssl`, {
            env: { ...process.env, HTTPS_PROXY: proxy, HTTP_PROXY: proxy },
            stdio: "ignore"
        });
        console.log("✅ [Auth] SSO Session is active.")
    } catch (e) {
        console.log("⚠️ [Auth] Session expired. Running PowerShell login...");

        return new Promise((resolve, reject) => {
            const ps = spawn("powershell.exe", [
                "-ExecutionPolicy", "Bypass",
                "-File", PS_SCRIPT_PATH
            ], { stdio: "inherit" });

            ps.on("close", (code) => {
                code === 0 ? resolve() : reject(new Error("PowerShell login failed"));
            });
        });
    }

}
