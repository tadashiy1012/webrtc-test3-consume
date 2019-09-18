const id = Math.floor(Math.random() * 1000);

console.log(id);

const ws = new WebSocket('wss://cloud.achex.ca');
ws.onopen = () => {
    console.log('ws open');
    const auth = {auth: 'default@890', passowrd: '19861012'};
    ws.send(JSON.stringify(auth));
    (async () => {
        pc.createDataChannel('chat');
        await pc.setLocalDescription(await pc.createOffer());
        console.log('create and set local desc');
    })();
};
ws.onmessage = (ev) => {
    const data = JSON.parse(ev.data);
    if (data.id && data.id !== id) {
        console.log(ev);
        if (data.toId && data.toId === id) {
            if (data.candidate) {
                console.log('find candidate');
                const candidate = new RTCIceCandidate({
                    candidate: data.candidate.candidate,
                    sdpMLineIndex: data.candidate.sdpMLineIndex,
                    sdpMid: data.candidate.sdpMid
                });
                const answer = new RTCSessionDescription({
                    type: 'answer',
                    sdp: data.sdp
                });
                (async () => {
                    if (!pc.remoteDescription) {
                        await pc.setRemoteDescription(answer);
                    }
                    await pc.addIceCandidate(candidate);
                })();
            } else if (data.answer) {
                console.log('find answer');
                (async () => {
                    const answer = new RTCSessionDescription({
                        type: 'answer',
                        sdp: data.answer.sdp
                    });
                    await pc.setRemoteDescription(answer);
                })();
            }
        }
    }
};

const pc = new RTCPeerConnection({
    iceServers: [{urls: 'stun:stun.services.mozilla.com:3478'}]
});
pc.onicecandidate = (ev) => {
    console.log(ev);
    const sdp = pc.localDescription.sdp;
    const json = {id, candidate: ev.candidate, sdp, to: 'default@890'};
    ws.send(JSON.stringify(json));
    console.log('send ice candidate');
};
pc.onicegatheringstatechange = (ev) => {
    console.log(ev.currentTarget.iceGatheringState)
    const label = 'timer1';
    if (ev.currentTarget.iceGatheringState === 'gathering') {
        console.time(label);
        statusElm.innerHTML = "gathering";
    } else if (ev.currentTarget.iceGatheringState === 'complete') {
        console.timeEnd(label);
        statusElm.innerHTML = "complete";
    }
};
pc.ondatachannel = (ev) => {
    console.log(ev);
};

console.log(pc);

const statusElm = document.getElementById('status');
statusElm.innerHTML = "new";

const idElm = document.getElementById('id');
idElm.innerHTML = id;