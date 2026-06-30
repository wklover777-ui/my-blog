// ===== palette.js =====
const DEFAULT_COLORS = [
  '',          // 투명
  '#000000', '#ffffff', '#808080', '#c0c0c0',
  '#ff0000', '#ff8000', '#ffff00', '#80ff00',
  '#00ff00', '#00ff80', '#00ffff', '#0080ff',
  '#0000ff', '#8000ff', '#ff00ff', '#ff0080',
  '#800000', '#804000', '#808000', '#408000',
  '#008000', '#008040', '#008080', '#004080',
  '#000080', '#400080', '#800080', '#800040',
  '#ffcccc', '#ffd9b3', '#ffffcc', '#ccffcc',
];

let currentColor = '#000000';
let recentColors = [];

function setColor(color) {
  currentColor = color;
  updateCurrentColorBox();

  // 투명이 아닐 때만 최근 색상에 추가
  if (color !== '') {
    updateRecent(color);
  }

  // 팔레트 셀 선택 상태 업데이트
  document.querySelectorAll('.palette-cell').forEach(cell => {
    cell.classList.toggle('selected', cell.dataset.color === color);
  });
}

function renderPalette() {
  const grid = document.getElementById('palette-grid');
  grid.innerHTML = '';

  DEFAULT_COLORS.forEach(color => {
    const cell = createCell(color);
    grid.appendChild(cell);
  });

  renderRecent();
}

function createCell(color) {
  const cell = document.createElement('div');
  cell.className = 'palette-cell';
  cell.dataset.color = color;

  if (color === '') {
    cell.classList.add('transparent');
    cell.title = '투명';
  } else {
    cell.style.background = color;
    cell.title = color;
  }

  if (color === currentColor) {
    cell.classList.add('selected');
  }

  cell.addEventListener('click', () => setColor(color));
  return cell;
}

function renderRecent() {
  const container = document.getElementById('recent-colors');
  container.innerHTML = '';

  recentColors.forEach(color => {
    container.appendChild(createCell(color));
  });

  // 빈 슬롯 채우기
  for (let i = recentColors.length; i < 8; i++) {
    const empty = document.createElement('div');
    empty.className = 'palette-cell';
    empty.style.background = '#1a1a2e';
    empty.style.border = '2px dashed #3a3a5c';
    container.appendChild(empty);
  }
}

function updateRecent(color) {
  // 이미 있으면 제거 후 앞에 추가
  recentColors = recentColors.filter(c => c !== color);
  recentColors.unshift(color);
  if (recentColors.length > 8) recentColors = recentColors.slice(0, 8);
  renderRecent();
}

function updateCurrentColorBox() {
  const box = document.getElementById('current-color-box');
  if (!box) return;

  if (currentColor === '') {
    box.classList.add('transparent');
    box.style.background = '';
  } else {
    box.classList.remove('transparent');
    box.style.background = currentColor;
  }
}

// 커스텀 색상 피커 연결
document.addEventListener('DOMContentLoaded', () => {
  const picker = document.getElementById('custom-color-picker');
  if (picker) {
    picker.addEventListener('input', e => setColor(e.target.value));
    picker.addEventListener('change', e => setColor(e.target.value));

    const label = document.querySelector('.custom-color-btn');
    if (label) {
      label.addEventListener('click', () => picker.click());
    }
  }

  // 현재 색상 박스 클릭 시 피커 열기
  const colorBox = document.getElementById('current-color-box');
  if (colorBox) {
    colorBox.addEventListener('click', () => {
      const picker = document.getElementById('custom-color-picker');
      if (picker) {
        picker.value = currentColor || '#000000';
        picker.click();
      }
    });
  }
});

window.Palette = {
  get currentColor() { return currentColor; },
  renderPalette,
  updateRecent,
  setColor,
};
