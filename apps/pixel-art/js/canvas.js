// ===== canvas.js =====
const GRID = 16;
let cellSize = 24;
let pixels = [];
let showGrid = true;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gridCanvas = document.getElementById('grid-canvas');
const gridCtx = gridCanvas.getContext('2d');

function initCanvas() {
  const wrapper = canvas.parentElement;
  const containerWidth = Math.min(wrapper.clientWidth || 480, 480);
  cellSize = Math.floor(containerWidth / GRID);

  const totalSize = cellSize * GRID;
  canvas.width = totalSize;
  canvas.height = totalSize;
  gridCanvas.width = totalSize;
  gridCanvas.height = totalSize;

  // CSS 표시 크기
  canvas.style.width = totalSize + 'px';
  canvas.style.height = totalSize + 'px';
  gridCanvas.style.width = totalSize + 'px';
  gridCanvas.style.height = totalSize + 'px';

  // pixels 배열 초기화 ('' = 투명)
  pixels = [];
  for (let r = 0; r < GRID; r++) {
    pixels[r] = [];
    for (let c = 0; c < GRID; c++) {
      pixels[r][c] = '';
    }
  }
  // drawAll()은 호출하지 않음 — 리사이즈 시 픽셀 복원 후 호출
}

function drawAll() {
  drawPixels();
  if (showGrid) {
    drawGridLines();
  } else {
    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  }
}

function drawPixels() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 배경: 체크무늬 (투명 픽셀 표현)
  const checkSize = Math.max(2, Math.floor(cellSize / 4));
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const x = c * cellSize;
      const y = r * cellSize;

      if (pixels[r][c] === '') {
        // 투명: 체크무늬 배경
        for (let dy = 0; dy < cellSize; dy += checkSize) {
          for (let dx = 0; dx < cellSize; dx += checkSize) {
            const even = ((Math.floor(dx / checkSize) + Math.floor(dy / checkSize)) % 2 === 0);
            ctx.fillStyle = even ? '#888888' : '#cccccc';
            ctx.fillRect(x + dx, y + dy, checkSize, checkSize);
          }
        }
      } else {
        ctx.fillStyle = pixels[r][c];
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }
}

function drawGridLines() {
  gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  gridCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  gridCtx.lineWidth = 0.5;

  for (let i = 0; i <= GRID; i++) {
    // 세로선
    gridCtx.beginPath();
    gridCtx.moveTo(i * cellSize, 0);
    gridCtx.lineTo(i * cellSize, gridCanvas.height);
    gridCtx.stroke();

    // 가로선
    gridCtx.beginPath();
    gridCtx.moveTo(0, i * cellSize);
    gridCtx.lineTo(gridCanvas.width, i * cellSize);
    gridCtx.stroke();
  }
}

function getCellFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  let clientX, clientY;

  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;

  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);

  if (row < 0 || row >= GRID || col < 0 || col >= GRID) return null;
  return { row, col };
}

function paintCell(row, col, color) {
  if (row < 0 || row >= GRID || col < 0 || col >= GRID) return;
  pixels[row][col] = color;
  drawAll();
}

function clearAll() {
  History.saveSnapshot();
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      pixels[r][c] = '';
    }
  }
  drawAll();
  Export.saveToLocal();
}

function toggleGrid() {
  showGrid = !showGrid;
  const btn = document.getElementById('btn-toggle-grid');
  if (btn) btn.classList.toggle('active', showGrid);
  drawAll();
}

window.Canvas = {
  initCanvas,
  drawAll,
  paintCell,
  clearAll,
  toggleGrid,
  get pixels() { return pixels; },
  set pixels(v) { pixels = v; },
  GRID,
  getCellFromEvent,
  get cellSize() { return cellSize; },
};

// 창 크기 변경 시 재초기화
window.addEventListener('resize', () => {
  const savedPixels = pixels.map(row => [...row]);
  initCanvas();
  pixels = savedPixels;
  drawAll();
});
