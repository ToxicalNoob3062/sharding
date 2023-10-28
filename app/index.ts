import express, { Request, Response } from "express";
import { Client } from "pg";
import crypto, { BinaryLike } from "crypto";
import HashRing from "hashring";

//declare an express app!
const app = express();
const port = 80;

//declaring where shard port exists!
const shardsAdressPorts = ["5434", "5435", "5436"];

//make hash
const hashRange = new HashRing(shardsAdressPorts);

//create client instances for shards
let clients: { [key: string]: Client } = {};

for (let address of shardsAdressPorts) {
  const client = (clients[address] = new Client({
    host: "host.docker.internal",
    port: +address,
    user: "postgres",
    password: "postgres",
    database: "postgres",
  }));

  //connect to those shards
  try {
    await client.connect();
    console.log(`pgshard@${address} connected!`);
    //add nodes to range
    hashRange.add(`${address}`);
  } catch (err) {
    console.log((err as Error)?.message);
  }
}

//setting up api routes;
app.get("/:urlId(*)", async (req: Request, res: Response) => {
  const urlId = req.params?.urlId;
  const serverId = hashRange.get(urlId) as string;
  const url = (
    await clients[serverId].query(
      "SELECT url FROM url_table WHERE url_id = $1",
      [urlId]
    )
  )?.rows[0]?.url;

  return url
    ? res.send({
        url,
      })
    : res.sendStatus(404);
});

app.post("/", async (req, res) => {
  //getting url given by user
  const url = req.query.url as BinaryLike;
  //constence hashing
  const hash = crypto.createHash("sha256").update(url).digest("base64");
  const urlId = hash.substring(0, 5);
  const server = hashRange.get(urlId) as string;
  //store url in db
  await clients[server].query(
    "INSERT INTO URL_TABLE (URL,URL_ID) VALUES ($1,$2)",
    [url, urlId]
  );
  //sending back response
  res.send({
    serverId: server,
    url: `http://${req.hostname}:${port}/${urlId}`,
  });
});

app.listen(port, () => console.log("Listening..."));
