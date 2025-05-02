import { socket } from "../Server/socket.js";
export var Username = "Anonym";
var targetUsername = "-";
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
