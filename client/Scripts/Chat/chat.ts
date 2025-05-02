import { currentChannel } from "../Channel/channel.js";
import { socket } from  "../Server/socket.js";

var WaitForSocketToInit = setTimeout(()=>{
    if(socket)
    {
        socket.on('chat message', (msg:string, channel:string) => {
            if(channel===currentChannel)
                NewMessage(msg);
        });
        
        socket.on("single chat message", (msg:string, user:string) => {
            console.log(user + " === " + socket.id);
            if(user === socket.id)
                NewMessage(msg);
        });
        clearTimeout(WaitForSocketToInit);
    }
}, 1000);

function NewMessage(msg:string) {
    const item = document.createElement('li');
    item.textContent = msg;
    const messages = <HTMLLinkElement>document.getElementById("messages");
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}

export function ClearMessages()
{
    const messages = <HTMLLinkElement>document.getElementById("messages");
    messages.innerHTML = '';
}