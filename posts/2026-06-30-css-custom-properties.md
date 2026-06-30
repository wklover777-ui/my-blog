---
title: CSS 변수로 테마 시스템 만들기
date: 2026-06-30
tags: [CSS, 웹개발, 다크모드]
description: CSS 커스텀 프로퍼티(변수)를 활용하면 라이트/다크 테마 전환을 깔끔하게 구현할 수 있다.
---

## CSS 커스텀 프로퍼티란

CSS에도 변수가 있다. `--`로 시작하는 이름으로 선언하고, `var()` 함수로 참조한다.

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-accent: #0070f3;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

Sass 변수나 JavaScript 상수와 달리, CSS 커스텀 프로퍼티는 **런타임에 변경**할 수 있다. 빌드 없이 동적으로 값을 바꿀 수 있다는 점이 핵심이다.

## 다크모드 테마 전환

`:root`에 라이트 토큰을 정의하고, 다크 테마는 `[data-theme="dark"]`로 오버라이드한다.

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
}

[data-theme="dark"] {
  --color-bg: #0d0d0d;
  --color-text: #e8e8e8;
}
```

JavaScript에서 `document.documentElement.dataset.theme = 'dark'` 한 줄이면 전체 페이지 색상이 바뀐다. 개별 요소마다 클래스를 추가할 필요가 없다.

## 시스템 설정 자동 감지

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0d0d0d;
    --color-text: #e8e8e8;
  }
}
```

미디어 쿼리와 `data-theme` 방식을 조합하면, 기본값은 시스템 설정을 따르면서 사용자가 수동으로 전환했을 때는 그 선택을 유지할 수 있다.

## 폴백 값 지정

`var()` 두 번째 인자로 폴백을 줄 수 있다.

```css
color: var(--color-text, #333333);
```

변수가 정의되지 않은 경우 `#333333`을 사용한다. 컴포넌트 단위 설계에서 유용하다.

## 정리

- CSS 변수는 런타임에 변경 가능하다
- `:root`에 전역 토큰, `[data-theme]`으로 테마 오버라이드
- `prefers-color-scheme`로 시스템 설정 자동 감지
- 빌드 없이, 클래스 없이 테마 시스템을 구현할 수 있다
