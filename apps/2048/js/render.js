/**
 * render.js — DOM 렌더링
 * game.js 이후에 로드됨.
 */

(function () {
  'use strict';

  const tileContainer = document.getElementById('tile-container');
  const scoreEl       = document.getElementById('score');
  const bestEl        = document.getElementById('best');
  const overlayGameover = document.getElementById('overlay-gameover');
  const overlayWin      = document.getElementById('overlay-win');

  /**
   * CSS 변수 --cell-size 와 --gap 을 실제 픽셀값으로 읽어옴.
   * 반응형에서도 정확한 타일 위치 계산을 위해 사용.
   */
  function getCellMetrics() {
    const style = getComputedStyle(document.documentElement);
    const cellSize = parseFloat(style.getPropertyValue('--cell-size'));
    const gap      = parseFloat(style.getPropertyValue('--gap'));
    return { cellSize, gap };
  }

  /**
   * board 배열 기반으로 tile-container 안의 타일 DOM을 전부 다시 그린다.
   */
  function update() {
    const board   = Game.getBoard();
    const merged  = Game.getMerged();
    const newTiles = Game.getNewTiles();
    const { cellSize, gap } = getCellMetrics();

    // 기존 타일 모두 제거
    tileContainer.innerHTML = '';

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = board[r][c];
        if (val === 0) continue;

        const tile = document.createElement('div');

        // 값 클래스
        const cls = val > 2048 ? 'tile-super' : `tile-${val}`;
        tile.className = `tile ${cls}`;
        tile.dataset.value = val;

        // 위치
        tile.style.top  = `${r * (cellSize + gap)}px`;
        tile.style.left = `${c * (cellSize + gap)}px`;

        // 텍스트
        tile.textContent = val;

        // 애니메이션 클래스
        const isNew = newTiles.some(t => t.row === r && t.col === c);
        if (isNew) {
          tile.classList.add('tile-new');
        } else if (merged[r][c]) {
          tile.classList.add('tile-merged');
        }

        tileContainer.appendChild(tile);
      }
    }

    // 점수 업데이트
    scoreEl.textContent = Game.getScore();
    bestEl.textContent  = Game.getBest();

    // 오버레이
    if (Game.isWon()) {
      showOverlay('win');
    } else if (Game.isOver()) {
      showOverlay('gameover');
    } else {
      showOverlay(null);
    }
  }

  /**
   * 오버레이 표시 제어
   * @param {'gameover'|'win'|null} which
   */
  function showOverlay(which) {
    overlayGameover.classList.toggle('active', which === 'gameover');
    overlayWin.classList.toggle('active', which === 'win');
  }

  window.Render = { update, showOverlay };
})();
