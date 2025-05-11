# [#] 0.0.1 Alpha
[#] Alpha Release
# [#] 0.0.2 Alpha
[#] Delete Messages
[#] Rework the Message system
### Smaller
[#] Current Chat Room uses
[#] Loading Gif
# Update list for 0.0.2 Alpha
@everyone **Alpha 0.0.2 is out!**
You can now invite people to chat rooms!
Just join the chatroom and click copy link, and after that you have it in the clipboard!
- Removed the public chat room creation to prevent channel spam
The link is like this:
https://example-domain.com/invite?channelID=[CHANNELID]&displayName=[DISPLAYNAME]
channelID is the id to the channel
displayName is the name it will show in the room list

- Added User count in the chat room
- Added delete Messages
- Messages are now much safer to send; As long as the hacker doesn't have the channelID your messages are safe!
**How the new System works:**
1. You sent a message
[Server]<--m--[ChannelID][Client1]
The message looks like this:
User: "Mian"
Message: "This is a test message!"
ChannelID: "0404"
StaticID: "Dui-osa78dSALID"

The StaticID is like an IP-Adress but only for your current Browser; I could use IP-Adresses but i don't want to send your literal IP-Adress to random people...
2. The Server gets the Message and checks for spelling.
3. The Server now sends the message to all Sockets(Clients) in the given Channel
[Server]--m->[0404][Client1]
           ->[0404][Client2]
             
             [ABCD][Client3] <- Hacker
The hacker wont get the message
**How the old System worked:**
1. You send a message
[Server]<--m--[Client1]
2. The server gets the message and sends it to every client
[Server]--m->[Client1]
           ->[Client2]
           ->[Client3] <- Hacker
3. The Client checks if the channel in the message is the channel that your currently in
if it is:
- Draw the message in the Chat
if not:
- Ignore the message
-> Hackers could easily change the code of the client, that it always draws it into the Chat + the ChannelID and could found out the ChannelID and all Messages
**FAQ**
But couldn't the Hackers just modify the Servers code?
- No; The Hackers can only modify the Client code, and cant even see the Servers code
# [ ] 0.2.3 Alpha
[#] Delete Chat Rooms 
### Security Fixes
[#] Rate Limit
[#] Reflected Cross-site scripting