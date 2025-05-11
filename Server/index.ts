import express, { Request, Response } from 'express';
import { createServer } from "http"
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import registerChatHandlers from './listeners/Chat.js';
import registerRoomHandlers from './listeners/Rooms.js';
import registerUserHandlers from './listeners/User.js';
import { rateLimit } from 'express-rate-limit';
import escapeHTML from 'escape-html';
import { writeFile, readFile } from 'fs/promises';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sslOptions = {
  key: readFile(path.join(__dirname, "./cert/key.pem")),
  cert: readFile(path.join(__dirname, "./cert/cert.pem"))
};

const PORT = process.env.PORT || 3000;
const IPADRESS = `localhost:${PORT}`;

const app = express();
const server = createServer(app);
const io = new Server(server);

var limiter = rateLimit({
  windowMs: 10*60*1000,
  max: 100
});

app.set("trust proxy", 1);

// Middleware für statische Dateien
app.use(limiter);
app.use(express.static(path.join(__dirname, '../dist/client')));
app.use('/static', express.static(path.join(__dirname, '../dist/client/static')));

// Typisierte Route-Handler
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../dist/client/'+req));
});


app.get('/invite', (req, res) => {
  const channelID       = escapeHTML(String(req.query.channelID       || 'Unknown'));
  const channelName     = escapeHTML(String(req.query.channelDisplayName || 'Chatroom'));

  res.setHeader('Cache-Control','no-cache, no-store, must-revalidate');
  res.send(`<!DOCTYPE html>
  <html lang="de">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>

      <!-- Open Graph für Discord Preview -->
      <meta property="og:title"       content="Einladung zu ${channelName}" />
      <meta property="og:description" content="Du wurdest in den Chatraum '${channelName}' (${channelID}) eingeladen!" />
      <meta property="og:image"       content="${IPADRESS}/static/chatifyInvite.png" />
      <meta property="og:url"         content="${IPADRESS}/invite?channelID=${encodeURIComponent(channelID)}&channelDisplayName=${encodeURIComponent(channelName)}" />
      <meta name="twitter:card"       content="summary_large_image"/>

      <!-- kurz warten, dann auf die echte UI weiterleiten -->
      <meta http-equiv="refresh" content="2;url=/invite.html?channelID=${encodeURIComponent(channelID)}&channelDisplayName=${encodeURIComponent(channelName)}"/>
      <title>Einladung zu ${channelName}</title>
    </head>
    <body>
      <p>Du wirst gleich weitergeleitet…</p>
    </body>
  </html>`);
});


// Socket.IO mit Typen
io.on('connection', (socket) => {
  console.log('Neue Verbindung:', socket.id);

  // Register the Handlers
  registerChatHandlers(socket, io);
  registerRoomHandlers(socket, io);
  registerUserHandlers(socket, io);

  socket.on('disconnect', () => {
    console.log('Client getrennt:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server läuft auf http://${IPADRESS} (Real:${PORT})`);
});