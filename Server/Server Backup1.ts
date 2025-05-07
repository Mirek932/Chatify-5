import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from "fs";
import { fileURLToPath } from 'url';
import { writeFile, readFile } from 'fs/promises';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

var UsersMessagesPerMinute = new Map();
var ActiveUsers:Array<string> = new Array<string>();

type ChatMessage = {
  ChatRoom: string;
  Message: string;
  User: string;
};

type Room = {
  DisplayName: string;
  RoomID: string;
  StaticID: string;
};

const Messages: ChatMessage[] = await LoadMessages();
const Rooms: Room[] = await LoadRooms();

var currentlyActiveChattingChatters = ["CACCs"]; //short CACCs
 
const MessagesPerMinuteLimit : number = 20;

// Middleware für statische Dateien
app.use(express.static(path.join(__dirname, '../dist/client')));

// Typisierte Route-Handler
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../dist/client/'+req));
});

// Socket.IO mit Typen
io.on('connection', (socket) => {
  console.log('Neue Verbindung:', socket.id);
  
  var LoadHub = setTimeout(()=>{
    if(socket)
    {
      ClientLoadMessages(socket.id, "0404");
      ClientLoadRooms(socket.id);
      clearTimeout(LoadHub);
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
      socket.emit("single chat message", "Du hast dein Limit von Nachrichten erreicht! Warte eine Minute...",socket.id);
      socket.emit("info box", "Du hast dein Limit von Nachrichten erreicht! Warte eine Minute...");
    }
  });
  socket.on("Change Username", (uname: string)=>{
    socket.emit("Change Username", ChangeUsername(uname), socket.id);
  });
  socket.on("reload messages", (channel: string)=>{
    ClientLoadMessages(socket.id, channel);
  });

  socket.on("get CACCs", (channel:string)=>{
      socket.emit("send active CACCs", currentlyActiveChattingChatters.includes(channel));
  });

  socket.on("create chat room", (channelID: string, channelDisplayName: string, isPublic:boolean=true, staticID:string="FFFFFFFFF")=>{
    console.log("Chat room ${channelDisplayName} created with id ${channelID}")
    var StaticID = "public";
    if(!isPublic)
      StaticID=staticID;
    var Room:Room = {
      DisplayName: channelDisplayName,
      RoomID: channelID,
      StaticID: StaticID
    };
    Rooms.push(Room);
    SaveRooms();
    io.emit("create chat room", channelID, channelDisplayName, StaticID);
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
async function ClientLoadRooms(clientID:string) {
  Rooms.forEach((room:Room)=>{
    io.emit("single create chat room", clientID, room.RoomID, room.DisplayName, room.StaticID);
  });
}

async function SaveRooms() {
  const jsonString = JSON.stringify(Rooms,null,2);
  await writeFile("./Server/Databank/rooms.json", jsonString, "utf-8");
  console.log("Successfuly Saved the Rooms!");
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
async function LoadRooms(): Promise<Room[]> {
  const fileContent = await readFile("./Server/databank/rooms.json", "utf-8");
  const rooms: Room[] = JSON.parse(fileContent);
  return rooms;
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