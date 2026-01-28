import { PeerServer } from "peer";

// const customGenerationFunction = () =>
// 	(Math.random().toString(36) + "0000000000000000000").substr(2, 16);

console.log("running on port", 9000);    
const peerServer = PeerServer({
	port: 9000,
    path: "/myapp"
});

