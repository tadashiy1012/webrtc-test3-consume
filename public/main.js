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
    })();
};
ws.onmessage = (ev) => {
    const data = JSON.parse(ev.data);
    if (data.id && data.id !== id) {
        console.log(ev);
        if (data.toId && data.toId === id) {
            (async () => {
                const answer = new RTCSessionDescription({
                    type: 'answer',
                    sdp: data.answer.sdp
                });
                await pc.setRemoteDescription(answer);
            })();
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
};
pc.onicegatheringstatechange = (ev) => {
    console.log(ev.currentTarget.iceGatheringState)
    const label = 'timer1';
    if (ev.currentTarget.iceGatheringState === 'gathering') {
        console.time(label);
    } else if (ev.currentTarget.iceGatheringState === 'complete') {
        console.timeEnd(label);
    }
};
pc.ondatachannel = (ev) => {
    console.log(ev);
};

console.log(pc);