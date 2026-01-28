//const peers = new SimplePeer();
import { v4 as uuid } from 'uuid';
const peers = {};

const rooms = {};

export const visionController = (socket , io) => {

    console.log(uuid());
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
        users.push({
            userID: socket.userID,
            ...socket.handshake.auth,
        });
    } 
    
    const createRoom = ()=>{
        const roomId = uuid();
        rooms[roomId] = [];
        socket.emit("room-created", roomId);
        console.log("user joint the room");
    }

    const leaveRoom = ({roomId, peerId})=>{
        rooms[roomId] = rooms[roomId].filter(id => id !== peerId);
        console.log("user joint the room");
        socket.to(roomId).emit("user-disconnected",roomId);
    }


    const joinRoom = ({roomId, peerId})=>{
        if(rooms[roomId]){
            console.log("user joined the room", roomId, peerId);
            rooms[roomId].push(peerId);
            socket.join(roomId);
            socket.emit("get-users",{ roomId, participants: rooms[roomId]  } )
        }

        socket.on('disconnect', () => {
            console.log('user left the room ' + socket.id) 
            socket.broadcast.emit('removePeer', socket.id)
            delete peers[socket.id]
        })
    }


    socket.on('callingUser', ({peerId , userToCall, userSource}) => {
        const roomId = "room-"+ uuid();
        rooms[roomId] = [];
        console.log("callUser",peerId , userToCall, userSource);
        socket.join(roomId);
        socket.emit("room-created", roomId);
        const thisUserIsRealyOnline = users.find((a) => a.usrCode === userToCall.usrCode);
        if (thisUserIsRealyOnline) {
            socket
              .to(socket.userID)
              .to(thisUserIsRealyOnline.usrCode)
              .emit("inCommingCall",
              { 
                userSource: userSource ,
                roomId : roomId ,
                userDestination: userToCall,
                peerId: peerId
            });
        }


    })

    socket.on('callAccept', async (data) => {
        console.log("callAccept", data);
        const sockets = await io.in(data.roomId).fetchSockets();
        console.log("sockets.length", sockets.length);
        for (const socket of sockets) {
            console.log("user in room",socket.handshake.auth );

        }
        io.to(data.roomId).emit("join-room", data);
        
   })
    socket.on('join-room', createRoom);
    socket.on('leave-room', createRoom);
    socket.on('delete-room', createRoom);





}