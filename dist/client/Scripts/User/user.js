import { socket } from "../Server/socket.js";
export var Username = "Anonym";
var targetUsername = "-";
export var staticID = localStorage.getItem("staticID") || "FFFFFFFFF";
;
if (staticID == "FFFFFFFFF") {
    localStorage.setItem("staticID", Str_Random(20));
    staticID = localStorage.getItem("staticID") || "FFFFFFFFF";
}
var localstorageUname = localStorage.getItem("Username") || '""';
if (localstorageUname && localstorageUname !== '""')
    Username = localstorageUname;
export function ChangeUsername(uname) {
    socket.emit("Change Username", uname);
    localStorage.setItem("Username", uname);
    targetUsername = uname;
}
var WaitForSocketInit = setTimeout(() => {
    if (socket)
        socket.on("Change Username", (wasSuccessFull, id) => {
            if (id !== socket.id)
                return;
            if (wasSuccessFull)
                Username = targetUsername;
        });
    clearTimeout(WaitForSocketInit);
}, 1000);
const singinForum = document.getElementById("save-profile");
singinForum.addEventListener("click", () => {
    const name = document.getElementById('profile-name');
    const imageEle = document.getElementById('profile-image');
    // const image = imageEle.files[0];
    ChangeUsername(name.value);
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
