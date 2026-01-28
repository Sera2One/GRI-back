//visionController.js coté backend express
import { v4 as uuid } from 'uuid';
const peers = {}
const rooms = {};

export const visionController = async (socket , io) => {

        socket.on('callingUser', async ({userToCall, userSource , isPublic , roomTitle}) => {
            // Fin if user to call is already in room
            const users = await getUserInfoList(io);
            const thisUserIsRealyOnline = users.find((a) => a.usrCode === userToCall.usrCode);
            //initPeer();
            if (thisUserIsRealyOnline) {
                if(thisUserIsRealyOnline.roomId){
                    socket
                        .to(socket.userID)
                        .to(thisUserIsRealyOnline.usrCode)
                        .emit("reqJoinRoom",{roomId: thisUserIsRealyOnline.roomId ,...userSource});
                }else{
                    // If user is not in room, create a room
                    let roomDetaill = "room-private-";
                    if(isPublic){}{
                        roomDetaill = "room-public-";
                    }
                    const roomId = roomDetaill + uuid();
                    const peerId = "peer-"+ uuid();
                    socket.data.peerId = peerId;
                    socket.data.roomId = roomId;
                    peers[peerId] = socket;
                    rooms[roomId] = [];
                    // add user socket data peer information and room infomation

                    rooms[roomId].push({roomTitle: roomTitle , user: userSource , peerId: peerId });
                    socket.join(roomId);
                    // Send the room information data to user to call
                    socket
                      .to(socket.userID)
                      .to(thisUserIsRealyOnline.usrCode)
                      .emit("inCommingCall",{roomId: roomId ,...userSource});
                }
            }else{
                socket.emit("userNotOnline");
            }

        });

        socket.on("req getRoomListe",async ()=>{
            const roomListe = Object.values(rooms);
            socket.emit("res roomListe",roomListe)
        });

        socket.on("req createRoom",async (data)=>{
            let roomAcces = "private";
            const roomTitle = data.roomTitle;
            if(data.isPublic){}{
                roomAcces = "public";
            }
            const roomId = `room-${roomAcces}-` + uuid();
            rooms[roomId] = [];
            const roomInfo = {
                roomId: roomId,
                roomTitle: roomTitle,
                roomAcces: roomAcces,
            }
            rooms[roomId].push({roomInfo: roomInfo });
            const autorisedUser = data.autorisedUser;
            if(autorisedUser){
                autorisedUser.map((user)=>{
                    rooms[roomId].push({user: user , peerId: null });
                })
            }

            socket.emit("res roomListe",{roomInfo: roomInfo , ...autorisedUser});
        });

        socket.on("req deleRoom",async (roomId)=>{
            if(rooms[roomId]){
                delete rooms[roomId]
                socket.emit("res deleRoom","Succes");
            }else{
                socket.emit("res deleRoom","Error");
            }
        });

        // Room accepte

        socket.on('callAccept', async (data) => {
            const peerId = "peer-"+ uuid();
            const roomId = data.roomId;
            socket.data.peerId = peerId;
            socket.data.roomId = roomId;
            if(rooms[roomId]){
                rooms[roomId].push({user: data.from , peerId: peerId });
            }
            const userInRoom = Object.values(rooms[roomId]);

            peers[peerId] = socket;
            for(let id in peers) {
                //Send only the peerId to all user in room, skip the user  
                if(id === socket.data.peerId) continue
                const thisUserIsInRoom = userInRoom.find((a) => a.peerId === socket.data.peerId);
                if(thisUserIsInRoom){
                    console.log('sending init receive to ' + socket.data.peerId)
                    peers[id].emit('initReceive', socket.data.peerId)
                }
            }

        })

        socket.on('reject call',({user, to})=> {
            socket
            .to(socket.userID)
            .to(to.usrCode)
            .emit("call rejected",{rejectBy: user});
        })

        socket.on('canJoinRoom',(data)=> {
            const accepteBy = data.accepteBy;
            const acceptedUser = data.acceptedUser;
            const peerId = "peer-"+ uuid();
            socket
            .to(socket.userID)
            .to(acceptedUser.usrCode)
            .emit("youCanJoinRoom",{roomId: data.roomId, peerId: peerId ,...accepteBy});
        })

        socket.on('JoiningRoom', async (data) => {
            let peerId;
            if(data.peerId){
                peerId = data.peerId;
            }else{
                peerId = "peer-"+ uuid();
            }

            const roomId = data.roomId;
            socket.data.peerId = peerId;
            socket.data.roomId = roomId;
            if(rooms[roomId]){
                rooms[roomId].push({user: data.user , peerId: peerId });
            }
            const userInRoom = Object.values(rooms[roomId]);

            peers[peerId] = socket;
            for(let id in peers) {
                //Send only the peerId to all user in room, skip the user  
                if(id === socket.data.peerId) continue
                const thisUserIsInRoom = userInRoom.find((a) => a.peerId === socket.data.peerId);
                if(thisUserIsInRoom){
                    console.log('sending init receive to ' + socket.data.peerId)
                    peers[id].emit('initReceive', socket.data.peerId)
                }
            }

        })



       socket.on('callEnded', (user) => {
           if(user){
               console.log('callEnded' , socket.userID ,user.usrCode )
               socket
               .to(socket.userID)
               .to(user.usrCode)
               .emit("callEnded", user);
            }
            //Recreate new peerId if callEnd, because the old peerId is unused
            socket.broadcast.emit('removePeer', socket.data.peerId)
            delete peers[socket.data.peerId]
            socket.data.peerId = null;
            socket.emit('I am quitting');

           
        })


        /**
         * relay a peerconnection signal to a specific socket
         */
        socket.on('signal', data => {
            //console.log('sending signal from ' + socket.id +peers[init_socket_id] ' to ', data)
            if(!peers[data.socket_id])return
            peers[data.socket_id].emit('signal', {
                socket_id: socket.data.peerId,
                signal: data.signal,
                userDestination: data.userDestination,
                userSource: data.userSource
            })
        })

        /**
         * remove the disconnected peer connection from all other connected clients
         */
        socket.on('disconnect', () => {
            console.log('socket disconnected ' + socket.id)
            io.emit('removePeer', socket.data.peerId);
            if(peers[socket.data.peerId]){
                delete peers[socket.data.peerId]
            }
        })

        /**
         * Send message to client to initiate a connection
         * The sender has already setup a peer connection receiver
         */
        socket.on('initSend', init_socket_id => {
            console.log('INIT SEND by ' + socket.data.peerId + ' for ' + init_socket_id);
            if(peers[init_socket_id]){
                peers[init_socket_id].emit('initSend', socket.data.peerId)
            }
        });

    }

const getUserInfoList = async (io)  =>{
    const sockets2 = await io.fetchSockets();
    let usersListe = [];
    sockets2.forEach(socket => {
        usersListe.push({
            userID: socket.id,
            roomId: socket.data.roomId || null ,
            peerId:socket.data.peerId || null,
            ...socket.handshake.auth,
        });
    });
    return usersListe;
}