# System Architecture: Galuxy-Arcade

## 1. 기술 스택 (Tech Stack)
* **Runtime:** Web Browser (HTML5 Canvas / WebGL)
* **Language:** TypeScript
* **Game Engine:** Phaser 3
* **Bundler & Build:** Vite
* **Package Manager:** npm
* **State Management:** Custom Event Emitter or Redux (optional, but simple Event Bus recommended)

## 2. 시스템 아키텍처 (Architecture Pattern)
* **Scene-Based Architecture:** Phaser의 Scene 시스템을 활용하여 상태 분리.
    * `BootScene`: 에셋 로드 설정.
    * `PreloadScene`: 이미지/사운드 리소스 로딩.
    * `LobbyScene`: 메인 메뉴 (UI 오버레이).
    * `GameScene`: 실제 게임플레이 로직.
    * `HUDScene`: 게임 위에 겹쳐지는 점수/체력 UI.
* **ECS Lite:** Phaser의 `GameObject`와 `Components` 패턴 활용.
* **Singleton Managers:** `GameManager`(점수/상태), `StorageManager`(로컬 스토리지), `SoundManager`.

## 3. 데이터 흐름 (Data Flow)
1.  **Input:** Phaser Input Plugin -> `Player.update()`
2.  **Physics:** Arcade Physics System -> Overlap/Collider 감지 -> 이벤트 발생 (EnemyHit, PlayerHit)
3.  **UI Update:** Registry(Data Store) 변경 감지 -> `HUDScene` 텍스트 갱신
4.  **Save:** 스테이지 완료 시 `localStorage`에 JSON 문자열로 저장.

## 4. 클래스 다이어그램 (Core Classes)
* **Main.ts**: 게임 진입점 (`new Phaser.Game(config)`).
* **Entity (Sprite 확장)**
    * **Player (extends Phaser.Physics.Arcade.Sprite)**: 이동 로직, `Weapon` 클래스 소유.
    * **Enemy (extends Phaser.Physics.Arcade.Sprite)**: 패턴 로직, `resetPosition()` 메서드 포함.
* **ObjectPool (Phaser.GameObjects.Group)**:
    * `EnemyGroup`: 적군 재사용 관리.
    * `BulletGroup`: 탄환 재사용 관리 (`get()`, `setActive()`, `setVisible()`).