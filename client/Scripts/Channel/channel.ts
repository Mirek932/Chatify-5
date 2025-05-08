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
                if(isPublic=="public")
                    AppendChatRoom(channelDisplayName, channelID);
                else if(isPublic == staticID)
                    AppendChatRoom(channelDisplayName, channelID, true);
            }

        });
        clearTimeout(waitForSocket);
    }
}, 1000);

const JoinRoom = <HTMLButtonElement>document.getElementById("join-room");
const JoinChannel = <HTMLInputElement>document.getElementById("room-code");
const channelDisplayName = <HTMLInputElement>document.getElementById("room-name");
const isPublic = <HTMLInputElement>document.getElementById("room-checkbox");
JoinRoom.addEventListener("click", ()=>{
    currentChannel=JoinChannel.value;
    ClearMessages();
    socket.emit("reload messages", currentChannel);
    socket.emit("create chat room", currentChannel, channelDisplayName.value, isPublic.checked, staticID);
});
function AppendChatRoom(displayName:string, channelID:string, important:boolean=false)
{
    const Rooms = <HTMLDivElement>document.getElementById("Room-Container");
    const RoomParent = <HTMLElement>document.createElement('Room');
    const RoomHeader = <HTMLElement>document.createElement("p");
    //const RoomJoinButton = <HTMLButtonElement>document.createElement("button");
    //RoomJoinButton.innerHTML = "Beitreten";
    RoomHeader.innerHTML = displayName;
    RoomParent.setAttribute("class", "Room-Container-Room");
    RoomParent.setAttribute("id", "ChatRoom");
    RoomParent.setAttribute("channelID", channelID);

    if(important)
        RoomParent.setAttribute("style", "background-color: #e2e2e2;");

    RoomParent.addEventListener("click", ()=>{
        socket.emit("leave chat room", (currentChannel));
        currentChannel=<string>RoomParent.getAttribute("channelID");
        ClearMessages();
        socket.emit("reload messages", currentChannel);
        socket.emit("join chat room", (currentChannel));
    });

    RoomParent.appendChild(RoomHeader);
    //RoomParent.appendChild(RoomJoinButton);
    Rooms.appendChild(RoomParent);
}

const RoomSearch = <HTMLInputElement>document.getElementById("rooms-search");

const Rooms = <HTMLDivElement>document.getElementById("Room-Container");
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
}, 100);
