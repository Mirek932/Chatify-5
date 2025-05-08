import { Server, Socket } from 'socket.io';

var ActiveUsers:Array<string> = new Array<string>();

export default function registerUserHandlers(socket: Socket, io: Server) {

    socket.on("Change Username", (uname: string)=>{
        socket.emit("Change Username", ChangeUsername(uname));
    });

}

function ChangeUsername(uname:string):boolean
{
  ActiveUsers.forEach((item:string)=>{
    if(item.toLowerCase() == uname.toLowerCase())
      return false;
  });
  ActiveUsers.push(uname);
  return true;
}