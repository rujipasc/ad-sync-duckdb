import "dotenv/config";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { HttpsProxyAgent } from "https-proxy-agent";
import { fromSSO } from "@aws-sdk/credential-providers";
import dns from "dns/promises";

async function getS3Client() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  let agent = null;

  try {
    // ทดสอบว่าเจอชื่อ skyproxy ไหม (ถ้าอยู่บ้านจะ Error ตรงนี้)
    await dns.lookup(process.env.DNS_LOOKUP);
    console.log("🏢 Corporate Network detected: Using Skyproxy");
    agent = new HttpsProxyAgent(proxyUrl);
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // ปิด SSL เฉพาะตอนอยู่บริษัท
  } catch (e) {
    console.log("🏠 Home/Public Network detected: Direct Connection");
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'; // เปิด SSL ปกติเพื่อความปลอดภัย
  }

  const commonHandler = new NodeHttpHandler({
    httpsAgent: agent, // ถ้าเป็น null มันจะต่อตรงอัตโนมัติ
  });

  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: fromSSO({ 
      profile: process.env.AWS_PROFILE,
      clientConfig: { requestHandler: commonHandler }
    }),
    requestHandler: commonHandler,
  });
}

async function testS3() {
  try {
    const s3 = await getS3Client();
    const cmd = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET,
      Prefix: "lgc/scb/inbound/AD/",
      MaxKeys: 5
    });

    const res = await s3.send(cmd);
    console.log("✅ Connected to S3");
    res.Contents?.forEach(o => console.log(` - ${o.Key}`));
  } catch (err) {
    console.error("❌ S3 connection failed");
    console.error(err.name, err.message);
  }
}

testS3();