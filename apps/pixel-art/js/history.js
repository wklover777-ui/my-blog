// ===== history.js =====
const MAX_HISTORY = 50;
let undoStack = [];
let redoStack = [];

function saveSnapshot() {
  // 현재 pixels 상태를 깊은 복사로 저장
  const snapshot = Canvas.pixels.map(row => [...row]);
  undoStack.push(snapshot);

  if (undoStack.length > MAX_HISTORY) {
    undoStack.shift();
  }

  // redo 스택 초기화
  redoStack = [];
  updateButtons();
}

function undo() {
  if (undoStack.length === 0) return;

  // 현재 상태를 redo 스택에 저장
  redoStack.push(Canvas.pixels.map(row => [...row]));

  // 이전 상태 복원
  const snapshot = undoStack.pop();
  Canvas.pixels = snapshot;
  Canvas.drawAll();
  Export.saveToLocal();
  updateButtons();
}

function redo() {
  if (redoStack.length === 0) return;

  // 현재 상태를 undo 스택에 저장
  undoStack.push(Canvas.pixels.map(row => [...row]));

  // 다음 상태 복원
  const snapshot = redoStack.pop();
  Canvas.pixels = snapshot;
  Canvas.drawAll();
  Export.saveToLocal();
  updateButtons();
}

function updateButtons() {
  const undoBtn = document.getElementById('btn-undo');
  const redoBtn = document.getElementById('btn-redo');
  if (undoBtn) undoBtn.disabled = undoStack.length === 0;
  if (redoBtn) redoBtn.disabled = redoStack.length === 0;
}

// 키보드 단축키
document.addEventListener('keydown', e => {
  // 입력 필드에서는 무시
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    } else if (e.key === 'y' || e.key === 'Y') {
      e.preventDefault();
      redo();
    }
  }
});

window.History = { saveSnapshot, undo, redo };
