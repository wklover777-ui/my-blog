/**
 * game.js — 2048 게임 로직
 * render.js보다 먼저 로드됨.
 */

(function () {
  'use strict';

  // ===== 전역 상태 =====
  let board = [];       // 4×4 배열 (값: 0 또는 숫자)
  let mergedBoard = []; // 4×4 배열 (병합된 위치 표시)
  let newTiles = [];    // [{row, col}] — 이번 턴에 새로 생긴 타일
  let score = 0;
  let bestScore = parseInt(localStorage.getItem('2048-best') || '0', 10);
  let won = false;
  let over = false;
  let keepPlaying = false; // 2048 달성 후 계속하기 선택

  // ===== 초기화 =====
  function initGame() {
    board = Array.from({ length: 4 }, () => Array(4).fill(0));
    mergedBoard = Array.from({ length: 4 }, () => Array(4).fill(false));
    newTiles = [];
    score = 0;
    won = false;
    over = false;
    keepPlaying = false;
    addRandomTile();
    addRandomTile();
  }

  // ===== 랜덤 타일 추가 =====
  function addRandomTile() {
    const empty = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) empty.push({ row: r, col: c });
      }
    }
    if (empty.length === 0) return false;
    const { row, col } = empty[Math.floor(Math.random() * empty.length)];
    board[row][col] = Math.random() < 0.9 ? 2 : 4;
    newTiles.push({ row, col });
    return true;
  }

  // ===== 한 줄 밀기+병합 =====
  function slideLine(line) {
    // 0 제거
    let filtered = line.filter(v => v !== 0);
    let gained = 0;
    const merged = Array(filtered.length).fill(false);

    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1] && !merged[i]) {
        filtered[i] *= 2;
        gained += filtered[i];
        filtered[i + 1] = 0;
        merged[i] = true;
      }
    }

    // 0 다시 제거 후 오른쪽 패딩
    const newLine = filtered.filter(v => v !== 0);
    while (newLine.length < 4) newLine.push(0);

    // merged 위치 재계산 (newLine 기준)
    const mergedPositions = [];
    let idx = 0;
    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i] !== 0 || merged[i]) {
        if (merged[i]) mergedPositions.push(idx);
        if (filtered[i] !== 0) idx++;
      }
    }

    return { newLine, gained, mergedPositions };
  }

  // ===== 4방향 이동 =====
  function move(direction) {
    mergedBoard = Array.from({ length: 4 }, () => Array(4).fill(false));
    newTiles = [];
    let moved = false;

    // 이동 전 board 복사본 비교용
    const prev = board.map(r => r.slice());

    if (direction === 'left') {
      for (let r = 0; r < 4; r++) {
        const { newLine, gained, mergedPositions } = slideLine(board[r]);
        board[r] = newLine;
        score += gained;
        mergedPositions.forEach(c => { mergedBoard[r][c] = true; });
      }
    } else if (direction === 'right') {
      for (let r = 0; r < 4; r++) {
        const reversed = board[r].slice().reverse();
        const { newLine, gained, mergedPositions } = slideLine(reversed);
        board[r] = newLine.reverse();
        score += gained;
        mergedPositions.forEach(c => {
          const actual = 3 - c;
          mergedBoard[r][actual] = true;
        });
      }
    } else if (direction === 'up') {
      for (let c = 0; c < 4; c++) {
        const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
        const { newLine, gained, mergedPositions } = slideLine(col);
        for (let r = 0; r < 4; r++) board[r][c] = newLine[r];
        score += gained;
        mergedPositions.forEach(r => { mergedBoard[r][c] = true; });
      }
    } else if (direction === 'down') {
      for (let c = 0; c < 4; c++) {
        const col = [board[0][c], board[1][c], board[2][c], board[3][c]].reverse();
        const { newLine, gained, mergedPositions } = slideLine(col);
        const placed = newLine.reverse();
        for (let r = 0; r < 4; r++) board[r][c] = placed[r];
        score += gained;
        mergedPositions.forEach(r => {
          const actual = 3 - r;
          mergedBoard[actual][c] = true;
        });
      }
    }

    // 실제 변화가 있었는지 확인
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] !== prev[r][c]) { moved = true; break; }
      }
      if (moved) break;
    }

    if (moved) {
      // best 업데이트
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('2048-best', bestScore);
      }
      addRandomTile();
      checkWin();
      checkOver();
    }

    return moved;
  }

  // ===== 승리 체크 =====
  function checkWin() {
    if (keepPlaying) return;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 2048) { won = true; return; }
      }
    }
  }

  // ===== 게임 오버 체크 =====
  function checkOver() {
    // 빈 셀 있으면 아직 안 끝남
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) return;
      }
    }
    // 인접 같은 수 있으면 아직 안 끝남
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const v = board[r][c];
        if (c < 3 && board[r][c + 1] === v) return;
        if (r < 3 && board[r + 1][c] === v) return;
      }
    }
    over = true;
  }

  // ===== 계속 플레이 =====
  function continueGame() {
    won = false;
    keepPlaying = true;
  }

  // ===== 접근자 =====
  function getScore()  { return score; }
  function getBest()   { return bestScore; }
  function getBoard()  { return board; }
  function getMerged() { return mergedBoard; }
  function getNewTiles() { return newTiles; }
  function isOver()    { return over; }
  function isWon()     { return won; }

  // ===== 외부 노출 =====
  window.Game = {
    initGame,
    move,
    continueGame,
    getScore,
    getBest,
    getBoard,
    getMerged,
    getNewTiles,
    isOver,
    isWon,
  };
})();
