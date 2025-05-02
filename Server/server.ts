import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from "fs";
import { fileURLToPath } from 'url';
import { writeFile, readFile } from 'fs/promises';
//@ts-ignore
import NodeMediaServer from "node-media-server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);


// ── 1) Media-Server konfigurieren ─────────────────────────────
const config = {
  rtmp: {
    port: 1935,  // RTMP Port
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,  // HTTP Port
    allow_origin: '*'
  },
  trans: {
    ffmpeg: 'C:/ffmpeg/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]'
      }
    ]
  }
};

const nms = new NodeMediaServer(config);
nms.run();


var UsersMessagesPerMinute = new Map();
var ActiveUsers:Array<string> = new Array<string>();

type ChatMessage = {
  ChatRoom: string;
  Message: string;
  User: string;
};

const Messages: ChatMessage[] = await LoadMessages();

const MessagesPerMinuteLimit : number = 20;


// Middleware für statische Dateien
app.use(express.static(path.join(__dirname, '../dist/client')));
// ── 2) HLS-Ordner als static bereitstellen ─────────────────────
app.use('/streams', express.static('media/live'));

// Typisierte Route-Handler
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../dist/client/'+req));
});
app.get('/streams', (req:Request, res:Response)=>{
  res.writeHead(200, {
    "Content-Type": "multipart/x-mixed-replace; boundary=frame",
    "Cache-Control": "no-cache",
    "Connection": "close",
    "Pragma": "no-cache"
  });
  const interval = setInterval(() => {
    try {
      const img = fs.readFileSync(path.join(__dirname, "../Streams/Demo/" + "frame.jpg"));
      res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${img.length}\r\n\r\n`);
      res.write(img);
      res.write("\r\n");
    } catch (e) {
      console.error("Image read error:", e);
    }
  }, 100); // 10 fps

  req.on("close", () => clearInterval(interval));
});

// Socket.IO mit Typen
io.on('connection', (socket) => {
  console.log('Neue Verbindung:', socket.id);
  
  var waitForClientToInit = setTimeout(()=> {
    if(socket.id)
    {
      ClientLoadMessages(socket.id, "0404");
      clearTimeout(waitForClientToInit);
    }
    }, 1000);

  socket.on('chat message', (msg: string, author: string, channel:string) => {
    console.log(author + "> " + msg + " < " + channel);
    var UMPM : number = UsersMessagesPerMinute.get(socket.id);
    if(UMPM)
      UsersMessagesPerMinute.set(socket.id,UMPM+1);
    else
    {
      UMPM = 1;
      UsersMessagesPerMinute.set(socket.id, 1);
    }
    if(UMPM < MessagesPerMinuteLimit)
    {
      io.emit("chat message", author + '> ' + msg, channel);
      Messages.push({
        ChatRoom: channel,
        Message: msg,
        User: author
      });
      SaveMessages();
    }
    else
    {
      io.emit("single chat message", "Du hast dein Limit von Nachrichten erreicht! Warte eine Minute...",socket.id);
      io.emit("info box", "Du hast dein Limit von Nachrichten erreicht! Warte eine Minute...");
    }
  });
  socket.on("Change Username", (uname: string)=>{
    io.emit("Change Username", ChangeUsername(uname), socket.id);
  });
  socket.on("reload messages", (channel: string)=>{
    ClientLoadMessages(socket.id, channel);
  });

  socket.on('disconnect', () => {
    console.log('Client getrennt:', socket.id);
  });
});

async function ClientLoadMessages(clientID:string, chatRoom:string) {
  Messages.forEach((msg:ChatMessage)=>{
    if(msg.ChatRoom === chatRoom)
      io.emit("single chat message", msg.User + "> " + msg.Message, clientID);
  });
}

async function SaveMessages() {
  const jsonString = JSON.stringify(Messages,null,2);
  await writeFile("./Server/Databank/messages.json", jsonString, "utf-8");
  console.log("Successfuly Saved the Messages!");
}

async function LoadMessages(): Promise<ChatMessage[]> {
  const fileContent = await readFile("./Server/databank/messages.json", "utf-8");
  const messages: ChatMessage[] = JSON.parse(fileContent);
  return messages;
}

function ChangeUsername(uname:string):boolean
{
  ActiveUsers.forEach((item:string)=>{
    if(item.toLowerCase() == uname.toLowerCase())
      return false;
  });
  ActiveUsers.push(uname);
  return true;
}

var timer = setInterval(()=>{
  UsersMessagesPerMinute.forEach((value, key: string)=>UsersMessagesPerMinute.set(key, 0));
  console.log("timer");
}, 1000*60);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server läuft auf http://192.168.178.1:${PORT}`);
});