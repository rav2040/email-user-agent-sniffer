import type { NextApiRequest, NextApiResponse } from "next";

import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.V_ACCESS_KEY_ID,
  secretAccessKey: process.env.V_SECRET_ACCESS_KEY,
  region: "ap-southeast-2",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const params = {
      Destination: {
        ToAddresses: ["rav2040@gmail.com"],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
              <html>
                <body>
                  <p>some text</p>
                  <img src="https://email-user-agent-sniffer.vercel.app/api/sniff.png" />
                </body>
              </html>
            `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Test email",
        },
      },
      Source: "no-reply@rav2040.xyz",
    };

    await new AWS.SES().sendEmail(params).promise();

    res.status(204).end();
  } catch (err) {
    res.status(500).send(err instanceof Error ? err.message : "Failed to send.");
  }
}
