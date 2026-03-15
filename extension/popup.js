const BACKEND_URL = "http://localhost:5000";

document.addEventListener('DOMContentLoaded', function () {
  const tokenInput = document.getElementById('jwtToken');
  const passwordInput = document.getElementById('parentPassword');
  const saveButton = document.getElementById('saveToken');
  const disconnectButton = document.getElementById('disconnectExtension');
  const successMessage = document.getElementById('success-message');
  const statusTitle = document.querySelector('#form h3');
  const statusText = document.querySelector('#form p');
  const lockoutTimer = document.getElementById('lockoutTimer');
  const timerValue = document.getElementById('timerValue');
  const errorMessage = document.getElementById('errorMessage');
  let countdownInterval;

  const getFromStorage = (key) => {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => resolve(result[key]));
    });
  };

  const setInStorage = (key, value) => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  };

  const removeFromStorage = (key) => {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, resolve);
    });
  };

  getFromStorage("token").then(async (token) => {
    const lockoutUntil = await getFromStorage("lockoutUntil");
    if (lockoutUntil && new Date(lockoutUntil) > new Date()) {
      startLockout(new Date(lockoutUntil));
    }

    const scannedToken = await getFromStorage("scannedToken");
    if (scannedToken) {
      tokenInput.value = scannedToken;
      saveButton.disabled = !scannedToken.trim();
      await removeFromStorage("scannedToken");
    }

    const scanOrPaste = document.getElementById('scanOrPaste');
    if (token) {
      tokenInput.style.display = 'none';
      if (scanOrPaste) scanOrPaste.style.display = 'none';
      passwordInput.placeholder = "Enter password to disconnect";
      saveButton.style.display = 'none';
      disconnectButton.style.display = 'block';
      statusTitle.textContent = "SproutSafe Active";
      statusText.textContent = "You are currently protected.";
    } else {
      tokenInput.style.display = 'block';
      if (scanOrPaste) scanOrPaste.style.display = 'flex';
      passwordInput.placeholder = "Enter parent password";
      saveButton.style.display = 'block';
      disconnectButton.style.display = 'none';
      statusTitle.textContent = "SproutSafe Disabled";
      statusText.textContent = "Please enter your token and password to enable protection.";
    }
  });

  const scanQRBtn = document.getElementById('scanQR');
  if (scanQRBtn) scanQRBtn.addEventListener('click', function () {
    chrome.tabs.create({ url: chrome.runtime.getURL("scan.html") });
  });

  function startLockout(untilDate) {
    if (countdownInterval) clearInterval(countdownInterval);

    lockoutTimer.style.display = 'block';
    errorMessage.style.display = 'none';
    saveButton.disabled = true;
    disconnectButton.disabled = true;
    passwordInput.disabled = true;
    tokenInput.disabled = true;

    setInStorage("lockoutUntil", untilDate.toISOString());

    countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = untilDate.getTime() - now;

      if (distance < 0) {
        clearInterval(countdownInterval);
        lockoutTimer.style.display = 'none';
        saveButton.disabled = false;
        disconnectButton.disabled = false;
        passwordInput.disabled = false;
        tokenInput.disabled = false;
        removeFromStorage("lockoutUntil");
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      timerValue.textContent =
        String(hours).padStart(2, '0') + ":" +
        String(minutes).padStart(2, '0') + ":" +
        String(seconds).padStart(2, '0');
    }, 1000);
  }

  tokenInput.addEventListener('input', function () {
    saveButton.disabled = !this.value.trim();
    errorMessage.style.display = 'none';
  });

  passwordInput.addEventListener('input', function () {
    errorMessage.style.display = 'none';
  });

  saveButton.addEventListener('click', async function () {
    const token = tokenInput.value.trim();
    const password = passwordInput.value.trim();
    if (!token || !password) {
      alert("Please enter both token and password");
      return;
    }

    try {
      await setInStorage("token", token);

      const response = await fetch(`${BACKEND_URL}/api/monitor/activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 403 && data.lockoutUntil) {
          startLockout(new Date(data.lockoutUntil));
        }
        errorMessage.textContent = data.message || "Activation failed";
        errorMessage.style.display = 'block';
        await removeFromStorage("token");
        return;
      }

      tokenInput.style.display = 'none';
      passwordInput.value = '';
      passwordInput.placeholder = "Enter password to disconnect";
      saveButton.style.display = 'none';
      disconnectButton.style.display = 'block';
      statusTitle.textContent = "SproutSafe Active";
      statusText.textContent = "You are currently protected.";
      successMessage.style.display = 'block';

      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 3000);
    } catch (error) {
      errorMessage.textContent = "Failed to connect to server";
      errorMessage.style.display = 'block';
      await removeFromStorage("token");
    }
  });

  disconnectButton.addEventListener('click', async function () {
    const token = await getFromStorage("token");
    const password = passwordInput.value.trim();
    if (!token) return;
    if (!password) {
      alert("Please enter password to disconnect");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/monitor/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.lockoutUntil) {
          startLockout(new Date(data.lockoutUntil));
        }
        errorMessage.textContent = data.message || "Disconnection failed. Check password.";
        errorMessage.style.display = 'block';
        return;
      }

      await removeFromStorage("token");

      tokenInput.value = '';
      passwordInput.value = '';
      passwordInput.placeholder = "Enter parent password";
      tokenInput.style.display = 'block';
      saveButton.style.display = 'block';
      disconnectButton.style.display = 'none';
      statusTitle.textContent = "SproutSafe Disabled";
      statusText.textContent = "Please enter your token and password to enable protection.";

      successMessage.textContent = "Extension disconnected successfully.";
      successMessage.style.display = 'block';
      successMessage.style.color = 'orange';

      setTimeout(() => {
        successMessage.style.display = 'none';
        successMessage.style.color = 'green';
        successMessage.textContent = "Your protection is now active.";
      }, 3000);

    } catch (error) {
      errorMessage.textContent = "Failed to connect to server";
      errorMessage.style.display = 'block';
    }
  });
});
