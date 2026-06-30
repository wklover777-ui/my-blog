/**
 * input.js — 키보드 / 터치 입력 처리
 * game.js, render.js 이후에 로드됨.
 */

(function () {
  'use strict';

  const ANIM_DURATION = 210; // ms — CSS transition(200ms)보다 약간 여유
  const MIN_SWIPE = 30;       // px — 최소 스와이프 거리

  let moving = false;         // 이동 중 입력 잠금

  // ===== 방향 → 이동 + 렌더 =====
  function handleMove(direction) {
    if (moving) return;

    const moved = Game.move(direction);
    if (!moved) return;

    moving = true;
    Render.update();
    setTimeout(() => { moving = false; }, ANIM_DURATION);
  }

  // ===== 키보드 =====
  document.addEventListener('keydown', function (e) {
    const map = {
      ArrowUp:    'up',
      ArrowDown:  'down',
      ArrowLeft:  'left',
      ArrowRight: 'right',
    };
    const dir = map[e.key];
    if (!dir) return;
    e.preventDefault();
    handleMove(dir);
  });

  // ===== 터치 =====
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', function (e) {
    // 버튼 터치는 무시
    if (e.target.closest('button')) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    if (e.target.closest('button')) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) < MIN_SWIPE && Math.abs(dy) < MIN_SWIPE) return;

    let dir;
    if (Math.abs(dx) >= Math.abs(dy)) {
      dir = dx > 0 ? 'right' : 'left';
    } else {
      dir = dy > 0 ? 'down' : 'up';
    }
    handleMove(dir);
  });

  // 게임 영역에서 스크롤 방지
  const gridContainer = document.getElementById('grid-container');
  gridContainer.addEventListener('touchmove', function (e) {
    e.preventDefault();
  }, { passive: false });

  // ===== 버튼 이벤트 =====

  // 새 게임 버튼 (헤더)
  document.getElementById('btn-new').addEventListener('click', function () {
    moving = false;
    Game.initGame();
    Render.update();
  });

  // 다시 시작 버튼 (게임 오버 오버레이)
  document.getElementById('btn-retry').addEventListener('click', function () {
    moving = false;
    Game.initGame();
    Render.update();
  });

  // 계속 플레이 버튼 (승리 오버레이)
  document.getElementById('btn-continue').addEventListener('click', function () {
    Game.continueGame();
    Render.showOverlay(null);
  });

  // 새 게임 버튼 (승리 오버레이)
  document.getElementById('btn-new-win').addEventListener('click', function () {
    moving = false;
    Game.initGame();
    Render.update();
  });

  // ===== DOMContentLoaded 후 게임 시작 =====
  // (이 파일 자체가 body 끝에 로드되므로 DOM은 이미 준비됨)
  Game.initGame();
  Render.update();
})();
