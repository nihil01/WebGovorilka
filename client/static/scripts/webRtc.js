const observe = () => {
    function onElementAdded(element) {
        console.log('Элемент добавлен:', element);
    }

}

//
// const call = async e=>{
//     await fetchUserMedia();
//
//     //peerConnection is all set with our STUN servers sent over
//     await createPeerConnection();
//
//     //create offer time!
//     try{
//         console.log("Creating offer...")
//         const offer = await peerConnection.createOffer();
//         console.log(offer);
//         peerConnection.setLocalDescription(offer);
//         didIOffer = true;
//         socket.emit('newOffer',offer); //send offer to signalingServer
//     }catch(err){
//         console.log(err)
//     }
//
// }
//
// const answerOffer = async(offerObj)=>{
//     await fetchUserMedia()
//     await createPeerConnection(offerObj);
//     const answer = await peerConnection.createAnswer({}); //just to make the docs happy
//     await peerConnection.setLocalDescription(answer); //this is CLIENT2, and CLIENT2 uses the answer as the localDesc
//     console.log(offerObj)
//     console.log(answer)
//     // console.log(peerConnection.signalingState) //should be have-local-pranswer because CLIENT2 has set its local desc to it's answer (but it won't be)
//     //add the answer to the offerObj so the server knows which offer this is related to
//     offerObj.answer = answer
//     //emit the answer to the signaling server, so it can emit to CLIENT1
//     //expect a response from the server with the already existing ICE candidates
//     const offerIceCandidates = await socket.emitWithAck('newAnswer',offerObj)
//     offerIceCandidates.forEach(c=>{
//         peerConnection.addIceCandidate(c);
//         console.log("======Added Ice Candidate======")
//     })
//     console.log(offerIceCandidates)
// }
//
// const addAnswer = async(offerObj)=>{
//     //addAnswer is called in socketListeners when an answerResponse is emitted.
//     //at this point, the offer and answer have been exchanged!
//     //now CLIENT1 needs to set the remote
//     await peerConnection.setRemoteDescription(offerObj.answer)
//     // console.log(peerConnection.signalingState)
// }
//
// const createPeerConnection = (offerObj)=>{
//     return new Promise(async(resolve, reject)=>{
//         //RTCPeerConnection is the thing that creates the connection
//         //we can pass a config object, and that config object can contain stun servers
//         //which will fetch us ICE candidates
//         peerConnection = await new RTCPeerConnection(peerConfiguration)
//         remoteStream = new MediaStream()
//         remoteVideoEl.srcObject = remoteStream;
//
//
//         localStream.getTracks().forEach(track=>{
//             //add localtracks so that they can be sent once the connection is established
//             peerConnection.addTrack(track,localStream);
//         })
//
//         peerConnection.addEventListener("signalingstatechange", (event) => {
//             console.log(event);
//             console.log(peerConnection.signalingState)
//         });
//
//         peerConnection.addEventListener('icecandidate',e=>{
//             console.log('........Ice candidate found!......')
//             console.log(e)
//             if(e.candidate){
//                 socket.emit('sendIceCandidateToSignalingServer',{
//                     iceCandidate: e.candidate,
//                     iceUserName: userName,
//                     didIOffer,
//                 })
//             }
//         })
//
//         peerConnection.addEventListener('track',e=>{
//             console.log("Got a track from the other peer!! How excting")
//             console.log(e)
//             e.streams[0].getTracks().forEach(track=>{
//                 remoteStream.addTrack(track,remoteStream);
//                 console.log("Here's an exciting moment... fingers cross")
//             })
//         })
//
//         if(offerObj){
//             //this won't be set when called from call();
//             //will be set when we call from answerOffer()
//             // console.log(peerConnection.signalingState) //should be stable because no setDesc has been run yet
//             await peerConnection.setRemoteDescription(offerObj.offer)
//             // console.log(peerConnection.signalingState) //should be have-remote-offer, because client2 has setRemoteDesc on the offer
//         }
//         resolve();
//     })
// }
//
// const addNewIceCandidate = iceCandidate=>{
//     peerConnection.addIceCandidate(iceCandidate)
//     console.log("======Added Ice Candidate======")
// }
//
// socket.on('availableOffers',offers=>{
//     console.log(offers)
//     createOfferEls(offers)
// })
//
// //someone just made a new offer and we're already here - call createOfferEls
// socket.on('newOfferAwaiting',offers=>{
//     createOfferEls(offers)
// })
//
// socket.on('answerResponse',offerObj=>{
//     console.log(offerObj)
//     addAnswer(offerObj)
// })
//
// socket.on('receivedIceCandidateFromServer',iceCandidate=>{
//     addNewIceCandidate(iceCandidate)
//     console.log(iceCandidate)
// })
//
// function createOfferEls(offers){
//     //make green answer button for this new offer
//     const answerEl = document.querySelector('#answer');
//     offers.forEach(o=>{
//         console.log(o);
//         const newOfferEl = document.createElement('div');
//         newOfferEl.innerHTML = `<button class="btn btn-success col-1">Answer ${o.offererUserName}</button>`
//         newOfferEl.addEventListener('click',()=>answerOffer(o))
//         answerEl.appendChild(newOfferEl);
//     })
// }
//
// document.querySelector('#call').addEventListener('click',call)
