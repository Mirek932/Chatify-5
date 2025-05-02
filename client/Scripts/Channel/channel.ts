import { ClearMessages } from "../Chat/chat.js";
import { socket } from "../Server/socket.js";

export var currentChannel : string = "0404"; 

const JoinRoom = <HTMLButtonElement>document.getElementById("join-room");
const JoinChannel = <HTMLInputElement>document.getElementById("room-code");
JoinRoom.addEventListener("click", ()=>{
    currentChannel=JoinChannel.value;
    ClearMessages();
    socket.emit("reload messages", currentChannel)
});
