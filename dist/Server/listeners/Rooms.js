import { writeFile, readFile } from 'fs/promises';
var Rooms = await LoadRooms();
export var channelMembers = new Map();
export default function registerRoomHandlers(socket, io) {
    var WaitForSocketToInit = setInterval(() => {
        if (socket) {
            ClientLoadRooms(socket.id, io);
            // JoinRoom(socket.id, "0404");
            socket.join("0404");
            clearInterval(WaitForSocketToInit);
        }
    }, 1000);
    socket.on("create chat room", (channelID, channelDisplayName, isPublic = true, GivenStaticID = "FFFFFFFFF") => {
        console.log(`Chat room ${channelDisplayName} created with id ${channelID}`);
        var StaticID = "public";
        if (!isPublic)
            StaticID = GivenStaticID;
        var Room = {
            DisplayName: channelDisplayName,
            RoomID: channelID,
            StaticID: StaticID,
            OnlineMembers: [socket.id]
        };
        Rooms.push(Room);
        SaveRooms();
        socket.emit("create chat room", channelID, channelDisplayName, StaticID);
    });
    socket.on("join chat room", (channelID) => {
        console.log("test");
        // JoinRoom(socket.id, channelID);
        socket.join(channelID);
    });
    socket.on("leave chat room", (channelID) => {
        // LeaveRoom(socket.id, channelID);
        socket.leave(channelID);
    });
    socket.on("disconnect", () => {
        // LeaveAllRooms(socket.id);
    });
    socket.on("get user count", () => {
        const joinedRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        const roomID = joinedRooms[0]; // z. B. "0404"
        const room = io.sockets.adapter.rooms.get(roomID);
        const count = room ? room.size : 0;
        socket.emit("send user count", count);
    });
}
export function JoinRoom(socketID, channel) {
    var oldCM = channelMembers.get(channel) || [];
    console.log(socketID + " joined the chat room!");
    if (!oldCM.includes(socketID))
        channelMembers.set(channel, oldCM + socketID);
}
export function LeaveRoom(socketID, channel) {
    var oldCM = channelMembers.get(channel) || [];
    console.log(socketID + " left the chat room!");
    var socketIndex = channelMembers.get(channel.indexOf(socketID));
    if (socketIndex !== -1)
        channelMembers.set(channel, oldCM.slice(socketIndex, 1));
}
export function LeaveAllRooms(socketID) {
    channelMembers.forEach((channel) => {
        var users = channelMembers.get(channel);
        if (users.indexOf(socketID) !== -1) {
            console.log(socketID + " left the chat room!");
            channelMembers.set(channel, users.slice(users.indexOf(socketID), 1));
            return;
        }
    });
}
async function ClientLoadRooms(clientID, io) {
    Rooms.forEach((room) => {
        io.emit("single create chat room", clientID, room.RoomID, room.DisplayName, room.StaticID);
    });
}
async function SaveRooms() {
    const jsonString = JSON.stringify(Rooms, null, 2);
    await writeFile("./Server/Databank/rooms.json", jsonString, "utf-8");
    console.log("Successfuly Saved the Rooms!");
}
async function LoadRooms() {
    const fileContent = await readFile("./Server/databank/rooms.json", "utf-8");
    const rooms = JSON.parse(fileContent);
    return rooms;
}
