import type { NextApiRequest, NextApiResponse } from "next";

import { createCanvas } from "canvas";
import { nanoid } from "nanoid";

import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.V_ACCESS_KEY_ID,
  secretAccessKey: process.env.V_SECRET_ACCESS_KEY,
  region: "ap-southeast-2",
});

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

  const buf = createCanvas(1, 1).toBuffer("image/png");
  res.setHeader("content-type", "image/png");
  res.setHeader("content-length", buf.length);
  res.status(200).write(buf);
  res.end();
}
