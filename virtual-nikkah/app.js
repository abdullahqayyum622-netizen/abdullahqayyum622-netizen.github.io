/**
 * Virtual Nikkah Real-Time Application Engine
 * ZERO-CODE Auto-Connecting Global Live Engine
 */

const GLOBAL_ROOM_ID = 'nikkah-global-couple-room-2026';

const state = {
    role: null, // 'groom' or 'bride'
    yourName: '',
    partnerName: '',
    mahr: '',
    peer: null,
    conn: null,
    isMusicPlaying: false
};

const elements = {
    stepSetup: document.getElementById('stepSetup'),
    stepWaiting: document.getElementById('stepWaiting'),
    stepCeremony: document.getElementById('stepCeremony'),
    stepCertificate: document.getElementById('stepCertificate'),
    
    inputYourName: document.getElementById('inputYourName'),
    inputPartnerName: document.getElementById('inputPartnerName'),
    inputMeher: document.getElementById('inputMeher'),
    
    btnCreateRoom: document.getElementById('btnCreateRoom'),
    btnConfirmJoin: document.getElementById('btnConfirmJoin'),
    
    waitingStatusMsg: document.getElementById('waitingStatusMsg'),
    
    liveStatusPill: document.getElementById('liveStatusPill'),
    liveStatusText: document.getElementById('liveStatusText'),
    
    labelGroomName: document.getElementById('labelGroomName'),
    labelBrideName: document.getElementById('labelBrideName'),
    labelMahr: document.getElementById('labelMahr'),
    qaziText: document.getElementById('qaziText'),
    
    groomControls: document.getElementById('groomControls'),
    brideControls: document.getElementById('brideControls'),
    groomSealControls: document.getElementById('groomSealControls'),
    
    btnMakeIjab: document.getElementById('btnMakeIjab'),
    btnQabool1: document.getElementById('btnQabool1'),
    btnQabool2: document.getElementById('btnQabool2'),
    btnQabool3: document.getElementById('btnQabool3'),
    btnGroomSeal: document.getElementById('btnGroomSeal'),
    
    qaboolStep1: document.getElementById('qaboolStep1'),
    qaboolStep2: document.getElementById('qaboolStep2'),
    qaboolStep3: document.getElementById('qaboolStep3'),
    
    progressFill: document.getElementById('progressFill'),
    dot1: document.getElementById('dot1'),
    dot2: document.getElementById('dot2'),
    dot3: document.getElementById('dot3'),
    dot4: document.getElementById('dot4'),
    dot5: document.getElementById('dot5'),
    
    certGroom: document.getElementById('certGroom'),
    certBride: document.getElementById('certBride'),
    certMahr: document.getElementById('certMahr'),
    certDate: document.getElementById('certDate'),
    certSerial: document.getElementById('certSerial'),
    
    musicToggleBtn: document.getElementById('musicToggleBtn'),
    musicIcon: document.getElementById('musicIcon'),
    musicText: document.getElementById('musicText'),
    bgMusic: document.getElementById('bgMusic'),
    
    btnDownloadCert: document.getElementById('btnDownloadCert'),
    btnRestartCeremony: document.getElementById('btnRestartCeremony')
};

