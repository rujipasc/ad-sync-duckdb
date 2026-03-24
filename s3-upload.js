import "dotenv/config";
import { uploadToS3 } from "./lib/s3-helper.js";
import { ensureSsoAuthenticated } from "./lib/aws-refreshToken.js";
import path from "path";

async function uploadOnly() {
    try {
        console.log("☁️  Starting S3 Upload...\n");
        
        await ensureSsoAuthenticated();
        
        // ระบุไฟล์ที่ต้องการ upload ตรงนี้
        const filesToUpload = [
            "./output/S3/CARDX_EMPLOYEE.txt",
            // "../output/S3/ORG_STRUCTURE.txt", // เพิ่มไฟล์อื่นได้ตามต้องการ
        ];

        for (const localFile of filesToUpload) {
            const fileName = path.basename(localFile);
            const s3Key = `lgc/scb/inbound/AD/${fileName}`;
            
            await uploadToS3(localFile, s3Key);
        }
        
        console.log("\n✅ All files uploaded successfully!");
        process.exit(0);
    } catch (e) {
        console.error("❌ Upload Error:", e.message);
        process.exit(1);
    }
}

uploadOnly();