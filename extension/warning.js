(function () {
  const BACKEND_URL = "https://cipher-shds.onrender.com";
  const domainText = document.getElementById("domainText");
  const messageText = document.getElementById("messageText");
  const audioEl = document.getElementById("voiceWarning");
  const closeBtn = document.getElementById("closeBtn");

  function loadWarning() {
    chrome.storage.local.get(["supersafeWarning"], (result) => {
      const info = result.supersafeWarning || {};
      const domain = info.domain || "this site";

      domainText.textContent = `Blocked site: ${domain}`;

      if (info.blockedBySuperSafe) {
        messageText.textContent =
          "SuperSafe Mode is ON. Only parent-approved websites are allowed.";
      }

      let voiceUrl = info.voiceMessageUrl;
      if (voiceUrl) {
        if (voiceUrl.startsWith("/")) {
          voiceUrl = BACKEND_URL + voiceUrl;
        }
        audioEl.src = voiceUrl;
        audioEl.style.display = "block";
        // Attempt autoplay after a short delay so the element is ready
        setTimeout(() => {
          audioEl
            .play()
            .catch(() => {
              // Autoplay may be blocked; user can press play manually
            });
        }, 300);
      }
    });
  }

  closeBtn.addEventListener("click", () => {
    window.close();
  });

  document.addEventListener("DOMContentLoaded", loadWarning);
})();

