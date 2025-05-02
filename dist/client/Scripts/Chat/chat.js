import { currentChannel } from "../Channel/channel.js";
import { socket } from "../Server/socket.js";
var WaitForSocketToInit = setTimeout(() => {
    if (socket) {
        socket.on('chat message', (msg, channel) => {
            if (channel === currentChannel)
                NewMessage(msg);
        });
        socket.on("single chat message", (msg, user) => {
            console.log(user + " === " + socket.id);
            if (user === socket.id)
                NewMessage(msg);
        });
        clearTimeout(WaitForSocketToInit);
    }
}, 1000);
function NewMessage(msg) {
    const item = document.createElement('li');
    item.textContent = msg;
    const messages = document.getElementById("messages");
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}
export function ClearMessages() {
    const messages = document.getElementById("messages");
    messages.innerHTML = '';
}
