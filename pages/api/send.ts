import type { NextApiRequest, NextApiResponse } from "next";

import mailjet from "node-mailjet";
import { nanoid } from "nanoid";

const client = mailjet.connect(String(process.env.MAILJET_API_KEY), String(process.env.MAILJET_SECRET_KEY));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const to = req.query["to"];

    if (!to) throw Error(`Missing "to" query param.`);

    const params = {
      Messages: [
        {
          From: { Email: "no-reply@rav2040.xyz" },
          To: [{ Email: to }],
          Subject: "Email tracking beacon",
          HTMLPart: `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <title>Email tracking beacon</title>
                <style>
                  .desktop { display: initial; }
                  .mobile { display: none; }
                  @media (max-width: 600px) {
                    .desktop { display: none; }
                    .mobile { display: initial; }
                  }
                </style>
              </head>
              <body>
                <p>This email contains a tracking beacon which logs client data at https://email-user-agent-sniffer.vercel.app</p>
                <p>All logged data is purged after one hour.</p>
                <picture>
                  <source srcset="https://email-user-agent-sniffer.vercel.app/api/beacon/desktop/${nanoid()}/b.png" media="(min-width: 600px)">
                  <img src="https://email-user-agent-sniffer.vercel.app/api/beacon/mobile/${nanoid()}/b.png" />
                </picture>
              </body>
            </html>
          `,
        },
      ],
    };

    await client.post("send", { version: "v3.1" }).request(params);

    res.status(204).end();
  } catch (err) {
    res.status(500).send(err instanceof Error ? err.message : "Failed to send.");
  }
}
