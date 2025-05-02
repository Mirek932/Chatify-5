import { socket } from "../Server/socket.js";

export var Username:string = "Anonym";
var targetUsername:string = "-";

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
        socket.on("Change Username", (wasSuccessFull:boolean, id:string)=>{
            if(id!==socket.id)
                return;
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