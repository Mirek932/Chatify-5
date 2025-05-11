import { Socket } from "socket.io";
declare const io: () => Socket;

const socket = io();

var staticID:string = localStorage.getItem("staticID") || "FFFFFFFFF";
if(staticID=="FFFFFFFFF")
{
    localStorage.setItem("staticID", Str_Random(20));
    staticID = localStorage.getItem("staticID") || "FFFFFFFFF";
}

const invitionButton = <HTMLElement>document.getElementById("Invite");
const serverNameEle = <HTMLElement>document.getElementById("serverName");
const params:URLSearchParams = new URLSearchParams(window.location.search);
var channelID:string = params.get("channelID")||"EMPTYhEADERNOPE";
var channelDisplayName:string = params.get("channelDisplayName")||"INVALIDdISPLAYNAME";
if(channelID == "EMPTYhEADERNOPE" || channelDisplayName == "INVALIDdISPLAYNAME")
    window.location.href = "/404";
serverNameEle.textContent = channelDisplayName;

invitionButton.addEventListener("click", ()=>{
    // accepted
    socket.emit("create chat room", channelID, channelDisplayName, false, staticID);
    window.location.href="/";
});

function Str_Random(length:number) {
    let result = '';
    const characters = 'abcdeghijklmnopqrstuvwxyz0123456789ABCDEGHIJKLMNOPQRSTUVWXYZ-';
    
    // Loop to generate characters for the specified length
    for (let i = 0; i < length; i++) {
        const randomInd = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomInd);
    }
    return result;
}