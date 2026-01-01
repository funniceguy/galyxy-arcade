# Project Task List: Galuxy-Arcade (Phaser + Vite)

## Phase 1: 프로젝트 셋업 (Setup)
- [ ] **Init:** `npm create vite@latest antigravity -- --template vanilla-ts` 실행.
- [ ] **Install:** `npm install phaser` 실행.
- [ ] **Config:** `src/main.ts`에 Phaser GameConfig 설정 (ScaleMode: FIT, AutoCenter).
- [ ] **Assets:** `public/assets/` 폴더 생성 및 리소스 배치.

## Phase 2: 코어 게임플레이 (Prototype)
- [ ] **Scene Setup:** `Preloader.ts`, `GameScene.ts` 기본 클래스 생성.
- [ ] **Player:** `Player.ts` 클래스 생성, 키보드 입력(CursorKeys)으로 이동 구현.
- [ ] **Bullet:** `BulletGroup` 클래스 생성 및 스페이스바 입력 시 발사 구현.
- [ ] **Enemy Basic:** `Enemy.ts` 및 `EnemyGroup` 구현. 화면 밖(WorldBounds) 체크 후 상단 재진입 로직 작성.

## Phase 3: 시스템 구축 (Game Loop)
- [ ] **Physics:** Arcade Physics 충돌 처리 (`collider` & `overlap`).
- [ ] **GameLogic:** 점수 계산 및 적 처치 시 재활용(disableBody) 처리.
- [ ] **DataManager:** `localStorage` wrapper 클래스 작성 (Save/Load).

## Phase 4: UI 및 콘텐츠 (DOM & Scenes)
- [ ] **Lobby UI:** HTML/CSS로 메인 메뉴 오버레이 제작 및 게임 시작 이벤트 연결.
- [ ] **HUD:** `HUDScene`을 `GameScene` 위에 띄우고(Scene Launch) 점수 연동.
- [ ] **Content:** JSON 데이터로 1챕터(10 스테이지) 밸런싱 데이터 작성.

## Phase 5: 배포 (Deployment)
- [ ] **Build:** `npm run build` 스크립트 실행 및 `dist` 폴더 확인.
- [ ] **Test:** 로컬 서버(`npm run preview`)에서 최종 테스트.