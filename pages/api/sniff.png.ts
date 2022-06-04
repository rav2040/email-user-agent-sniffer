import type { NextApiRequest, NextApiResponse } from "next";

import AWS from "aws-sdk";
import { nanoid } from "nanoid";

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
  const response = await fetch("https://ipwho.is/" + req.socket.remoteAddress);
  const json = await response.json();

  new AWS.DynamoDB()
    .putItem({
      TableName: "user-agents",
      Item: {
        id: { S: nanoid() },
        timestamp: { S: new Date().toISOString() },
        ip: { S: req.socket.remoteAddress ?? "" },
        country_code: { S: json.success ? json.country_code : "" },
        city: { S: json.success ? json.city : "" },
        isp: { S: json.success ? json.connection.isp : "" },
        user_agent_string: { S: req.headers["user-agent"] ?? "" },
      },
    })
    .promise()
    .then(console.log)
    .catch(console.error);

  const buf = Buffer.from(imageBytes);

  res.setHeader("content-type", "image/png");
  res.setHeader("content-length", buf.length);
  res.status(200).write(buf);
  res.end();
}
