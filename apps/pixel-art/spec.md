# Pixel Art Editor — spec.md

## 1. 앱 개요

16×16 격자 기반의 픽셀 아트 에디터. HTML Canvas API를 활용해 브라우저에서 직접 도트 그림을 그리고 PNG 파일로 저장할 수 있다. 블로그의 기존 파일을 전혀 수정하지 않는 독립 앱으로, `apps/pixel-art/` 디렉토리 내에서 완결된다.

---

## 2. 파일 구조

```
apps/pixel-art/
├── index.html
├── css/style.css
└── js/
    ├── canvas.js     # 격자 렌더링, 픽셀 쓰기/지우기 로직
    ├── palette.js    # 색상 팔레트 데이터 및 선택 UI
    ├── tools.js      # 도구 상태 관리 (펜, 지우개, 채우기, 스포이드)
    ├── history.js    # Undo/Redo 스택
    └── export.js     # PNG 저장, localStorage 복원
```

---

## 3. 핵심 기능 목록

### 3-1. 캔버스
- 16×16 픽셀 격자 (각 셀 기본 24px)
- `<canvas>` 위에 격자선 오버레이 (토글 가능)
- 픽셀 상태 2D 배열로 저장
- 화면 크기에 따라 셀 크기 자동 조정

### 3-2. 도구
| 도구 | 단축키 | 동작 |
|------|--------|------|
| 펜 (Pen) | P | 클릭/드래그한 픽셀에 현재 색상 칠하기 |
| 지우개 (Eraser) | E | 픽셀을 투명으로 되돌리기 |
| 채우기 (Fill) | F | BFS 플러드 필로 같은 색상 영역 채우기 |
| 색상 추출 (Eyedropper) | I | 클릭한 픽셀 색상을 현재 색상으로 설정 |

### 3-3. 색상 팔레트
- 기본 32색 팔레트 (투명 포함)
- 커스텀 색상 피커 (`<input type="color">`)
- 최근 사용 색상 8개 표시

### 3-4. 편집 기능
- Undo (Ctrl+Z) / Redo (Ctrl+Y) — 최대 50단계
- 캔버스 전체 지우기
- 격자선 표시/숨기기 토글

### 3-5. 저장
- PNG 내보내기: 해상도 선택 (16×16 / 64×64 / 128×128)
- localStorage 자동 저장 및 복원

### 3-6. 모바일
- touchstart/move/end 이벤트 처리
- touch-action: none으로 스크롤/줌 방지

---

## 4. 구현 순서

1. HTML 마크업 + CSS 레이아웃
2. canvas.js — 격자 렌더링, 픽셀 상태 관리
3. tools.js — 도구 이벤트 처리
4. palette.js — 팔레트 UI
5. history.js — Undo/Redo
6. export.js — PNG 저장, localStorage
7. 모바일 터치 지원 및 마무리
