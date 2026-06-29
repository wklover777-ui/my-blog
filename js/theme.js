(function () {
  const STORAGE_KEY = 'theme';
  const root = document.documentElement;

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    updateToggleIcon(theme);
    updateHljsTheme(theme);
  }

  function updateToggleIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function updateHljsTheme(theme) {
    const lightLink = document.getElementById('hljs-light');
    const darkLink = document.getElementById('hljs-dark');
    if (lightLink) lightLink.disabled = theme === 'dark';
    if (darkLink) darkLink.disabled = theme !== 'dark';
  }

  function toggle() {
    const current = root.getAttribute('data-theme') || getSystemTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // Initialize — read saved preference or fall back to system
  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = saved || getSystemTheme();
  applyTheme(initial);

  // Expose toggle for button onclick
  window.toggleTheme = toggle;

  // Listen for system preference changes (when no manual override)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
})();
