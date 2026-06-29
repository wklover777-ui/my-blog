# My Blog — Project Guide

## Project Overview

마크다운 파일을 읽어서 정적 블로그 웹사이트로 변환하는 프로젝트.
프레임워크 없이 순수 HTML, CSS, JavaScript만 사용한다.

## Goals

- 마크다운 `.md` 파일을 브라우저에서 파싱해 HTML로 렌더링
- 다크모드 지원 (시스템 설정 자동 감지 + 수동 토글)
- 모바일 반응형 레이아웃
- 깔끔하고 읽기 좋은 타이포그래피

## Project Structure

```
my-blog/
├── CLAUDE.md
├── index.html          # 메인 진입점 — 포스트 목록 페이지
├── post.html           # 개별 포스트 렌더링 페이지
├── css/
│   ├── base.css        # 리셋, CSS 변수(라이트/다크 토큰), 타이포그래피
│   ├── layout.css      # 헤더, 푸터, 그리드, 반응형 브레이크포인트
│   └── post.css        # 마크다운 렌더링 스타일 (코드블록, 인용, 표 등)
├── js/
│   ├── markdown.js     # 마크다운 → HTML 파서 (직접 구현 또는 marked.js CDN)
│   ├── theme.js        # 다크/라이트 모드 토글 및 localStorage 저장
│   └── posts.js        # 포스트 목록 로드, 메타데이터(frontmatter) 파싱
└── posts/
    └── *.md            # 블로그 포스트 마크다운 파일들
```

## Tech Stack

- **HTML/CSS/JS only** — 빌드 도구, 번들러, 프레임워크 없음
- **marked.js** (CDN) — 마크다운 파싱. 직접 구현보다 검증된 라이브러리 사용 권장
- **highlight.js** (CDN) — 코드 블록 신택스 하이라이팅
- No npm, no build step — 파일을 열거나 로컬 서버(python -m http.server 등)로 바로 실행

## Design Principles

- CSS 변수로 라이트/다크 토큰 분리: `--color-bg`, `--color-text`, `--color-accent` 등
- 본문 최대 너비 680px, 좌우 패딩으로 모바일 대응
- 시스템 다크모드(`prefers-color-scheme: dark`) 자동 적용, `data-theme` attribute로 수동 오버라이드
- 폰트: 시스템 폰트 스택 (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- 코드 블록: 모노스페이스 폰트, 배경색 구분, 가로 스크롤 허용

## Post Format (Frontmatter)

각 마크다운 파일 상단에 YAML-like frontmatter 사용:

```
---
title: 포스트 제목
date: 2026-06-29
tags: [태그1, 태그2]
description: 짧은 요약 (목록 페이지에 표시)
---

본문 내용...
```

## Key Behaviors

- `index.html`: `posts/` 디렉토리의 마크다운 파일 목록을 `posts/index.json`에서 로드해 카드 형태로 표시
- `post.html?file=posts/hello.md`: URL 파라미터로 파일 경로를 받아 해당 파일을 fetch → 파싱 → 렌더링
- `posts/index.json`: 포스트 메타데이터 목록 파일. 새 포스트 추가 시 수동으로 업데이트
- 다크모드 상태는 `localStorage`에 `theme` 키로 저장

## Constraints

- 외부 의존성은 CDN으로만 허용 (marked.js, highlight.js)
- 서버사이드 렌더링 없음 — 모든 파싱은 클라이언트에서
- IE 지원 불필요, 최신 브라우저(Chrome/Firefox/Safari) 타깃
- 인라인 스타일 사용 금지 — 항상 CSS 파일에 작성
