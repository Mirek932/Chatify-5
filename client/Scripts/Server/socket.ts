import { Socket } from "socket.io";
import { Username } from "../User/user.js";
import { currentChannel } from "../Channel/channel.js";

declare const io: () => Socket;

export const socket = io();
  
const form = <HTMLFormElement>document.getElementById('chat-form');
const input = <HTMLInputElement>document.getElementById('chat-input');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message',input.value, Username, currentChannel);
    input.value = ''; 
  }
});

socket.on("send active CACCs", (successfully:boolean)=>{
  var responseInfo = <HTMLElement>document.getElementById("someone-chatting");
  if(successfully)
    responseInfo.classList.add("hidden");
  else
    responseInfo.classList.add("hidden");
});

var CACCsInterval = setInterval(()=>{
  socket.emit("get CACCs");
}, 1000);

socket.on("info box", (msg:string, time=1000) => {
  var hideElement = <HTMLElement>document.getElementById("hideMessageSpam");
  hideElement.setAttribute("style", "display:block;");
    var pElement = <HTMLElement>document.getElementById("hideMessageInfo");
    pElement.innerHTML = msg;
    var timer : NodeJS.Timeout = setTimeout(()=>{
    hideElement.setAttribute("style", "display:none;");
}, time);
});