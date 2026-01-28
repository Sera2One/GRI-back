const roomListe = new Map();

export const visionController = async (socket , io) => {
        const socketsListeInServer = await io.fetchSockets();

        //Saving All connected Users
        const users = [];
        
		socketsListeInServer.forEach(socket => {
			users.push({
				userID: socket.id,
				...socket.handshake.auth,
			});
		});

        socket.on('callingUser', ({userToCall, userSource , roomName , roomIsVisible, autoInterInroomIsAutorized }) => {
            let createNewRoom = false;
            console.log('callingUser',userToCall);
            const thisUserIsRealyOnline = users.find((a) => a.usrCode === userToCall.usrCode);


            if(thisUserIsRealyOnline){
                for (const _socket of socketsListeInServer){
                    if(_socket.handshake.auth.usrCode === userToCall.usrCode){
                        createNewRoom = true;
                    }
    
                }
            }else{
                return socket.emit("userNotOnline");
            }

            const roomCode = `room-${userSource.usrCode}`;
            const newRoomName = roomName || userSource.usrName;
            const usersInRoom = [];
            usersInRoom.push(userSource);

            if(createNewRoom){
                roomListe.set(roomCode ,{
                    UserInitiatorCode: userSource.usrCode,
                    roomName: newRoomName,
                    roomCode : roomCode,
                    usersInRoom: usersInRoom,
                    roomIsVisible: roomIsVisible || false,
                    autoInterInroomIsAutorized: autoInterInroomIsAutorized || false
                });

                socket.join(roomCode);

            }

            if (thisUserIsRealyOnline) {
                socket
                  .to(socket.userID)
                  .to(thisUserIsRealyOnline.usrCode)
                  .emit("inCommingCall",{
                    userSource : userSource , 
                    roomCode : roomCode ,
                    roomName : newRoomName,
                    roomIsVisible: roomIsVisible || false,
                    autoInterInroomIsAutorized: autoInterInroomIsAutorized || false
                });
            }

        });

        socket.on('requestJoinRoom', ({roomName,user}) => {
            let propritaryRoom = roomName.split('-')[1];
            socket
                  .to(socket.userID)
                  .to(propritaryRoom)
                  .emit("requestJoinRoom", user);
        })

        socket.on('callAccept', async ({roomCode, newUser}) => {
            socket.join(roomCode);
            const socketsInRoom = await io.in(roomCode).fetchSockets();
            let roomDetail = roomListe.get(roomCode);
            let usersInRoom = [];

            for (const _socket of socketsInRoom){
                usersInRoom.push(_socket.handshake.auth);
            }
             
            let ra = {...roomDetail, usersInRoom : usersInRoom }
            console.log('roomListe', roomListe);
            roomListe.set(roomCode,ra);
            console.log('ra', ra);
            console.log('roomListe 2', roomListe);
            console.log('roomDetail', roomDetail);


            //const sockets = await io.in("room1").fetchSockets();
            //socket.to(roomCode).emit('initReceive', socket.id);

            let peers = {};
            socketsInRoom.forEach(socket => {
                peers[socket.id] = socket
            });

            for(let id in peers) {
                if(id === socket.id) continue
                console.log('sending init receive to ' + socket.id)
                peers[id].emit('initReceive', socket.id)
            }


        })

        socket.on('getAllUserInRoom', async (roomCode) => {
            let usersInRoom = [];
            const socketsInRoom = await io.in(roomCode).fetchSockets();
            for (const _socket of socketsInRoom){
                usersInRoom.push(_socket.handshake.auth);
            }
            socket.emit("allUserInRoom",usersInRoom);
        });

        socket.on("getAllRoom",() =>{
            socket.emit("allRoom", roomListe);
        })

       socket.on('callEnded', async ({user, roomCode }) => {
            //socket.broadcast.emit('removePeer', socket.id)
            let userRoom = `room-${user.usrCode}`;
            const userHasRoom = roomListe.has(userRoom);
            const socketsInRoom = await io.in(roomCode).fetchSockets();

            if(userHasRoom || socketsInRoom.length < 3 ){
                roomListe.delete(userRoom);
                let socket_id_list = []
                for (const _socket of socketsInRoom){
                    socket_id_list.push(_socket.id);
                }
                io.in(userRoom).emit('removeAllPeer',socket_id_list);
                io.in(userRoom).emit('callEnded');
                io.socketsLeave(userRoom);
            }else{
                socket.leave(roomCode);
                io.in(roomCode).emit('removePeer', socket.id);
                io.in(roomCode).emit('userQuitRoom', user);
            }
           
        })


        /**
         * relay a peerconnection signal to a specific socket
         */
        socket.on('signal', async data => {
            let peers = {};
            console.log('signal', data)
            const socketsInRoom = await io.in(data.roomCode).fetchSockets();
            socketsInRoom.forEach(socket => {
                peers[socket.id] = socket
            });
            //console.log('sending signal from ' + socket.id +peers[init_socket_id] ' to ', data)
            if(!peers[data.socket_id])return
            peers[data.socket_id].emit('signal', {
                socket_id: socket.id,
                signal: data.signal,
                userDestination: data.userDestination,
                userSource: data.userSource,
                roomCode : data.roomCode
            })
        })

        /**
         * remove the disconnected peer connection from all other connected clients
         */
        socket.on('disconnect', () => {
            console.log('socket disconnected ' + socket.id)
            //socket.broadcast.emit('removePeer', socket.id)
            let userRoom = `room-${socket.handshake.auth.usrCode}`;
            const userHasRoom = roomListe.has(userRoom);

            if(userHasRoom){
                roomListe.delete(userRoom);
                //console.log(socket.rooms);
                socket.leave(userRoom);
                io.in(userRoom).emit('removePeer', socket.id);
            }
            
            
        })

        /**
         * Send message to client to initiate a connection
         * The sender has already setup a peer connection receiver
         */
        socket.on('initSend', async ({socket_id, roomCode }) => {
            console.log('INIT SEND by ' + socket.id + ' for ' + socket_id);
            let peers = {};
            const socketsInRoom = await io.in(roomCode).fetchSockets();
            socketsInRoom.forEach(socket => {
                peers[socket.id] = socket
            });
            if(peers[socket_id]){
                peers[socket_id].emit('initSend', socket.id)
            }
        });

    }

// io.on("connection", (socket) => {
//   socket.on("chat message", (msg) => {
//     io.emit("chat message", msg);
//   });
// });

// io.on("connection", (socket) => {
//   socket.emit("me", socket.id);
//   socket.on("disconnect", () => {
//     socket.broadcast.emit("callEnded");
//   });

//   socket.on("callUser", (data) => {
//     io.to(data.userToCall).emit("callUser", {
//       signla: data.signalData,
//       from: data.from,
//       name: data.name,
//     });
//     console.log("Calling");
//   }); 

//   socket.on("answerCall", (data)=> {
//     io.to(data.to).emit("callAccepted"), data.signal
//   })
//   console.log('Connexion etablie');

// });