import { ClearMessages } from "../Chat/chat.js";
import { socket } from "../Server/socket.js";
import { staticID } from "../User/user.js";
export var currentChannel = "0404";
var waitForSocket = setTimeout(() => {
    if (socket) {
        socket.on('create chat room', (channelID, channelDisplayName, socketID) => {
            if (socketID == "public")
                AppendChatRoom(channelDisplayName, channelID);
            else if (socketID == staticID)
                AppendChatRoom(channelDisplayName, channelID, true);
        });
        socket.on('single create chat room', (clientID, channelID, channelDisplayName, isPublic) => {
            if (clientID == socket.id) {
                document.getElementById("rooms-loading")?.classList.add("hidden");
                if (isPublic == "public")
                    AppendChatRoom(channelDisplayName, channelID);
                else if (isPublic == staticID)
                    AppendChatRoom(channelDisplayName, channelID, true);
            }
        });
        socket.on("send user count", (count) => {
            UserCountElement.innerText = "👤" + count;
        });
        clearTimeout(waitForSocket);
    }
}, 1000);
export var currentChannelName = "Hub";
const JoinRoom = document.getElementById("join-room");
const JoinChannel = document.getElementById("room-code");
const channelDisplayName = document.getElementById("room-name");
const isPublic = document.getElementById("room-checkbox");
const CopyLinkButton = document.getElementById("copy-room-link");
CopyLinkButton.addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.origin + `/invite?channelID=${currentChannel}&channelDisplayName=${currentChannelName}`);
});
JoinRoom.addEventListener("click", () => {
    currentChannel = JoinChannel.value;
    ClearMessages();
    socket.emit("reload messages", currentChannel);
    document.getElementById("messages-loading")?.classList.remove("hidden");
    document.getElementById("room-popup")?.classList.remove("active");
    currentChannelName = channelDisplayName.value;
    socket.emit("create chat room", currentChannel, channelDisplayName.value, false /*isPublic.checked*/, staticID);
});
function AppendChatRoom(displayName, channelID, important = false) {
    const Rooms = document.getElementById("Room-Container");
    const RoomParent = document.createElement('Room');
    const RoomHeader = document.createElement("p");
    const Delete = document.createElement("button");
    //const RoomJoinButton = <HTMLButtonElement>document.createElement("button");
    //RoomJoinButton.innerHTML = "Beitreten";
    RoomHeader.innerHTML = displayName;
    RoomParent.setAttribute("class", "Room-Container-Room");
    RoomParent.setAttribute("id", "ChatRoom");
    RoomParent.setAttribute("channelID", channelID);
    Delete.innerHTML = "🗑️";
    Delete.style = "background-color:rgba(226, 226, 226, 0); border-radius: 15px; margin-left: auto;";
    if (important) {
        RoomParent.setAttribute("style", "background-color: #e2e2e2;");
        Delete.addEventListener("click", () => {
            RoomParent.remove();
            socket.emit("delete chat room", RoomParent.getAttribute("channelID"), staticID);
        });
    }
    else
        Delete.innerHTML = "";
    RoomParent.addEventListener("click", () => {
        socket.emit("leave chat room", (currentChannel));
        currentChannel = RoomParent.getAttribute("channelID");
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
const RoomSearch = document.getElementById("rooms-search");
const Rooms = document.getElementById("Room-Container");
const UserCountElement = document.getElementById("user-count");
const chatInput = document.getElementById("chat-input");
const ChatCharCount = document.getElementById("char-count");
setInterval(() => {
    Array.from(Rooms.children).forEach(child => {
        const nameElement = Array.from(child.children)[0];
        if (nameElement) {
            if (!nameElement.innerHTML.toLowerCase().includes(RoomSearch.value.toLocaleLowerCase()))
                child.classList.add("hidden");
            else
                child.classList.remove("hidden");
        }
    });
    socket.emit("get user count");
    const remaining = 500 - chatInput.value.length;
    ChatCharCount.textContent = `${remaining}`;
}, 100);
