import { Username } from "../User/user.js";
import { currentChannel } from "../Channel/channel.js";
export const socket = io();
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value, Username, currentChannel);
        input.value = '';
    }
});
socket.on("send active CACCs", (successfully) => {
    var responseInfo = document.getElementById("someone-chatting");
    if (successfully)
        responseInfo.classList.add("hidden");
    else
        responseInfo.classList.remove("hidden");
});
var CACCsInterval = setInterval(() => {
    socket.emit("set CACC", currentChannel, input.value.trim() != "");
    socket.emit("get CACCs", currentChannel);
}, 1000);
socket.on("info box", (msg, time = 1000) => {
    var hideElement = document.getElementById("hideMessageSpam");
    hideElement.setAttribute("style", "display:block;");
    var pElement = document.getElementById("hideMessageInfo");
    pElement.innerHTML = msg;
    var timer = setTimeout(() => {
        hideElement.setAttribute("style", "display:none;");
    }, time);
});
