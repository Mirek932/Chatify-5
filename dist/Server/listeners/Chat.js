import { writeFile, readFile } from 'fs/promises';
// MPM = Messages Per Minute
// CACCs = currentlyActiveChattingChatters
const MPM_LIMIT = 20;
var CACCs = ["CACC"]; //short CACCs
var UsersMPM = new Map();
var Messages = await LoadMessages();
export default function registerChatHandlers(socket, io) {
    var WaitForSocket = setInterval(() => {
        if (socket) {
            ClientLoadMessages(socket.id, "0404", io);
            clearInterval(WaitForSocket);
        }
    }, 1000);
    socket.on('chat message', (msg, author, channel) => {
        console.log(author + "> " + msg + " < " + channel);
        var SocketMPM = UsersMPM.get(socket.id) || 1;
        if (SocketMPM)
            UsersMPM.set(socket.id, SocketMPM + 1);
        if (SocketMPM < MPM_LIMIT) {
            // io.emit("chat message", author + '> ' + msg, channel);
            io.in(channel).emit("chat message", author + "> " + msg, channel);
            Messages.push({
                ChatRoom: channel,
                Message: msg,
                User: author
            });
            SaveMessages();
        }
        else {
            socket.emit("single chat message", "Du hast dein Limit von Nachrichten erreicht! Warte eine Minute...", socket.id);
            socket.emit("info box", "Du hast dein Limit von Nachrichten erreicht! Warte eine Minute...");
        }
    });
    socket.on("reload messages", (channel) => {
        ClientLoadMessages(socket.id, channel, io);
    });
    socket.on("get CACCs", (channel) => {
        socket.emit("send active CACCs", CACCs.includes(channel));
    });
    socket.on("set CACC", (channelID, isTyping) => {
        var index = CACCs.indexOf(channelID);
        if (isTyping && !CACCs.includes(channelID))
            CACCs.push(channelID);
        else if (index !== -1)
            CACCs.slice(index, 1);
    });
}
setInterval(() => {
    UsersMPM.forEach((value, key) => UsersMPM.set(key, 0));
}, 1000 * 60);
async function ClientLoadMessages(clientID, chatRoom, io) {
    Messages.forEach((msg) => {
        if (msg.ChatRoom === chatRoom)
            io.emit("single chat message", msg.User + "> " + msg.Message, clientID);
    });
}
async function SaveMessages() {
    const jsonString = JSON.stringify(Messages, null, 2);
    await writeFile("./Server/Databank/messages.json", jsonString, "utf-8");
    console.log("Successfuly Saved the Messages!");
}
async function LoadMessages() {
    const fileContent = await readFile("./Server/databank/messages.json", "utf-8");
    const messages = JSON.parse(fileContent);
    return messages;
}
