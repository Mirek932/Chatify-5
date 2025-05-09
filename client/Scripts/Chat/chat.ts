import { currentChannel } from "../Channel/channel.js";
import { socket } from  "../Server/socket.js";
import { Username } from "../User/user.js";

var WaitForSocketToInit = setTimeout(()=>{
    if(socket)
    {
        socket.on('chat message', (msg:string, channel:string, author:string, time:string) => {
            NewMessage(msg, author, time);
        });
        
        socket.on("single chat message", (msg:string, user:string, author:string, time:string) => {
            console.log(user + " === " + socket.id);
            if(user === socket.id)
                NewMessage(msg, author, time);
            document.getElementById("messages-loading")?.classList.add("hidden");
        });
        socket.on("delete message", (msg:string, author:string, time:string)=>{
            DeleteMessage(msg, author,time);
        });
        clearTimeout(WaitForSocketToInit);
    }
}, 1000);

function DeleteMessage(msg:string, author:string, time:string)
{
    const messages = <HTMLLinkElement>document.getElementById("messages");
    if(!messages) return;
    Array.from(messages.children).forEach((ele) => {
        if (
          ele.getAttribute("message") === msg &&
          ele.getAttribute("author") === author &&
          ele.getAttribute("time") === time
        ) {
          ele.remove();
        }
    });
}
function NewMessage(msg:string, author:string="Anonym", time:string="01.01.2000") {
    const item = document.createElement('li');
    item.textContent = time+" - "+author+"> "+msg;
    item.setAttribute("message", msg);
    item.setAttribute("author", author);
    item.setAttribute("time", time);
    if(author==Username)
    {
        const deleteButton= document.createElement("p");
        deleteButton.innerHTML = "🗑️";
        deleteButton.style = "margin-left: auto;";
        item.append(deleteButton);
        deleteButton.addEventListener("click", ()=>{
            // Delete this message
            socket.emit("delete message", msg, currentChannel, Username, time);
        });
    }
    item.style = "display: flex";
    const messages = <HTMLLinkElement>document.getElementById("messages");
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}

export function ClearMessages()
{
    const messages = <HTMLLinkElement>document.getElementById("messages");
    messages.innerHTML = '';
}