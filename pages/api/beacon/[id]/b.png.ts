import type { NextApiRequest, NextApiResponse } from "next";

import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.V_ACCESS_KEY_ID,
  secretAccessKey: process.env.V_SECRET_ACCESS_KEY,
  region: "ap-southeast-2",
});

const imageBytes = [
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137,
  0, 0, 0, 6, 98, 75, 71, 68, 0, 255, 0, 255, 0, 255, 160, 189, 167, 147, 0, 0, 0, 11, 73, 68, 65, 84, 8, 153, 99, 96,
  0, 2, 0, 0, 5, 0, 1, 98, 85, 50, 136, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const ip = String(req.headers["x-forwarded-for"] ?? req.headers["x-real-ip"]);

    const geoResponse = await fetch("https://ipwho.is/" + ip);
    const geo = await geoResponse.json();

    await new AWS.DynamoDB()
      .putItem({
        TableName: "user-agents",
        Item: {
          id: { S: String(req.query["id"]) },
          timestamp: { S: new Date().toISOString() },
          ip: { S: ip },
          user_agent: { S: req.headers["user-agent"] ?? "" },
          country_code: { S: geo.success ? geo.country_code : "" },
          city: { S: geo.success ? geo.city : "" },
          isp: { S: geo.success ? geo.connection.isp : "" },
          expires: { N: String(Date.now() + 3_600_000) },
        },
      })
      .promise();

    const buf = Buffer.from(imageBytes);

    res.setHeader("content-type", "image/png");
    res.setHeader("content-length", buf.length);
    res.status(200).write(buf);
    res.end();
  } catch (err) {
    res.status(500).send(err instanceof Error ? err.message : "Unknown error.");
  }
}
