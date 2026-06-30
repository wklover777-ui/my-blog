# 코드 리뷰 — Gemini 관점의 추가 발견 사항

> 리뷰 일자: 2026-07-01
> 목적: 기존 `review.md`에서 다뤄지지 않은 추가적인 문제점(보안, 안정성, SEO, 접근성 등) 도출
> 심각도: 🔴 높음 / 🟡 중간 / 🟢 낮음

---

## 🔴 1. 디렉토리 트래버설 (Directory Traversal) 취약점 가능성 — `post.html` 40번째 줄

**파일**: `post.html`
**위치**: 40~41번째 줄

```js
const file = location.hash.slice(1);
if (!file || !file.startsWith('posts/') || !file.endsWith('.md')) { ... }
```

**문제점**:
URL의 해시(`location.hash`) 값을 기반으로 `fetch` 요청을 보냅니다. `startsWith('posts/')`와 `endsWith('.md')` 검증이 있지만, `posts/../../secret.md`와 같은 상대 경로(Path Traversal) 공격을 방어하지 못합니다. 정적 호스팅(GitHub Pages 등) 환경에서는 큰 문제가 아닐 수 있으나, 서버 환경에서는 심각한 보안 취약점이 될 수 있습니다.

**수정 방법**:
경로에 `..` 또는 `/` 문자가 연속으로 포함되어 있는지 확인하여 차단해야 합니다.

```js
if (!file || !file.startsWith('posts/') || !file.endsWith('.md') || file.includes('..')) {
```

---

## 🟡 2. 날짜 파싱 오류로 인한 정렬 실패 및 크래시 — `js/posts.js` 11, 38번째 줄

**파일**: `js/posts.js`
**위치**: 11번째 줄, 38번째 줄

```js
// 11번째 줄
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// 38~40번째 줄
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  ...
}
```

**문제점**:
`index.json`에 `date` 필드가 누락되어 있거나 형식이 잘못된 경우 `new Date(undefined)`는 `Invalid Date`가 되어 `NaN`을 반환합니다. 
1. 정렬 로직에서 `NaN`이 발생하면 `sort()`가 제대로 동작하지 않아 포스트 순서가 꼬입니다.
2. `formatDate` 함수에서 `dateStr`이 `undefined`일 경우 `undefinedT00:00:00`을 파싱하게 되어 "Invalid Date"가 화면에 그대로 출력되거나 에러를 발생시킬 수 있습니다.

**수정 방법**:
날짜 값이 없는 경우에 대한 방어 로직(Fallback)을 추가해야 합니다.

```js
// 정렬 시 예외 처리
posts.sort((a, b) => {
  const dateA = a.date ? new Date(a.date) : new Date(0);
  const dateB = b.date ? new Date(b.date) : new Date(0);
  return dateB - dateA;
});

// formatDate 함수 내 예외 처리
function formatDate(dateStr) {
  if (!dateStr) return '날짜 없음';
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d) ? '잘못된 날짜' : d.toLocaleDateString(...);
}
```

---

## 🟡 3. SEO (검색 엔진 최적화) 메타 태그 누락 — `index.html`, `post.html`

**파일**: `index.html`, `post.html`
**위치**: `<head>` 태그 내부

**문제점**:
블로그임에도 불구하고 `<meta name="description" content="...">` 태그가 없습니다. 검색 엔진이 블로그와 포스트의 내용을 올바르게 파악하고 검색 결과에 노출하려면 페이지 요약(description)이 필수적입니다.

**수정 방법**:
`index.html`에는 정적 메타 태그를 추가하고, `post.html`에는 자바스크립트로 포스트 내용에 맞는 동적 메타 태그를 생성해 `<head>`에 주입하는 로직을 추가해야 합니다.

---

## 🟢 4. iframe `title` 속성 누락 (웹 접근성) — `index.html` 27, 36번째 줄

**파일**: `index.html`
**위치**: 27, 36번째 줄

```html
<iframe src="apps/pixel-art/" scrolling="no" tabindex="-1"></iframe>
```

**문제점**:
스크린 리더와 같은 보조 기기가 `iframe`의 목적을 사용자에게 설명하기 위해 `title` 속성을 필요로 합니다(WCAG 2.4.1 기준). `tabindex="-1"`로 포커스를 막아두었더라도 시각장애인 사용자에게 프레임 내부의 맥락을 설명하는 `title` 속성은 필수입니다.

**수정 방법**:
각 `iframe`에 의미 있는 `title` 속성을 추가합니다.

```html
<iframe src="apps/pixel-art/" scrolling="no" tabindex="-1" title="픽셀 아트 에디터 앱 미리보기"></iframe>
```

---

## 🟢 5. URL 인코딩 누락 — `js/posts.js` 19번째 줄

**파일**: `js/posts.js`
**위치**: 19번째 줄

```js
<article class="post-card" onclick="location.href='post.html#posts/${post.file}'">
```

**문제점**:
`post.file` 값에 공백이나 특수 문자가 들어갈 경우, 브라우저가 정상적으로 URL을 파싱하지 못하거나 XSS 공격으로 이어질 가능성이 존재합니다. 

**수정 방법**:
파일 경로를 URL에 넣기 전에 인코딩을 거쳐야 합니다. (`review.md`의 3번 이슈에 따라 `<a>` 태그로 변경할 때 같이 반영하는 것이 좋습니다.)

```js
<a href="post.html#posts/${encodeURIComponent(post.file)}" class="post-card">
```

---

## 요약

| # | 심각도 | 파일 | 핵심 문제 (Gemini 시각) |
|---|--------|------|-----------|
| 1 | 🔴 높음 | `post.html:40` | 디렉토리 트래버설 취약점 (`..` 방어 없음) |
| 2 | 🟡 중간 | `posts.js:11,38` | `date` 누락/오류 시 정렬 실패 및 에러 발생 |
| 3 | 🟡 중간 | `전체 HTML` | SEO를 위한 `<meta name="description">` 누락 |
| 4 | 🟢 낮음 | `index.html:27` | 접근성 향상을 위한 `iframe`의 `title` 속성 누락 |
| 5 | 🟢 낮음 | `posts.js:19` | `post.file` 라우팅 시 URL 인코딩(`encodeURIComponent`) 누락 |
