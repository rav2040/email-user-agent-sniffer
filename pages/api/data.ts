import type { NextApiRequest, NextApiResponse } from "next";

import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.V_ACCESS_KEY_ID,
  secretAccessKey: process.env.V_SECRET_ACCESS_KEY,
  region: "ap-southeast-2",
});

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await new AWS.DynamoDB().scan({ TableName: "user-agents" }).promise();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send(err instanceof Error ? err.message : "Unknown error.");
  }
}
