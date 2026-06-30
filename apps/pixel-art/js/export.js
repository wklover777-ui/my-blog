// ===== export.js =====
const LOCAL_KEY = 'pixel-art-pixels';

function exportPNG(size) {
  size = size || 64;

  const offscreen = document.createElement('canvas');
  offscreen.width = size;
  offscreen.height = size;
  const offCtx = offscreen.getContext('2d');

  const scale = size / Canvas.GRID;

  for (let r = 0; r < Canvas.GRID; r++) {
    for (let c = 0; c < Canvas.GRID; c++) {
      const color = Canvas.pixels[r][c];
      if (color === '') continue; // 투명 픽셀은 그리지 않음
      offCtx.fillStyle = color;
      offCtx.fillRect(
        Math.round(c * scale),
        Math.round(r * scale),
        Math.round(scale),
        Math.round(scale)
      );
    }
  }

  const dataURL = offscreen.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = 'pixel-art.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function saveToLocal() {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(Canvas.pixels));
  } catch (e) {
    // localStorage 사용 불가 시 무시
  }
}

function loadFromLocal() {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);

    // 크기 검증
    if (
      Array.isArray(parsed) &&
      parsed.length === Canvas.GRID &&
      parsed[0].length === Canvas.GRID
    ) {
      Canvas.pixels = parsed;
      Canvas.drawAll();
    }
  } catch (e) {
    // 복원 실패 시 무시
  }
}

window.Export = { exportPNG, saveToLocal, loadFromLocal };
