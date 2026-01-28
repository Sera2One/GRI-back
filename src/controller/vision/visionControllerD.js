//const peers = new SimplePeer();
const peers = {}
const rooms = {};
import { v4 as uuid } from 'uuid';
export const visionController = async (socket , io) => {
        const sockets = await io.fetchSockets();

        function initPeer(){
            sockets.forEach(socket => {
                peers[socket.id] = socket
            }); 

            for(let id in peers) {
                if(id === socket.id) continue
                console.log('sending init receive to ' + socket.id)
                peers[id].emit('initReceive', socket.id)
            }
        }

        initPeer();

        //Saving All connected Users
        const users = [];
        
		sockets.forEach(socket => {
			users.push({
				userID: socket.id,
				...socket.handshake.auth,
			});
		});

        socket.on('callingUser', ({userToCall, userSource}) => {
            const roomId = "room-"+ uuid();
            rooms[roomId] = [];
            socket.join(roomId);
            const thisUserIsRealyOnline = users.find((a) => a.usrCode === userToCall.usrCode);
            initPeer();
            if (thisUserIsRealyOnline) {
                socket
                  .to(socket.userID)
                  .to(thisUserIsRealyOnline.usrCode)
                  .emit("inCommingCall", userSource);
            }

        })


        socket.on("user-get-connected-users",async ()=>{
            for(let id in peers) {
                if(id === socket.id) continue
                console.log("peers[id].handshake.auth", peers[id].handshake.auth);
            }
        })

        socket.on('callAccept', (data) => {
            for(let id in peers) {
                if(id === socket.id) continue
                console.log('sending init receive to ' + socket.id)
                peers[id].emit('initReceive', socket.id)
            }

       })

       socket.on('callEnded', (user) => {
            //socket.broadcast.emit('removePeer', socket.id)
            io.emit('removePeer', socket.id);
            delete peers[socket.id]
            if(user){
                console.log('callEnded' , socket.userID ,user.usrCode )
                socket
                      .to(socket.userID)
                      .to(user.usrCode)
                      .emit("callEnded", user);
            }
           
        })


        /**
         * relay a peerconnection signal to a specific socket
         */
        socket.on('signal', data => {
            //console.log('sending signal from ' + socket.id +peers[init_socket_id] ' to ', data)
            if(!peers[data.socket_id])return
            peers[data.socket_id].emit('signal', {
                socket_id: socket.id,
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
            //socket.broadcast.emit('removePeer', socket.id)
            io.emit('removePeer', socket.id);
            delete peers[socket.id]
        })

        /**
         * Send message to client to initiate a connection
         * The sender has already setup a peer connection receiver
         */
        socket.on('initSend', init_socket_id => {
            console.log('INIT SEND by ' + socket.id + ' for ' + init_socket_id);
            if(peers[init_socket_id]){
                peers[init_socket_id].emit('initSend', socket.id)
            }
        });

    }
