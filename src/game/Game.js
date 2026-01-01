export class Game {
    constructor(canvasElement, progressManager, audioManager) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.progressManager = progressManager;
        this.audioManager = audioManager;

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.onGameOver = null;
        this.onUpgradeRequired = null;
        this.onVictory = null;

        this.assets = {
            bg: new Image(),
            spaceship: new Image(),
            bulletPlayer: new Image(),
            bulletEnemy: new Image(),
            bulletHoming: new Image(),
            enemyA: new Image(), // Scout
            enemyB: new Image(), // Drone
            enemyC: new Image(), // Fighter
            enemyD: new Image(), // Interceptor
            enemyBoss: new Image(), // Boss
            explosion: new Image()
        };
        this.assetsLoaded = 0;
        this.totalAssets = 11;

        this.loadAssets();

        this.isGameActive = false;
        this.isPaused = false;

        this.bgY = 0;
        this.scrollSpeed = 2;
        this.score = 0;
        this.lastUpgradeScore = 0;

        // Player State
        this.player = {
            x: 0, y: 0,
            width: 64, height: 64,
            hp: 100, maxHp: 100,
            lastShotTime: 0, fireRate: 200,
            weaponType: 'default', // default, double, homing, bounce
            weaponLevel: 1
        };

        this.input = { isTouching: false, targetX: 0, targetY: 0 };

        this.bullets = [];
        this.enemies = [];
        this.gameTime = 0; // seconds
        this.lastTime = 0;

        this.lastEnemySpawnTime = 0;
        this.enemySpawnRate = 1500;

        this.bossSpawned = false;

        this.bindEvents();
    }

    loadAssets() {
        const load = (img, src, mode = 'none') => {
            img.crossOrigin = "Anonymous";
            img.src = src;
            const handler = () => {
                img.onload = null;
                if (mode === 'white') this.applyChromaKey(img, 240, 'white');
                if (mode === 'black') this.applyChromaKey(img, 15, 'black');
                this.assetsLoaded++;
            };
            img.onload = handler;
            img.onerror = () => {
                console.warn(`Failed to load ${src}`);
                this.assetsLoaded++;
            };
        };

        load(this.assets.bg, 'assets/images/space_bg.png');
        load(this.assets.spaceship, 'assets/images/spaceship.png', 'white');
        load(this.assets.bulletPlayer, 'assets/images/bullet_player.png', 'black');
        load(this.assets.bulletEnemy, 'assets/images/bullet_enemy.png', 'black');

        // Use placeholders/re-use for missing assets
        load(this.assets.bulletHoming, 'assets/images/bullet_enemy.png', 'black');
        load(this.assets.enemyA, 'assets/images/enemy_a.png', 'white'); // Valid
        load(this.assets.enemyB, 'assets/images/enemy_a.png', 'white'); // Reuse A
        load(this.assets.enemyC, 'assets/images/enemy_a.png', 'white'); // Reuse A
        load(this.assets.enemyD, 'assets/images/enemy_a.png', 'white'); // Reuse A
        load(this.assets.enemyBoss, 'assets/images/enemy_boss.png', 'black'); // Valid (generated black bg likely? Boss prompt said isolated on black)
        load(this.assets.explosion, 'assets/images/explosion.png', 'black');
    }

    applyChromaKey(img, threshold, mode) {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const id = ctx.getImageData(0, 0, c.width, c.height);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
            let m = false;
            if (mode === 'white' && d[i] > threshold && d[i + 1] > threshold && d[i + 2] > threshold) m = true;
            if (mode === 'black' && d[i] < threshold && d[i + 1] < threshold && d[i + 2] < threshold) m = true;
            if (m) d[i + 3] = 0;
        }
        ctx.putImageData(id, 0, 0);
        img.src = c.toDataURL();
    }

    start() {
        if (this.isGameActive) return;
        this.isGameActive = true;
        this.isPaused = false;
        this.score = 0;
        this.lastUpgradeScore = 0;
        this.bullets = [];
        this.enemies = [];
        this.gameTime = 0;
        this.bossSpawned = false;

        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 150;
        this.player.hp = 100;
        this.player.weaponType = 'default';
        this.player.weaponLevel = 1;
        this.player.fireRate = 200;

        this.input.targetX = this.player.x;
        this.input.targetY = this.player.y;

        this.updateHUD();
        this.loop(0);
    }

    resume() {
        this.isGameActive = true;
        this.isPaused = false;
        this.loop(0);
    }

    applyUpgrade(type) {
        if (type === 'hp') {
            this.player.hp = this.player.maxHp;
        } else if (type === this.player.weaponType) {
            this.player.weaponLevel++;
            this.player.fireRate = Math.max(50, this.player.fireRate * 0.9); // 10% faster
        } else {
            this.player.weaponType = type;
            this.player.weaponLevel = 1;
            this.player.fireRate = 200; // Reset base speed for new weapon? Or keep? Let's reset.
        }
        this.updateHUD();
    }

    bindEvents() {
        const getPos = (e) => {
            const r = this.canvas.getBoundingClientRect();
            const sx = this.canvas.width / r.width;
            const sy = this.canvas.height / r.height;
            const cx = (e.touches ? e.touches[0].clientX : e.clientX);
            const cy = (e.touches ? e.touches[0].clientY : e.clientY);
            return { x: (cx - r.left) * sx, y: (cy - r.top) * sy };
        };
        const handleInput = (e) => {
            if (!this.isGameActive || this.isPaused) return;
            const p = getPos(e);
            this.input.isTouching = true;
            this.input.targetX = p.x;
            this.input.targetY = p.y - 40;
        };
        const end = () => this.input.isTouching = false;

        this.canvas.addEventListener('mousedown', handleInput);
        this.canvas.addEventListener('mousemove', e => { if (this.input.isTouching) handleInput(e) });
        window.addEventListener('mouseup', end);
        this.canvas.addEventListener('touchstart', e => { handleInput(e); e.preventDefault(); }, { passive: false });
        this.canvas.addEventListener('touchmove', e => { handleInput(e); e.preventDefault(); }, { passive: false });
        window.addEventListener('touchend', end);

        window.addEventListener('resize', () => {
            const r = this.canvas.getBoundingClientRect();
            this.canvas.width = r.width;
            this.canvas.height = r.height;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        });
        const r = this.canvas.getBoundingClientRect();
        this.canvas.width = r.width;
        this.canvas.height = r.height;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    loop(timestamp) {
        if (!this.isGameActive || this.isPaused) return;
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Simple second counter (approx)
        if (dt < 100) this.gameTime += dt / 1000;

        this.update(timestamp);
        this.draw();
        requestAnimationFrame((ts) => this.loop(ts));
    }

    update(timestamp) {
        // Upgrade Check
        if (this.score >= 1500 && this.score >= this.lastUpgradeScore + 1500) {
            this.lastUpgradeScore = this.score;
            this.isPaused = true;
            if (this.onUpgradeRequired) this.onUpgradeRequired();
            return;
        }

        // Input
        if (this.input.isTouching) {
            this.player.x += (this.input.targetX - this.player.x) * 0.2;
            this.player.y += (this.input.targetY - this.player.y) * 0.2;
        }
        this.player.x = Math.max(32, Math.min(this.width - 32, this.player.x));
        this.player.y = Math.max(32, Math.min(this.height - 32, this.player.y));

        this.bgY = (this.bgY + this.scrollSpeed) % this.height;

        // Player Fire
        if (timestamp - this.player.lastShotTime > this.player.fireRate) {
            this.firePlayerWeapon();
            this.player.lastShotTime = timestamp;
        }

        // Spawn Logic
        if (!this.bossSpawned && this.gameTime >= 180) { // 3 Minutes
            this.spawnBoss();
        } else if (!this.bossSpawned && timestamp - this.lastEnemySpawnTime > this.enemySpawnRate) {
            this.spawnEnemy();
            this.lastEnemySpawnTime = timestamp;
            if (this.enemySpawnRate > 500) this.enemySpawnRate -= 5;
        }

        // Entity Updates
        this.updateBullets();
        this.updateEnemies();
        this.checkCollisions();
    }

    firePlayerWeapon() {
        const x = this.player.x;
        const y = this.player.y - 40;
        const type = this.player.weaponType;

        if (type === 'double') {
            this.spawnBullet(x - 15, y, true);
            this.spawnBullet(x + 15, y, true);
        } else if (type === 'bounce') {
            this.spawnBullet(x, y, true, null, -0.5); // Left angle
            this.spawnBullet(x, y, true, null, 0);    // Center
            this.spawnBullet(x, y, true, null, 0.5);  // Right angle
        } else if (type === 'homing') {
            this.spawnBullet(x, y, true, null, 0, 'homing');
        } else {
            this.spawnBullet(x, y, true);
        }
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];

            // Homing Logic
            if (b.behavior === 'homing') {
                let target = null;
                let minDist = 9999;
                const set = b.isPlayer ? this.enemies : [this.player];
                // Find nearest
                for (const t of set) {
                    const d = Math.hypot(t.x - b.x, t.y - b.y);
                    if (d < minDist) { minDist = d; target = t; }
                }
                if (target) {
                    const angle = Math.atan2(target.y - b.y, target.x - b.x);
                    b.vx += Math.cos(angle) * 0.5;
                    b.vy += Math.sin(angle) * 0.5;
                    // Cap speed
                    const s = Math.hypot(b.vx, b.vy);
                    if (s > 10) { b.vx = (b.vx / s) * 10; b.vy = (b.vy / s) * 10; }
                    b.angle = angle + Math.PI / 2;
                }
            }

            b.x += b.vx;
            b.y += b.vy;

            // Bounce Logic
            if (this.player.weaponType === 'bounce' && b.isPlayer) {
                if (b.x < 0 || b.x > this.width) {
                    b.vx = -b.vx;
                    b.x += b.vx; // Push back
                }
            }

            // Rotation for normal bullets
            if (!b.behavior) b.angle = Math.atan2(b.vy, b.vx) - Math.PI / 2;

            if (b.y < -50 || b.y > this.height + 50 || b.x < -50 || b.x > this.width + 50) this.bullets.splice(i, 1);
        }
    }

    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];

            // Movement
            if (e.type === 'boss') {
                // Determine target Y (top area)
                if (e.y < 150) e.y += e.speed;
                // Hover X
                e.x = this.width / 2 + Math.sin(Date.now() / 1000) * 100;

                // Boss Fire
                if (Math.random() < 0.05) {
                    // Spray
                    for (let k = 0; k < 8; k++) {
                        const a = (Date.now() / 1000) + (k * (Math.PI / 4));
                        this.spawnBullet(e.x, e.y + 50, false, null, 0, null, { vx: Math.cos(a) * 5, vy: Math.sin(a) * 5 });
                    }
                }
            } else {
                e.y += e.speed;
                if (e.behavior === 'chase') {
                    if (e.x < this.player.x) e.x += 1;
                    else e.x -= 1;
                }

                // Fire
                if (Math.random() < 0.01) {
                    if (e.type === 'C' || e.type === 'D') {
                        this.spawnBullet(e.x, e.y + 30, false, null, 0, 'homing');
                    } else {
                        // Aimed
                        this.spawnBullet(e.x, e.y + 30, false, this.player);
                    }
                }
            }

            if (e.y > this.height + 100) this.enemies.splice(i, 1);
        }
    }

    spawnEnemy() {
        // Weighted Spawn
        const r = Math.random();
        let type = 'A';
        if (r < 0.35) type = 'A';
        else if (r < 0.70) type = 'B';
        else if (r < 0.85) type = 'C';
        else type = 'D';

        const x = Math.random() * (this.width - 60) + 30;
        let enemy = {
            type: type,
            x: x, y: -60,
            width: 50, height: 50,
            hp: 20, speed: 3,
            behavior: 'straight'
        };

        if (type === 'B') { enemy.behavior = 'chase'; enemy.speed = 2; }
        if (type === 'C') { enemy.width = 70; enemy.height = 70; enemy.hp = 60; enemy.speed = 4; }
        if (type === 'D') { enemy.width = 80; enemy.height = 80; enemy.hp = 80; enemy.behavior = 'chase'; enemy.speed = 1.5; }

        this.enemies.push(enemy);
    }

    spawnBoss() {
        this.bossSpawned = true;
        this.enemies = []; // Clear small fry
        this.enemies.push({
            type: 'boss',
            x: this.width / 2, y: -200,
            width: 200, height: 200,
            hp: 2000, maxHp: 2000,
            speed: 1
        });
        // Play Boss Music/Sound if available
    }

    spawnBullet(x, y, isPlayer, target = null, angleOffset = 0, behavior = null, velocityOverride = null) {
        let vx = 0, vy = isPlayer ? -15 : 7;
        let angle = 0;

        if (velocityOverride) {
            vx = velocityOverride.vx;
            vy = velocityOverride.vy;
        } else if (!isPlayer && target) {
            const dx = target.x - x;
            const dy = target.y - y;
            const dist = Math.hypot(dx, dy);
            if (dist > 0) {
                vx = (dx / dist) * 7;
                vy = (dy / dist) * 7;
            }
        }

        if (angleOffset !== 0) {
            // Rotate vector
            const s = Math.sin(angleOffset); // rough appx
            vx += angleOffset * 10; // simplistic spread
        }

        this.bullets.push({
            x: x, y: y, vx: vx, vy: vy,
            isPlayer: isPlayer,
            behavior: behavior,
            width: isPlayer ? 10 : 20,
            height: isPlayer ? 40 : 20,
            angle: 0
        });
    }

    checkCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            const targetSet = b.isPlayer ? this.enemies : [this.player];

            for (let j = targetSet.length - 1; j >= 0; j--) {
                const t = targetSet[j];
                const w = t.width || 30; // Player fix
                if (Math.abs(b.x - t.x) < (b.width + w) / 2 && Math.abs(b.y - t.y) < (b.height + (t.height || 30)) / 2) {
                    this.bullets.splice(i, 1);
                    if (b.isPlayer) {
                        t.hp -= 20; // Player Damage
                        if (t.hp <= 0) {
                            if (t.type === 'boss') {
                                this.score += 5000;
                                if (this.onVictory) this.onVictory(this.score);
                                this.isGameActive = false;
                            } else {
                                this.enemies.splice(j, 1);
                                this.score += 100;
                            }
                            this.updateHUD();
                        }
                    } else {
                        // Player hit
                        this.player.hp -= 10;
                        this.updateHUD();
                        if (this.player.hp <= 0) {
                            this.isGameActive = false;
                            if (this.onGameOver) this.onGameOver(this.score);
                        }
                    }
                    break;
                }
            }
        }
    }

    updateHUD() {
        const scoreEl = document.getElementById('score-val');
        if (scoreEl) scoreEl.innerText = this.score;
        const hpFill = document.getElementById('hp-bar-fill');
        if (hpFill) hpFill.style.width = `${Math.max(0, (this.player.hp / this.player.maxHp) * 100)}%`;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        // BG
        if (this.assets.bg.complete) {
            this.ctx.drawImage(this.assets.bg, 0, this.bgY, this.width, this.height);
            this.ctx.drawImage(this.assets.bg, 0, this.bgY - this.height, this.width, this.height);
        }

        // Enemies
        for (const e of this.enemies) {
            let sprite = this.assets.enemyA;
            if (e.type === 'B') sprite = this.assets.enemyB;
            if (e.type === 'C') sprite = this.assets.enemyC;
            if (e.type === 'D') sprite = this.assets.enemyD;
            if (e.type === 'boss') sprite = this.assets.enemyBoss;

            if (sprite && sprite.complete) this.drawSprite(sprite, e.x, e.y, e.width, e.height);
            else {
                this.ctx.fillStyle = 'red';
                this.ctx.fillRect(e.x - e.width / 2, e.y - e.height / 2, e.width, e.height);
            }

            // Boss HP Bar
            if (e.type === 'boss') {
                this.ctx.fillStyle = 'red';
                this.ctx.fillRect(e.x - 50, e.y - 120, 100, 10);
                this.ctx.fillStyle = 'green';
                this.ctx.fillRect(e.x - 50, e.y - 120, 100 * (e.hp / e.maxHp), 10);
            }
        }

        // Bullets
        for (const b of this.bullets) {
            let sprite = b.isPlayer ? this.assets.bulletPlayer : this.assets.bulletEnemy;
            if (b.behavior === 'homing' && !b.isPlayer) sprite = this.assets.bulletHoming;

            if (sprite && sprite.complete) this.drawSprite(sprite, b.x, b.y, b.width, b.height, b.angle || 0);
            else {
                this.ctx.fillStyle = b.isPlayer ? 'cyan' : 'orange';
                this.ctx.fillRect(b.x - b.width / 2, b.y - b.height / 2, b.width, b.height);
            }
        }

        // Player
        if (this.assets.spaceship.complete) {
            this.drawSprite(this.assets.spaceship, this.player.x, this.player.y, this.player.width, this.player.height);
        }
    }

    drawSprite(img, x, y, w, h, rotation = 0) {
        if (rotation !== 0) {
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(rotation);
            this.ctx.drawImage(img, -w / 2, -h / 2, w, h);
            this.ctx.restore();
        } else {
            this.ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
        }
    }
}
