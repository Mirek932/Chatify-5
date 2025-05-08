import { socket } from "../Server/socket.js";

export var Username:string = "Anonym";
var targetUsername:string = "-";

export var staticID:string = localStorage.getItem("staticID") || "FFFFFFFFF";;
if(staticID=="FFFFFFFFF")
{
    localStorage.setItem("staticID", Str_Random(20));
    staticID = localStorage.getItem("staticID") || "FFFFFFFFF";
}

var localstorageUname:string = localStorage.getItem("Username") || '""';
if(localstorageUname && localstorageUname !== '""')
    Username=localstorageUname;

export function ChangeUsername(uname:string) {
    socket.emit("Change Username", uname);
    localStorage.setItem("Username" , uname);
    targetUsername=uname;
}
var WaitForSocketInit = setTimeout(()=>{
    if(socket)
        socket.on("Change Username", (wasSuccessFull:boolean)=>{
            if(wasSuccessFull)
                Username=targetUsername;
        });
        clearTimeout(WaitForSocketInit);
}, 1000);

const singinForum = <HTMLButtonElement>document.getElementById("save-profile"); 
singinForum.addEventListener("click", ()=>{
    const name = <HTMLInputElement>document.getElementById('profile-name');
    const imageEle = <HTMLInputElement>document.getElementById('profile-image');
    // const image = imageEle.files[0];
    ChangeUsername(name.value);
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