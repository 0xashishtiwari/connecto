'use client';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import { getSocket } from '../../webrtc/socket';
import { createPeerConnectiion } from '../../webrtc/peer';

const MeetingPage = () => {
  const params = useParams();
  const { roomId } = params;
  console.log(roomId);

  const socket = getSocket();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [joined, setJoined] = useState(false);

  useEffect(() => {

    document.title = `Meeting - ${roomId}`;

    if (!roomId) return;

    const startMeeting = async () => {
        console.log('Starting meeting in room: ', roomId);

        // get local media stream
      
        const constraints = {
          audio: true,
          video: { width: 1280, height: 720 }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints); 
        localStreamRef.current = stream;

        if(localVideoRef.current){
          localVideoRef.current.srcObject = stream;
        }

        // joining the room 
        socket.emit('join-room' , {roomId});
        setJoined(true);

        // waiting for other users to join -> create the offer for them
        socket.on('user-joined' , async (socketId: {socketId: string})=>{
          console.log('User joined: ', socketId);

          peerConnectionRef.current = createPeerConnectiion(
            socket,
            roomId as string,
            stream,
            remoteVideoRef as React.RefObject<HTMLVideoElement>
          );
          // create offer
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);

          // send offer to the other user
          socket.emit('offer' , {
            offer,
            roomId
          })
        });

        // when we receive an offer from other user

        socket.on('offer' , async (offer)=>{
          console.log('Received offer: ', offer);
          peerConnectionRef.current = createPeerConnectiion(
            socket,
            roomId as string,
            stream,
            remoteVideoRef as React.RefObject<HTMLVideoElement>
          );

          await peerConnectionRef.current?.setRemoteDescription(offer);
          const answer = await peerConnectionRef.current?.createAnswer();
          await peerConnectionRef.current?.setLocalDescription(answer);
          
          // send answer back to the caller
          socket.emit('answer' , {
            answer,
            roomId
          })
        })


        // preparing the answer to the offer we sent
        socket.on('answer' , async(answer , roomId)=>{
          console.log('Received answer : ', answer);
          
          await peerConnectionRef.current?.setRemoteDescription(answer);
        })

        // when we get ice candidate from other user
        socket.on('ice-candidate' , async(candidate : RTCIceCandidate , roomId : string) =>{
          console.log('Received ICE candidate: ', candidate);
          if(!peerConnectionRef.current) return;

          try {
            await peerConnectionRef.current?.addIceCandidate(candidate);
          } catch (error) {
            console.error('Error adding received ice candidate', error);
          }
        })

    
    }

    startMeeting();

    return () => {
      // cleanup
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };

  }, [roomId]);

  return (
     <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "300px", background: "#000" }}
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ width: "300px", background: "#000" }}
      />
    </div>
  )
}

export default MeetingPage