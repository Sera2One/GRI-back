// const express = require("express");
// const { ExpressPeerServer } = require("peer");
// const  cors = require("cors");

// const app = express();

// const http = require("http");

// const server = http.createServer(app);
// const peerServer = ExpressPeerServer(server, {
// 	debug: true,
//   credentials: true,
//   //key:"ajoss"
// });

// app
//   .use(
//     cors({
//       origin: '*' ,
//       allowedHeaders: ['Content-Type', 'Authorization'], 
//       credentials: true,
//     })
//   )

// app.use("/peerjs", peerServer);
// app.disable("etag");

// app.get("/sera", (req, res, next) => res.json({ error: `Le nom du groupe existe déjà` }));

// server.listen(9000);





// const { PeerServer } = require("peer");

// const customGenerationFunction = () =>
// 	(Math.random().toString(36) + "0000000000000000000").substr(2, 16);

// const peerServer = PeerServer({
// 	port: 9000,
// 	path: "/myapp",
// 	generateClientId: customGenerationFunction,
// });















import express from "express";
import cors from "cors";
import { ExpressPeerServer } from "peer";
import https from "https";
import http from "http";
import fs from 'node:fs';
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  key: fs.readFileSync( path.join(__dirname, "./src/certs/SSL/armp.sera.local+6-key.pem"), 'utf-8'),//Change Private Key Path here
  cert: fs.readFileSync( path.join(__dirname,"./src/certs/SSL/armp.sera.local+6.pem"), 'utf-8')   //Change Main Certificate Path here
  // ca: path.join(__dirname,'certs/server.csr'),             //Change Intermediate Certificate Path here
  };

//const server = https.createServer( options,app);
const server = http.createServer(app);

const peerServer = ExpressPeerServer(server, {
	debug: true,
  credentials: true,
  //key:"ajoss",
  //allow_discovery: true,
});

app
  .use(
    cors({
      origin: 'http://localhost:39207' ,
      allowedHeaders: ['Content-Type', 'Authorization'], 
      credentials: true,
    })
  )

app.use("/peerjs", peerServer);
app.disable("etag");

app.get("/sera", (req, res, next) => res.json({ error: `Le nom du groupe existe déjà` }));

server.listen(9000);

