// ===== tools.js =====
let currentTool = 'pen';
let isDrawing = false;
let lastCell = null;

function setTool(tool) {
  currentTool = tool;

  // 버튼 UI 업데이트
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById('tool-' + tool);
  if (activeBtn) activeBtn.classList.add('active');

  // 커서 스타일
  const c = document.getElementById('canvas');
  if (tool === 'eyedropper') {
    c.style.cursor = 'crosshair';
  } else if (tool === 'fill') {
    c.style.cursor = 'cell';
  } else {
    c.style.cursor = 'default';
  }
}

function applyTool(e) {
  const cell = Canvas.getCellFromEvent(e);
  if (!cell) return;

  const { row, col } = cell;

  if (currentTool === 'pen') {
    // 같은 셀 반복 방지
    if (lastCell && lastCell.row === row && lastCell.col === col) return;
    lastCell = { row, col };
    Canvas.paintCell(row, col, Palette.currentColor);
    Export.saveToLocal();
  } else if (currentTool === 'eraser') {
    if (lastCell && lastCell.row === row && lastCell.col === col) return;
    lastCell = { row, col };
    Canvas.paintCell(row, col, '');
    Export.saveToLocal();
  } else if (currentTool === 'fill') {
    // 채우기는 mousedown 시 한 번만
    History.saveSnapshot();
    floodFill(row, col, Canvas.pixels[row][col], Palette.currentColor);
    Canvas.drawAll();
    Export.saveToLocal();
  } else if (currentTool === 'eyedropper') {
    const color = Canvas.pixels[row][col];
    Palette.setColor(color);
    // 스포이드 후 펜으로 자동 전환
    setTool('pen');
  }
}

function floodFill(startRow, startCol, targetColor, fillColor) {
  if (targetColor === fillColor) return;

  const queue = [{ row: startRow, col: startCol }];
  const visited = new Set();

  while (queue.length > 0) {
    const { row, col } = queue.shift();
    const key = row + ',' + col;

    if (visited.has(key)) continue;
    if (row < 0 || row >= Canvas.GRID || col < 0 || col >= Canvas.GRID) continue;
    if (Canvas.pixels[row][col] !== targetColor) continue;

    visited.add(key);
    Canvas.pixels[row][col] = fillColor;

    queue.push(
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 }
    );
  }
}

// ===== 마우스 이벤트 =====
const canvasEl = document.getElementById('canvas');

canvasEl.addEventListener('mousedown', e => {
  e.preventDefault();
  isDrawing = true;
  lastCell = null;

  // fill과 eyedropper는 applyTool 내부에서 snapshot을 직접 저장하므로 여기서는 pen/eraser만 저장
  if (currentTool === 'pen' || currentTool === 'eraser') {
    History.saveSnapshot();
  }

  applyTool(e);
});

canvasEl.addEventListener('mousemove', e => {
  if (!isDrawing) return;
  if (currentTool === 'pen' || currentTool === 'eraser') {
    applyTool(e);
  }
});

canvasEl.addEventListener('mouseup', () => {
  isDrawing = false;
  lastCell = null;
});

canvasEl.addEventListener('mouseleave', () => {
  isDrawing = false;
  lastCell = null;
});

// ===== 터치 이벤트 =====
canvasEl.addEventListener('touchstart', e => {
  e.preventDefault();
  isDrawing = true;
  lastCell = null;

  if (currentTool === 'pen' || currentTool === 'eraser') {
    History.saveSnapshot();
  }

  applyTool(e);
}, { passive: false });

canvasEl.addEventListener('touchmove', e => {
  e.preventDefault();
  if (!isDrawing) return;
  if (currentTool === 'pen' || currentTool === 'eraser') {
    applyTool(e);
  }
}, { passive: false });

canvasEl.addEventListener('touchend', () => {
  isDrawing = false;
  lastCell = null;
});

// ===== 키보드 단축키 P/E/F/I =====
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  switch (e.key.toLowerCase()) {
    case 'p': setTool('pen'); break;
    case 'e': setTool('eraser'); break;
    case 'f': setTool('fill'); break;
    case 'i': setTool('eyedropper'); break;
  }
});

window.Tools = { get currentTool() { return currentTool; }, setTool };

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
  Canvas.initCanvas();
  Canvas.drawAll();
  Palette.renderPalette();
  Palette.setColor('#000000');
  Export.loadFromLocal();
});
