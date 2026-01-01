# Product Requirements Document: Galuxy-Arcade (Web Ver.)

## 1. 기획 의도
'Galuxy-Arcade'는 웹 브라우저에서 즉시 플레이 가능한 '갤러그' 스타일의 슈팅 게임입니다.
별도의 설치 없이 접근 가능한 웹 환경(HTML5)을 타겟으로 하며, TypeScript의 강력한 타입 시스템과 Phaser 3의 2D 렌더링 성능을 활용합니다.

## 2. 핵심 메카닉 (Core Mechanics)
* **엔진:** Phaser 3 (Arcade Physics 사용).
* **적군 루프:** 화면 `WorldBounds.bottom`을 벗어난 적군 스프라이트는 파괴되지 않고, Y축 최상단(`-Height`)으로 좌표가 재설정되어 다시 내려옴.
* **조작:**
    * Desktop: 키보드 (방향키, Spacebar).
    * Mobile: 화면 터치 (좌우 터치로 이동, 자동 발사 옵션).
* **진행:** SPA(Single Page Application) 형태로 로딩 없이 Scene 전환.

## 3. 유저 요구사항 (User Stories)
* 유저는 웹 링크 접속만으로 로딩 대기 시간을 최소화하여 게임을 시작할 수 있어야 한다.
* 유저는 브라우저 창 크기가 변해도 비율이 유지되는 반응형 화면(Scale Manager)을 원한다.
* 플레이 데이터(업적, 스토리 해금)는 브라우저를 닫았다 켜도 유지(`localStorage`)되어야 한다.

## 4. 비기능 요구사항 & 기술 제약
* **Build:** Vite를 사용하여 빠른 HMR(Hot Module Replacement) 개발 환경과 최적화된 번들링 제공.
* **Compatibility:** 크롬, 사파리, 엣지 등 모던 브라우저 지원 (ES6+).
* **Asset:** 텍스처 아틀라스(Texture Atlas)를 사용하여 HTTP 요청 최소화.