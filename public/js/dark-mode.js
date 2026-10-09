(function() {
  function init() {
    // ── Create gear icon button ──
    const gearBtn = document.createElement('button');
    gearBtn.id = 'settingsGearBtn';
    gearBtn.innerHTML = '<i class="ti ti-settings"></i>';
    gearBtn.title = 'Settings';

    function isMobileView() {
      return window.innerWidth <= 768;
    }

    // ── Set position based on screen size ──
    function updateGearPosition() {
      const isMobile = isMobileView();
      gearBtn.style.cssText = `
        position: fixed;
        ${isMobile ? 'top: 20px; right: 20px; bottom: auto; left: auto;' : 'bottom: 30px; left: 30px;'}
        width: 48px; height: 48px;
        border-radius: 50%; background: #185FA5; color: white; border: none;
        font-size: 22px; cursor: pointer; z-index: 999;
        box-shadow: 0 8px 20px rgba(24,95,165,0.25);
        display: flex; align-items: center; justify-content: center;
        transition: background 0.2s, box-shadow 0.2s;
      `;
      updatePanelPosition();
    }

    // ── Reposition on resize ──
    window.addEventListener('resize', updateGearPosition);

    // ── Create settings panel ──
    const panel = document.createElement('div');
    panel.id = 'settingsPanel';
    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <strong style="color:#042C53;">Settings</strong>
        <button id="closeSettingsBtn" style="background:none; border:none; font-size:18px; cursor:pointer;">✕</button>
      </div>
      <div class="setting-row">
        <span>Dark Mode</span>
        <label class="switch">
          <input type="checkbox" id="darkModeToggle">
          <span class="slider round"></span>
        </label>
      </div>
      <div class="setting-row">
        <span>Game Mode</span>
        <label class="switch">
          <input type="checkbox" id="gameModeToggle">
          <span class="slider round"></span>
        </label>
      </div>
      <div class="setting-row">
        <span>Sound</span>
        <label class="switch">
          <input type="checkbox" id="soundToggle">
          <span class="slider round"></span>
        </label>
      </div>
    `;
    panel.style.cssText = `
      position: fixed; width: 240px;
      background: white; border-radius: 16px; padding: 16px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.2); z-index: 1000;
      display: none; flex-direction: column; gap: 12px;
    `;

    // ── Keep panel anchored near the gear button on any screen size ──
    function updatePanelPosition() {
      const isMobile = isMobileView();
      if (isMobile) {
        panel.style.top = '78px';
        panel.style.right = '20px';
        panel.style.bottom = 'auto';
        panel.style.left = 'auto';
      } else {
        panel.style.top = 'auto';
        panel.style.right = 'auto';
        panel.style.bottom = '90px';
        panel.style.left = '30px';
      }
    }

    // ── Inject CSS for toggle switches ──
    const style = document.createElement('style');
    style.textContent = `
      .setting-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #042C53; }
      .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
      .switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 24px; }
      .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
      input:checked + .slider { background-color: #185FA5; }
      input:checked + .slider:before { transform: translateX(20px); }
    `;
    document.head.appendChild(style);

    document.body.appendChild(gearBtn);
    document.body.appendChild(panel);

    // Now that both elements exist, set their initial positions
    updateGearPosition();

    // ── State ──
    let darkMode = localStorage.getItem('darkMode') === 'true';
    let gameMode = localStorage.getItem('gameMode') === 'true';
    let soundOn = localStorage.getItem('soundOn') !== 'false';

    function applyDarkMode() {
      document.body.classList.toggle('dark-mode', darkMode);
      updateGearIcon();
    }
    function applyGameMode() {
      document.body.classList.toggle('game-mode', gameMode);
      updateGearIcon();
    }

    // ── Reflect current mode on the gear button itself ──
    function updateGearIcon() {
      let iconClass = 'ti ti-settings';
      if (gameMode) {
        iconClass = 'ti ti-device-gamepad-2';
      } else if (darkMode) {
        iconClass = 'ti ti-moon-stars';
      }
      gearBtn.innerHTML = `<i class="${iconClass}"></i>`;
    }

    applyDarkMode();
    applyGameMode();

    const darkToggle = document.getElementById('darkModeToggle');
    const gameToggle = document.getElementById('gameModeToggle');
    const soundToggle = document.getElementById('soundToggle');
    darkToggle.checked = darkMode;
    gameToggle.checked = gameMode;
    soundToggle.checked = soundOn;

    // ── Event listeners ──
    gearBtn.addEventListener('click', () => {
      panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    });

    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
      panel.style.display = 'none';
    });

    darkToggle.addEventListener('change', () => {
      darkMode = darkToggle.checked;
      localStorage.setItem('darkMode', darkMode);
      applyDarkMode();
    });

    gameToggle.addEventListener('change', () => {
      gameMode = gameToggle.checked;
      localStorage.setItem('gameMode', gameMode);
      applyGameMode();
    });

    soundToggle.addEventListener('change', () => {
      soundOn = soundToggle.checked;
      localStorage.setItem('soundOn', soundOn);
    });

    document.addEventListener('click', function(e) {
      if (!panel.contains(e.target) && !gearBtn.contains(e.target)) {
        panel.style.display = 'none';
      }
    });

    window.isSoundEnabled = function() {
      return localStorage.getItem('soundOn') !== 'false';
    };
  }

  // Wait for body to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();