export const createPeerConnectiion = (
    socket: any,
    roomId: string,
    localStream: MediaStream,
    remoteVedioRef: React.RefObject<HTMLVideoElement>): RTCPeerConnection => {

        
    const peerConnection = new RTCPeerConnection({
        iceServers:[{urls:'stun:stun.l.google.com:19302'}]
    });

    // debugging info
    peerConnection.onconnectionstatechange = () => {
    console.log("Connection state:", peerConnection.connectionState);
    };
 


    // send ice candidate to other peers in the room
    peerConnection.onicecandidate = (event)=>{
        if(event.candidate){
            socket.emit('ice-candidate' , {
                candidate: event.candidate,
                roomId
            });
        }
    }


    // add remote stream to remote video element
    peerConnection.ontrack = (event)=>{
        if(remoteVedioRef.current){
            remoteVedioRef.current.srcObject = event.streams[0];
        }
    }   

    // add all tracks of local stream to peer connection
    localStream.getTracks().forEach((track)=>{
        peerConnection.addTrack(track , localStream);
    });

    return peerConnection;
}

