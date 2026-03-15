(function () {
  const video = document.getElementById('video');
  const successDiv = document.getElementById('success');
  const errorDiv = document.getElementById('error');
  const closeBtn = document.getElementById('closeBtn');
  const videoContainer = document.getElementById('videoContainer');

  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
  }

  function showSuccess() {
    videoContainer.style.display = 'none';
    successDiv.style.display = 'block';
    closeBtn.style.display = 'block';
  }

  function setToken(token) {
    chrome.storage.local.set({ scannedToken: token }, showSuccess);
  }

  if (!('BarcodeDetector' in window)) {
    showError('QR scanning is not supported in this browser. Please paste the token manually.');
    return;
  }

  const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then((stream) => {
      video.srcObject = stream;
      video.onloadedmetadata = () => video.play();
    })
    .catch(() => showError('Camera access denied. Please allow camera and try again.'));

  function detectLoop() {
    if (successDiv.style.display === 'block') return;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(detectLoop);
      return;
    }
    barcodeDetector.detect(video)
      .then((barcodes) => {
        if (barcodes.length > 0 && barcodes[0].rawValue) {
          const value = barcodes[0].rawValue.trim();
          if (value.length > 20) {
            setToken(value);
            return;
          }
        }
        requestAnimationFrame(detectLoop);
      })
      .catch(() => requestAnimationFrame(detectLoop));
  }

  video.onplaying = () => detectLoop();

  closeBtn.addEventListener('click', () => window.close());
})();
