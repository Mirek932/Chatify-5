const socket = io();
var staticID = localStorage.getItem("staticID") || "FFFFFFFFF";
if (staticID == "FFFFFFFFF") {
    localStorage.setItem("staticID", Str_Random(20));
    staticID = localStorage.getItem("staticID") || "FFFFFFFFF";
}
const invitionButton = document.getElementById("Invite");
const serverNameEle = document.getElementById("serverName");
const params = new URLSearchParams(window.location.search);
var channelID = params.get("channelID") || "EMPTYhEADERNOPE";
var channelDisplayName = params.get("channelDisplayName") || "INVALIDdISPLAYNAME";
if (channelID == "EMPTYhEADERNOPE" || channelDisplayName == "INVALIDdISPLAYNAME")
    window.location.href = "/404";
serverNameEle.textContent = channelDisplayName;
invitionButton.addEventListener("click", () => {
    // accepted
    socket.emit("create chat room", channelID, channelDisplayName, false, staticID);
    window.location.href = "/";
});
function Str_Random(length) {
    let result = '';
    const characters = 'abcdeghijklmnopqrstuvwxyz0123456789ABCDEGHIJKLMNOPQRSTUVWXYZ-';
    // Loop to generate characters for the specified length
    for (let i = 0; i < length; i++) {
        const randomInd = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomInd);
    }
    return result;
}
export {};
