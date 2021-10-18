const WS = require("ws");
const https = require('https');
const fs = require('fs');

const server = https.createServer({
  cert: fs.readFileSync('./cert.cert'),
  key: fs.readFileSync('./key.pem')
});

let WSS = new WS.Server({
  port: 8080,
  server: server
});

let t, o, ip = "0";
require("node-fetch")("https://ourworldofpixels.com/api").then(i => {return i.text()}).then(i => {i = JSON.parse(i); ip = i.yourIp; console.log(i.yourIp)});

WSS.on('connection', async function connection(ws, req) {
  let query = req.url.split("=")[1];
  t = query;
  let webs;
  if(t !== "WS-STATUS") {
    webs = new WS(t, {
      origin: req.headers.origin
    });
    webs.onclose = () => {ws.close()};
    webs.onmessage = msg => {
      if(webs.readyState === 1) {
      console.log(`BACK: ` + msg.data);
      ws.send(msg.data)
      } else {
      console.log(`BACK: ` + msg.data);
      setTimeout(ws.send(msg.data), 1500);
      }
    };
  }
  
  ws.on('message', function(message) {
    if(message === "WS-STATUS") return ws.send(`${ip},${WSS.clients.size}`);
    if(webs.readyState === 1) {
      console.log(`GO: ` + message);
      webs.send(message);
    } else {
      console.log(`GO: ` + message.data);
    setTimeout(() => {webs.send(message.data)}, 2500);
    }
  })
ws.on('close', () => {
  webs.close();
})
});