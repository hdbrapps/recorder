let mediaRecorder;
let recordedChunks = [];
const videoElement = document.getElementById('recordedVideo');
const previewImageElement = document.getElementById('previewImage');
const startRecordingButton = document.getElementById('startRecording');
const stopRecordingButton = document.getElementById('stopRecording');
const stopAndPlayButton = document.getElementById('stopAndPlay');
const videoContainer = document.getElementById('videoContainer');
const statusText = document.getElementById('status');
const downloadLink = document.getElementById('downloadLink');

startRecordingButton.addEventListener('click', startRecording);

function startRecording() {
    navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    }).then((stream) => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start();
        startRecordingButton.style.display = 'none';
        stopRecordingButton.style.display = 'block';
        statusText.style.display = 'block';
        statusText.classList.remove('fade-in-out');
        statusText.innerText = 'Gravação em andamento...';
    }).catch((error) => console.error('Erro ao obter a mídia:', error));
}

stopRecordingButton.addEventListener('click', stopRecording);

function stopRecording() {
    mediaRecorder.stop();
    startRecordingButton.style.display = 'none';
    stopRecordingButton.style.display = 'none';
    stopAndPlayButton.style.display = 'block';
    statusText.innerText = 'Gravação concluída';
    statusText.classList.add('fade-in-out');
    // Capturar uma imagem de pré-visualização do vídeo
    const videoStream = videoElement.captureStream();
    const track = videoStream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);
    imageCapture.grabFrame().then((imageBitmap) => {
        previewImageElement.src = URL.createObjectURL(imageBitmap);
        previewImageElement.style.display = 'block';
    }).catch((error) => console.error('Erro ao capturar imagem:', error));

    // Exibir modal para o usuário inserir o nome do vídeo
    Swal.fire({
        title: 'Salvar vídeo',
        input: 'text',
        inputLabel: 'Nome do vídeo',
        showCancelButton: true,
        confirmButtonText: 'Baixar',
        preConfirm: (videoName) => {
            return new Promise((resolve) => {
                if (videoName) {
                    resolve(videoName);
                } else {
                    Swal.showValidationMessage('Por favor, insira um nome para o vídeo');
                }
            });
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const videoName = result.value;
            downloadVideo(videoName);
        }
    });
}

stopAndPlayButton.addEventListener('click', stopAndPlay);

function stopAndPlay() {
    videoElement.controls = true;
    const blob = new Blob(recordedChunks, {
        type: 'video/webm'
    });
    const url = URL.createObjectURL(blob);
    videoElement.src = url;
    videoContainer.style.display = 'block';
    downloadLink.style.display = 'block';
    downloadLink.href = url;
    downloadLink.download = 'Capture.mp4';
    stopAndPlayButton.style.display = 'none';
}

function handleDataAvailable(event) {
    recordedChunks.push(event.data);
}

function downloadVideo(videoName) {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoName}.mp4`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
}