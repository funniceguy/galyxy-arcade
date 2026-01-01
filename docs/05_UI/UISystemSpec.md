# UI System Specification

## 1. UI 구현 방식: Hybrid Approach
Phaser 내부 UI와 DOM(HTML/CSS) 오버레이를 혼용하여 최적의 경험 제공.

* **In-Game HUD (Phaser Canvas):** 프레임 드랍 없이 게임과 동기화되어야 하는 요소.
    * 점수, 남은 목숨, 탄환 수 등.
    * `Phaser.GameObjects.Text` 또는 `BitmapText` 사용.
* **Out-Game Menus (HTML/CSS DOM):** 복잡한 레이아웃과 스크롤링이 필요한 요소.
    * 로비, 스토리 리스트, 업적 리스트.
    * Phaser의 `DomElement`를 쓰거나, Canvas 위에 `<div>`를 `position: absolute`로 띄움.

## 2. UI 구조
* **div#game-container**: Phaser Canvas가 렌더링되는 영역.
* **div#ui-layer**: 포인터 이벤트를 받는 상위 레이어.
    * **MainMenu (HTML)**: 시작 버튼, 스토리, 업적 버튼 (Flexbox 레이아웃).
    * **StoryModal (HTML)**: CSS Grid로 챕터 리스트 구현, 스크롤 가능.
    * **EndingPopup (HTML)**: CSS Animation으로 페이드인/아웃.

## 3. 스타일 가이드
* **CSS Framework:** TailwindCSS 또는 Vanilla CSS (가벼운 프로젝트이므로 Vanilla 권장).
* **Font:** 구글 폰트 (Press Start 2P 등 레트로 폰트) 웹 폰트 로드.