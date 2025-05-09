export type ChatMessage = {
    ChatRoom: string;
    Message: string;
    User: string;
    Time: string;
  };
  
export type Room = {
    DisplayName: string;
    RoomID: string;
    StaticID: string;
    OnlineMembers: Array<string>;
  };