// Web Audio Synth
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type = 'sine', duration = 0.5) {
    try {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function playChimeEffect() {
    playTone(523.25, 'triangle', 0.4);
    setTimeout(() => playTone(659.25, 'triangle', 0.4), 150);
    setTimeout(() => playTone(783.99, 'triangle', 0.6), 300);
}

function playCelebrationSound() {
    [523.25, 659.25, 783.99, 1046.50].forEach((note, idx) => {
        setTimeout(() => playTone(note, 'sine', 0.5), idx * 120);
    });
}

// Global Broadcast Channel (Instant Same-Browser / Tab Sync)
let broadcastChannel = null;
try {
    broadcastChannel = new BroadcastChannel('global_nikkah_channel_2026');
    broadcastChannel.onmessage = (event) => {
        handleIncomingData(event.data);
    };
} catch(e) {}

// PeerJS Connection Handlers
function startGroomPeer() {
    state.peer = new Peer(GLOBAL_ROOM_ID, { debug: 1 });

    state.peer.on('open', () => {
        elements.waitingStatusMsg.textContent = 'Groom Connected! Waiting for Dulhan to press join on her screen...';
    });

    state.peer.on('connection', (connection) => {
        state.conn = connection;
        setupConnectionEvents();
        updateLiveStatus(true, 'Partner Connected 🟢');
        
        sendRealtimeData({
            type: 'INIT_DATA',
            groomName: state.yourName,
            brideName: state.partnerName,
            mahr: state.mahr
        });

        startCeremonyStage();
    });

    state.peer.on('error', (err) => {
        console.log('Peer error:', err);
    });
}

function startBridePeer() {
    state.peer = new Peer({ debug: 1 });

    state.peer.on('open', () => {
        state.conn = state.peer.connect(GLOBAL_ROOM_ID);
        setupConnectionEvents();
    });

    state.peer.on('error', (err) => {
        console.log('Bride peer error:', err);
    });
}

function setupConnectionEvents() {
    if (!state.conn) return;

    state.conn.on('open', () => {
        updateLiveStatus(true, 'Live Connected 🟢');
        if (state.role === 'bride') {
            sendRealtimeData({
                type: 'BRIDE_JOINED',
                brideName: state.yourName
            });
            startCeremonyStage();
        }
    });

    state.conn.on('data', (data) => {
        handleIncomingData(data);
    });

    state.conn.on('close', () => {
        updateLiveStatus(false, 'Partner Offline 🔴');
    });
}

function sendRealtimeData(data) {
    if (state.conn && state.conn.open) {
        state.conn.send(data);
    }
    if (broadcastChannel) {
        broadcastChannel.postMessage(data);
    }
}

function updateLiveStatus(isConnected, text) {
    if (isConnected) {
        elements.liveStatusPill.classList.add('connected');
        elements.liveStatusPill.classList.remove('disconnected');
    } else {
        elements.liveStatusPill.classList.remove('connected');
        elements.liveStatusPill.classList.add('disconnected');
    }
    elements.liveStatusText.textContent = text;
}

// Incoming Data Handler
function handleIncomingData(data) {
    switch (data.type) {
        case 'INIT_DATA':
            if (state.role === 'bride') {
                state.partnerName = data.groomName;
                if (data.brideName && !state.yourName) state.yourName = data.brideName;
                state.mahr = data.mahr;
                updateCeremonyLabels();
                updateLiveStatus(true, 'Dulha Online 🟢');
                startCeremonyStage();
            }
            break;

        case 'BRIDE_JOINED':
            updateLiveStatus(true, 'Dulhan Online 🟢');
            if (data.brideName) state.partnerName = data.brideName;
            updateCeremonyLabels();
            startCeremonyStage();
            break;

        case 'IJAB_OFFERED':
            playChimeEffect();
            updateQaziSpeech(`✨ <strong>${state.role === 'bride' ? state.partnerName : 'Dulha'}</strong> ne Nikkah ka Ijab (Offer) bhej diya hai! Ab Dulhan Qabool Hai ka button dabayein.`);
            elements.progressFill.style.width = '20%';
            elements.dot1.classList.add('completed');

            if (state.role === 'bride') {
                elements.brideControls.classList.remove('hidden-box');
                elements.qaboolStep1.classList.remove('hidden-box');
            }
            break;

        case 'QABOOL_1':
            playChimeEffect();
            triggerPetalShower();
            elements.progressFill.style.width = '40%';
            elements.dot2.classList.add('completed');
            updateQaziSpeech(`🌹 Dulhan ne PEHLI BAAR keh diya: <strong>"QABOOL HAI"</strong> 💍!`);
            
            if (state.role === 'bride') {
                elements.qaboolStep1.classList.add('hidden-box');
                elements.qaboolStep2.classList.remove('hidden-box');
            }
            break;

        case 'QABOOL_2':
            playChimeEffect();
            triggerPetalShower();
            elements.progressFill.style.width = '60%';
            elements.dot3.classList.add('completed');
            updateQaziSpeech(`✨ Dulhan ne DOOSRI BAAR keh diya: <strong>"QABOOL HAI"</strong> 💖!`);
            
            if (state.role === 'bride') {
                elements.qaboolStep2.classList.add('hidden-box');
                elements.qaboolStep3.classList.remove('hidden-box');
            }
            break;

        case 'QABOOL_3':
            playChimeEffect();
            triggerPetalShower();
            elements.progressFill.style.width = '80%';
            elements.dot4.classList.add('completed');
            updateQaziSpeech(`🎉 ALHAMDULILLAH! Dulhan ne TEESRI BAAR keh diya: <strong>"QABOOL HAI"</strong>! Ab Dulha Nikkah Complete/Seal karein!`);
            
            if (state.role === 'bride') {
                elements.qaboolStep3.classList.add('hidden-box');
            }
            if (state.role === 'groom') {
                elements.groomControls.classList.add('hidden-box');
                elements.groomSealControls.classList.remove('hidden-box');
            }
            break;

        case 'NIKKAH_SEALED':
            playCelebrationSound();
            triggerGrandConfetti();
            elements.progressFill.style.width = '100%';
            elements.dot5.classList.add('completed');
            showCertificateStage();
            break;

        case 'SIG_DRAW':
            drawRemoteSignature(data.targetCanvas, data.x, data.y, data.isDrawing);
            break;
    }
}

// Setup Event Listeners
elements.btnCreateRoom.addEventListener('click', () => {
    state.yourName = elements.inputYourName.value.trim() || 'Muhammad Ali';
    state.partnerName = elements.inputPartnerName.value.trim() || 'Fatima Noor';
    state.mahr = elements.inputMeher.value.trim() || '1 Gold Ring & Endless Love';
    state.role = 'groom';

    elements.stepSetup.classList.remove('active');
    elements.stepWaiting.classList.remove('hidden-box');
    elements.stepWaiting.classList.add('active');

    startGroomPeer();
});

elements.btnConfirmJoin.addEventListener('click', () => {
    state.yourName = elements.inputYourName.value.trim() || 'Fatima Noor';
    state.partnerName = elements.inputPartnerName.value.trim() || 'Muhammad Ali';
    state.mahr = elements.inputMeher.value.trim() || '1 Gold Ring & Endless Love';
    state.role = 'bride';

    elements.stepSetup.classList.remove('active');
    elements.stepWaiting.classList.remove('hidden-box');
    elements.stepWaiting.classList.add('active');

    startBridePeer();

    setTimeout(() => {
        sendRealtimeData({
            type: 'BRIDE_JOINED',
            brideName: state.yourName
        });
    }, 800);
});

function updateCeremonyLabels() {
    const groom = state.role === 'groom' ? state.yourName : state.partnerName;
    const bride = state.role === 'bride' ? state.yourName : state.partnerName;
    
    elements.labelGroomName.textContent = groom;
    elements.labelBrideName.textContent = bride;
    elements.labelMahr.textContent = state.mahr;
    
    elements.certGroom.textContent = groom;
    elements.certBride.textContent = bride;
    elements.certMahr.textContent = state.mahr;

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    elements.certDate.textContent = `${new Date().toLocaleDateString('en-US', options)} | 1448 Hijri`;
    elements.certSerial.textContent = `NIK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
}

function startCeremonyStage() {
    updateCeremonyLabels();

    elements.stepSetup.classList.remove('active');
    elements.stepWaiting.classList.remove('active');
    elements.stepWaiting.classList.add('hidden-box');
    elements.stepCeremony.classList.remove('hidden-box');
    elements.stepCeremony.classList.add('active');

    if (state.role === 'groom') {
        updateQaziSpeech(`Aap dono online connect ho chuke hain! Dulha <strong>${state.yourName}</strong>, 'Make Ijab (Offer)' button click karain.`);
        elements.groomControls.classList.remove('hidden-box');
        elements.brideControls.classList.add('hidden-box');
    } else {
        updateQaziSpeech(`Aap dono online connect ho chuke hain! Dulha <strong>${state.partnerName}</strong> abhi Nikkah ka Ijab karay ga...`);
        elements.groomControls.classList.add('hidden-box');
        elements.brideControls.classList.add('hidden-box');
    }
}

function updateQaziSpeech(htmlText) {
    elements.qaziText.innerHTML = htmlText;
}

// Action Handlers
elements.btnMakeIjab.addEventListener('click', () => {
    sendRealtimeData({ type: 'IJAB_OFFERED' });
    handleIncomingData({ type: 'IJAB_OFFERED' });
});

elements.btnQabool1.addEventListener('click', () => {
    sendRealtimeData({ type: 'QABOOL_1' });
    handleIncomingData({ type: 'QABOOL_1' });
});

elements.btnQabool2.addEventListener('click', () => {
    sendRealtimeData({ type: 'QABOOL_2' });
    handleIncomingData({ type: 'QABOOL_2' });
});

elements.btnQabool3.addEventListener('click', () => {
    sendRealtimeData({ type: 'QABOOL_3' });
    handleIncomingData({ type: 'QABOOL_3' });
});

elements.btnGroomSeal.addEventListener('click', () => {
    sendRealtimeData({ type: 'NIKKAH_SEALED' });
    handleIncomingData({ type: 'NIKKAH_SEALED' });
});

function showCertificateStage() {
    elements.stepCeremony.classList.remove('active');
    elements.stepCeremony.classList.add('hidden-box');
    elements.stepCertificate.classList.remove('hidden-box');
    elements.stepCertificate.classList.add('active');

    initSignatureCanvas('canvasGroomSig');
    initSignatureCanvas('canvasBrideSig');
}

// Music Control
elements.musicToggleBtn.addEventListener('click', () => {
    if (state.isMusicPlaying) {
        elements.bgMusic.pause();
        elements.musicIcon.textContent = '🎵';
        elements.musicText.textContent = 'Play Music';
        state.isMusicPlaying = false;
    } else {
        elements.bgMusic.play().catch(() => {});
        elements.musicIcon.textContent = '⏸️';
        elements.musicText.textContent = 'Pause Music';
        state.isMusicPlaying = true;
    }
});

// Canvas Confetti
function triggerPetalShower() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#e63946', '#ff85a1', '#ffd700', '#ffffff']
        });
    }
}

function triggerGrandConfetti() {
    if (typeof confetti === 'function') {
        const duration = 4 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 7,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#d4af37', '#e63946', '#ffffff']
            });
            confetti({
                particleCount: 7,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#d4af37', '#e63946', '#ffffff']
            });

            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    }
}

// Signature Canvas
function initSignatureCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    let isDrawing = false;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function startDraw(e) {
        isDrawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        sendRealtimeData({ type: 'SIG_DRAW', targetCanvas: canvasId, x: pos.x, y: pos.y, isDrawing: true });
    }

    function draw(e) {
        if (!isDrawing) return;
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        sendRealtimeData({ type: 'SIG_DRAW', targetCanvas: canvasId, x: pos.x, y: pos.y, isDrawing: false });
    }

    function stopDraw() { isDrawing = false; }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('touchstart', startDraw);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDraw);
}

function drawRemoteSignature(canvasId, x, y, isStart) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    if (isStart) {
        ctx.beginPath();
        ctx.moveTo(x, y);
    } else {
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}

document.querySelectorAll('.btn-sig-clear').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = e.target.getAttribute('data-target');
        const canvas = document.getElementById(targetId);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });
});

// Download Certificate
elements.btnDownloadCert.addEventListener('click', () => {
    const docElement = document.getElementById('nikkahnamaDocument');
    if (typeof html2canvas === 'function') {
        html2canvas(docElement, { scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.download = `Virtual-Nikkah-Certificate-${state.yourName}-${state.partnerName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    } else {
        window.print();
    }
});

elements.btnRestartCeremony.addEventListener('click', () => {
    window.location.reload();
});

// Canvas Particles
const particleCanvas = document.getElementById('particleCanvas');
if (particleCanvas) {
    const ctx = particleCanvas.getContext('2d');
    let width = particleCanvas.width = window.innerWidth;
    let height = particleCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = particleCanvas.width = window.innerWidth;
        height = particleCanvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 35 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1,
        speedY: Math.random() * 0.8 + 0.2,
        speedX: Math.random() * 0.4 - 0.2,
        opacity: Math.random() * 0.7 + 0.3
    }));

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#d4af37';
            ctx.fill();

            p.y -= p.speedY;
            p.x += p.speedX;
            if (p.y < 0) { p.y = height; p.x = Math.random() * width; }
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}
