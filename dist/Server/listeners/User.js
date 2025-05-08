var ActiveUsers = new Array();
export default function registerUserHandlers(socket, io) {
    socket.on("Change Username", (uname) => {
        socket.emit("Change Username", ChangeUsername(uname));
    });
}
function ChangeUsername(uname) {
    ActiveUsers.forEach((item) => {
        if (item.toLowerCase() == uname.toLowerCase())
            return false;
    });
    ActiveUsers.push(uname);
    return true;
}
