import { ClearMessages } from "../Chat/chat.js";
import { socket } from "../Server/socket.js";
export var currentChannel = "0404";
const JoinRoom = document.getElementById("join-room");
const JoinChannel = document.getElementById("room-code");
JoinRoom.addEventListener("click", () => {
    currentChannel = JoinChannel.value;
    ClearMessages();
    socket.emit("reload messages", currentChannel);
});
