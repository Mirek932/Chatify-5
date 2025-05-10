import { ClearMessages } from "../Chat/chat.js";
import { socket } from "../Server/socket.js";
import { staticID } from "../User/user.js";

export var currentChannel : string = "0404"; 

var waitForSocket = setTimeout(()=>{
    if(socket)
    {
        socket.on('create chat room', (channelID:string, channelDisplayName:string, socketID:string) => {
           if(socketID == "public")
            AppendChatRoom(channelDisplayName, channelID);
           else if(socketID == staticID)
            AppendChatRoom(channelDisplayName, channelID, true);
        });
        socket.on('single create chat room', (clientID:string, channelID:string, channelDisplayName:string, isPublic:string)=>{
            if(clientID == socket.id)
            {
                document.getElementById("rooms-loading")?.classList.add("hidden");
                if(isPublic=="public")
                    AppendChatRoom(channelDisplayName, channelID);
                else if(isPublic == staticID)
                    AppendChatRoom(channelDisplayName, channelID, true);
            }

        });
        socket.on("send user count", (count:number)=>{
            UserCountElement.innerText = "👤"+count;
        });
        clearTimeout(waitForSocket);
    }
}, 1000);

export var currentChannelName = "Hub";
const JoinRoom = <HTMLButtonElement>document.getElementById("join-room");
const JoinChannel = <HTMLInputElement>document.getElementById("room-code");
const channelDisplayName = <HTMLInputElement>document.getElementById("room-name");
const isPublic = <HTMLInputElement>document.getElementById("room-checkbox");
const CopyLinkButton = <HTMLButtonElement>document.getElementById("copy-room-link");
CopyLinkButton.addEventListener("click", ()=>{
    navigator.clipboard.writeText(window.location.origin + `/invite?channelID=${currentChannel}&channelDisplayName=${currentChannelName}`);
});
JoinRoom.addEventListener("click", ()=>{
    currentChannel=JoinChannel.value;
    ClearMessages();
    socket.emit("reload messages", currentChannel);
    document.getElementById("messages-loading")?.classList.remove("hidden");
    document.getElementById("room-popup")?.classList.remove("active");
    currentChannelName = channelDisplayName.value;
    socket.emit("create chat room", currentChannel, channelDisplayName.value, false/*isPublic.checked*/, staticID);
});
function AppendChatRoom(displayName:string, channelID:string, important:boolean=false)
{
    const Rooms = <HTMLDivElement>document.getElementById("Room-Container");
    const RoomParent = <HTMLElement>document.createElement('Room');
    const RoomHeader = <HTMLElement>document.createElement("p");
    const Delete = <HTMLButtonElement>document.createElement("button");
    //const RoomJoinButton = <HTMLButtonElement>document.createElement("button");
    //RoomJoinButton.innerHTML = "Beitreten";
    RoomHeader.innerHTML = displayName;
    RoomParent.setAttribute("class", "Room-Container-Room");
    RoomParent.setAttribute("id", "ChatRoom");
    RoomParent.setAttribute("channelID", channelID);

    Delete.innerHTML = "🗑️";
    Delete.style = "background-color:rgba(226, 226, 226, 0); border-radius: 15px; margin-left: auto;";

    if(important)
    {
        RoomParent.setAttribute("style", "background-color: #e2e2e2;");
        Delete.addEventListener("click", ()=>{
            RoomParent.remove();
            socket.emit("delete chat room", RoomParent.getAttribute("channelID"), staticID);
        });
    } else 
        Delete.innerHTML = "";

    RoomParent.addEventListener("click", ()=>{
        socket.emit("leave chat room", (currentChannel));
        currentChannel=<string>RoomParent.getAttribute("channelID");
        currentChannelName = RoomHeader.innerHTML;
        ClearMessages();
        socket.emit("reload messages", currentChannel);
        document.getElementById("messages-loading")?.classList.remove("hidden");
        document.getElementById("room-popup")?.classList.remove("active");
        socket.emit("join chat room", (currentChannel));
    });

    RoomParent.appendChild(RoomHeader);
    //RoomParent.appendChild(RoomJoinButton);
    Rooms.appendChild(RoomParent);
    RoomParent.appendChild(Delete);
}

const RoomSearch = <HTMLInputElement>document.getElementById("rooms-search");

const Rooms = <HTMLDivElement>document.getElementById("Room-Container");
const UserCountElement = <HTMLDivElement>document.getElementById("user-count");
const chatInput = <HTMLInputElement>document.getElementById("chat-input");
const ChatCharCount = <HTMLElement>document.getElementById("char-count");
setInterval(()=>{
    Array.from(Rooms.children).forEach(child => {
        const nameElement = <HTMLElement>Array.from(child.children)[0];
        if(nameElement)
        {
            if(!nameElement.innerHTML.toLowerCase().includes(RoomSearch.value.toLocaleLowerCase()))
                child.classList.add("hidden");
            else
                child.classList.remove("hidden");
        }
    });
    socket.emit("get user count");

    const remaining = 500 - chatInput.value.length;
    ChatCharCount.textContent = `${remaining}`;
}, 100);
