import type { NextPage } from "next";

import Head from "next/head";
import Img from "next/image";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

type DBRecord = {
  id: { S: string };
  timestamp?: { S: string };
  ip?: { S: string };
  country_code?: { S: string };
  city?: { S: string };
  isp?: { S: string };
  tag?: { S: string };
  user_agent?: { S: string };
};

const columns: Array<keyof DBRecord> = ["timestamp", "ip", "country_code", "city", "isp", "tag", "user_agent"];

const Home: NextPage = () => {
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<DBRecord[]>([]);

  const rows = data
    .map((record) =>
      columns.map((col) => {
        const cell = record[col]?.S ?? "";
        return col === "timestamp" ? new Date(cell) : cell;
      })
    )
    .sort((a, b) => {
      const dateA = a.find((value): value is Date => value instanceof Date);
      const dateB = b.find((value): value is Date => value instanceof Date);
      return dateA && dateB ? dateB.getTime() - dateA.getTime() : 1;
    });

  useEffect(() => {
    fetch("/api/data").then(async (res) => {
      const { Items }: { Items: DBRecord[] } = await res.json();
      setData(Items);
    });
  }, []);

  const onInputSubmit = async () => {
    console.log("bang");
    setSubmitting(true);
    await fetch("/api/send?to=" + input);
    setSubmitting(false);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>User Agent Sniffer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div style={{ marginBottom: "1rem" }}>
          Enter an email address and press submit to send an email with a tracking beacon.
        </div>
        <div style={{ marginBottom: "4rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", position: "relative" }}>
            <input
              type={"email"}
              placeholder={"Email address"}
              size={30}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button disabled={submitting} onClick={onInputSubmit}>
              Submit
            </button>
            <div
              style={{ display: submitting ? "block" : "none", paddingLeft: "1rem", position: "absolute", right: -50 }}
            >
              <Img src={"/rocket.gif"} alt={"Loading indicator"} width={30} height={30} loading={"eager"} />
            </div>
          </div>
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          The table below will automatically update when an email is opened. All logged data is purged after one hour.
        </div>
        <table>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={styles.th}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((value, j) => (
                  <td key={j} style={{ padding: "8px" }}>
                    {value instanceof Date ? value.toLocaleString() : value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default Home;
