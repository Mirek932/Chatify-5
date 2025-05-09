// handlers/chatHandlers.ts
import { Server, Socket } from 'socket.io';
import { ChatMessage } from '../types/types.js';
import fs from "fs";
import { writeFile, readFile } from 'fs/promises';
import { channelMembers } from './Rooms.js';
import { currentTime } from './Time.js';
// MPM = Messages Per Minute
// CACCs = currentlyActiveChattingChatters

const MPM_LIMIT : number = 20;
var CACCs = ["CACC"]; //short CACCs

var UsersMPM = new Map();
var Messages: ChatMessage[] = await LoadMessages();

export default function registerChatHandlers(socket: Socket, io: Server) {
  var WaitForSocket = setInterval(()=>{
      if(socket)
      {
          ClientLoadMessages(socket.id, "0404", io);
          clearInterval(WaitForSocket);
      }
  }, 1000);

  socket.on('chat message', (msg:string, author:string, channel:string) => {
    console.log(author + "> " + msg + " < " + channel);
    

    var SocketMPM : number = UsersMPM.get(socket.id) || 1;
    if(SocketMPM)
      UsersMPM.set(socket.id,SocketMPM+1);
    if(SocketMPM < MPM_LIMIT)
    {
      // io.emit("chat message", author + '> ' + msg, channel);
      io.in(channel).emit("chat message", msg, channel, author, currentTime());
      Messages.push({
        ChatRoom: channel,
        Message: msg,
        User: author,
        Time: currentTime()
      });
      SaveMessages();
    }
    else
    {
      socket.emit("single chat message", "Du hast dein Limit von Nachrichten erreicht! Warte eine Minute...",socket.id);
      socket.emit("info box", "Du hast dein Limit von Nachrichten erreicht! Warte eine Minute...");
    }
  });

  socket.on("reload messages", (channel: string)=>{
     ClientLoadMessages(socket.id, channel, io);
  });

  socket.on("get CACCs", (channel:string)=>{
    socket.emit("send active CACCs", CACCs.includes(channel));
  });

  socket.on("set CACC", (channelID:string, isTyping:boolean)=>{
    var index:number = CACCs.indexOf(channelID);
    if(isTyping && !CACCs.includes(channelID))
      CACCs.push(channelID);
    else if(index !== -1)
      CACCs.slice(index, 1);
  });

  socket.on("delete message", (msg:string, room:string, author:string, time:string)=>{
    var targetMessage:ChatMessage = {
      Message: msg,
      ChatRoom: room,
      User: author,
      Time: time
    };
    console.log("Stage 1 " + targetMessage.Message + "-"+targetMessage.ChatRoom+"-"+targetMessage.User+"-"+targetMessage.Time);
      const index = Messages.findIndex(
          msg =>
            msg.ChatRoom === targetMessage.ChatRoom &&
            msg.Message === targetMessage.Message &&
            msg.User === targetMessage.User &&
            msg.Time === targetMessage.Time
        );
      console.log("Stage " + index);
        if (index !== -1) Messages.splice(index, 1);
      io.in(room).emit("delete message", msg, author, time);
      SaveMessages();
    });
}

setInterval(()=>{ // Reset the MPMs for each user
  UsersMPM.forEach((value, key: string)=>UsersMPM.set(key, 0));
}, 1000*60);

async function ClientLoadMessages(clientID:string, chatRoom:string, io:Server) {
  Messages.forEach((msg:ChatMessage)=>{
    if(msg.ChatRoom === chatRoom)
      io.emit("single chat message", msg.Message, clientID, msg.User, msg.Time);
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