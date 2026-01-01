# Content & Logic Specification

## 1. 게임 로직 (Game Loop)
### A. 적군 행동 (Enemy AI in update loop)
* **Initialization:** `EnemyGroup`에서 `createMultiple`로 초기 생성.
* **Movement:** `body.velocity.y`를 설정하여 하강.
* **Loop Logic (핵심):**
    ```typescript
    // 의사 코드
    if (this.y > this.scene.scale.height) {
        this.y = -50; // 상단 재배치
        this.x = Phaser.Math.Between(0, this.scene.scale.width);
        this.revive(); // 상태 초기화
    }
    ```

### B. 스테이지 시스템
* **Wave Data:** JSON 파일로 스테이지별 적군 등장 패턴(Delay, Speed, Count) 정의.
* **Transition:** 적군 그룹의 `countActive() === 0`일 때 다음 웨이브/스테이지 트리거.

## 2. 아이템 및 무기
* **Weapon Class:** 탄환 발사 로직을 담당하는 별도 클래스.
    * `fire(x, y)`: BulletGroup에서 죽은(inactive) 탄환을 가져와 발사.
* **PowerUp:** 적 파괴 시 일정 확률로 드랍되는 아이템 (Phaser Overlap으로 획득 처리).

## 3. 업적 트리거 (Achievement)
* **Observer Pattern:** `EventsCenter` (Phaser.Events.EventEmitter)를 통해 전역 이벤트 수신.
* **조건:**
    * `ENEMY_KILLED`: 킬 카운트 증가 -> 100 도달 시 업적 해금.
    * `STAGE_CLEARED`: 로컬 스토리지에 진행도 저장.