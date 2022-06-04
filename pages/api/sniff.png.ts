import type { NextApiRequest, NextApiResponse } from "next";

import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { createCanvas } from "canvas";
import { nanoid } from "nanoid";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = await fetch("https://ipwho.is/" + req.socket.remoteAddress);
  const json = await response.json();

  const client = new DynamoDBClient({ region: "ap-southeast-2" });
  const command = new PutItemCommand({
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
  });

  client.send(command).then(console.log).catch(console.error);

  const buf = createCanvas(1, 1).toBuffer("image/png");
  res.setHeader("content-type", "image/png");
  res.setHeader("content-length", buf.length);
  res.status(200).write(buf);
  res.end();
}
