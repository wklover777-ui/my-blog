# 코드 리뷰 — My Blog

> 리뷰 일자: 2026-07-01  
> 범위: 전체 코드베이스 (블로그 코어 + pixel-art, 2048 앱)  
> 심각도: 🔴 높음 / 🟡 중간 / 🟢 낮음

---

## 🔴 1. XSS — `post.html` 79번째 줄

**파일**: `post.html`  
**위치**: 79번째 줄

```js
container.innerHTML = `
  ...
  <article class="post-content">${html}</article>
`;
```

`marked.parse(body)` 결과물을 DOMPurify 같은 sanitizer 없이 `innerHTML`로 직접 삽입한다.  
`marked.js` v12는 기본적으로 마크다운 파일 안의 raw HTML(`<script>`, `<img onerror=...>` 등)을 그대로 통과시킨다.  
GitHub Pages에 배포된 상태에서 `.md` 파일에 악의적인 HTML이 포함되면 방문자 브라우저에서 실행된다.

**수정 방법**: CDN으로 DOMPurify를 추가하고 `marked.parse(body)` 결과를 정제한다.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js"></script>
```

```js
const html = DOMPurify.sanitize(marked.parse(body));
```

---

## 🔴 2. Canvas 리사이즈 시 픽셀 깜빡임 — `apps/pixel-art/js/canvas.js` 163번째 줄

**파일**: `apps/pixel-art/js/canvas.js`

```js
window.addEventListener('resize', () => {
  const savedPixels = pixels.map(row => [...row]);
  initCanvas();        // ← 내부에서 drawAll() 호출 → 빈 체크무늬 표시됨
  pixels = savedPixels;
  drawAll();
});
```

`initCanvas()`가 내부에서 `drawAll()`을 한 번 호출(38번째 줄)하므로, 픽셀을 복원하기 전에 빈 캔버스가 렌더링된다.  
창 크기를 조절할 때마다 그림이 순간적으로 사라지는 시각적 결함이 발생한다.

**수정 방법**: `initCanvas()`에서 `drawAll()` 호출을 제거하고, 리사이즈 핸들러 끝에서 한 번만 호출한다.

```js
function initCanvas() {
  // ... (size setup + pixels init) ...
  // drawAll() 제거
}

window.addEventListener('resize', () => {
  const savedPixels = pixels.map(row => [...row]);
  initCanvas();
  pixels = savedPixels;
  drawAll(); // 여기서만 호출
});
```

---

## 🟡 3. `post-card` 클릭 영역 접근성 문제 — `js/posts.js` 19번째 줄

**파일**: `js/posts.js`

```js
<article class="post-card" onclick="location.href='post.html#posts/${post.file}'">
```

`<article>`에 `onclick` 핸들러를 달면 다음 문제가 생긴다:

- 키보드 Tab 포커스 및 Enter 키로 열 수 없음
- 마우스 가운데 클릭(새 탭 열기)이 동작하지 않음
- 스크린리더가 링크로 인식하지 않음

**수정 방법**: `<article>` 전체를 `<a>` 태그로 감싸거나, `<article>` 안에 `<a>` 링크를 카드 전체 영역으로 설정한다.

```js
<a href="post.html#posts/${post.file}" class="post-card">
  <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
  ...
</a>
```

---

## 🟡 4. `toggleGrid` 하드코딩 색상 — `apps/pixel-art/js/canvas.js` 143번째 줄

**파일**: `apps/pixel-art/js/canvas.js`

```js
btn.style.background = showGrid ? '#0f3460' : '';
btn.style.color = showGrid ? '#ffffff' : '';
```

라이트 모드에서 `#0f3460`(진한 네이비)이 그대로 노출된다.  
블로그 전체가 CSS 변수(`--color-accent` 등)로 테마를 관리하지만, 이 버튼만 인라인 스타일로 처리된다.  
CLAUDE.md 규칙 "인라인 스타일 사용 금지 — 항상 CSS 파일에 작성"도 위반한다.

**수정 방법**: CSS 클래스로 처리한다.

```js
// JS
btn.classList.toggle('active', showGrid);
```

```css
/* style.css */
#btn-toggle-grid.active {
  background: var(--color-accent);
  color: #fff;
}
```

---

## 🟡 5. `marked.setOptions` 사용 방식 — `post.html` 47번째 줄

**파일**: `post.html`

```js
marked.setOptions({
  gfm: true,
  breaks: false,
  highlight: null,
});
```

`marked.setOptions()`는 marked v10 이후 deprecated되었다. v12에서는 `marked.parse(body, options)`로 옵션을 직접 전달해야 한다.  
또한 `highlight: null`은 유효하지 않은 옵션으로 경고를 발생시킨다.

**수정 방법**:

```js
const html = marked.parse(body, { gfm: true, breaks: false });
```

---

## 🟢 6. UTF-8 BOM 파일에서 frontmatter 파싱 실패 — `post.html` 95번째 줄

**파일**: `post.html`

```js
const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
```

정규식이 `^`로 시작하므로 UTF-8 BOM(`﻿`)이 포함된 파일(Windows 메모장 등에서 작성)은 매칭되지 않아 frontmatter 전체가 무시된다.  
제목, 날짜, 태그가 모두 표시되지 않고 BOM 문자가 포스트 본문 맨 앞에 등장한다.

**수정 방법**: 파싱 전에 BOM을 제거한다.

```js
const raw = (await res.text()).replace(/^﻿/, '');
```

---

## 요약

| # | 심각도 | 파일 | 핵심 문제 |
|---|--------|------|-----------|
| 1 | 🔴 높음 | `post.html:79` | XSS — marked 출력 sanitize 미적용 |
| 2 | 🔴 높음 | `canvas.js:164` | 리사이즈 시 그림 순간 소멸 |
| 3 | 🟡 중간 | `posts.js:19` | 카드 접근성 — 키보드/새탭 불가 |
| 4 | 🟡 중간 | `canvas.js:143` | 하드코딩 색상 + 인라인 스타일 규칙 위반 |
| 5 | 🟡 중간 | `post.html:47` | marked deprecated API 사용 |
| 6 | 🟢 낮음 | `post.html:95` | BOM 포함 파일 frontmatter 파싱 실패 |
