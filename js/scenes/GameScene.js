/**
 * GameScene - 核心游戏逻辑
 * 包含玩家控制、敌人波次、碰撞检测、道具系统、HUD
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.gameWidth = width;
        this.gameHeight = height;

        // 游戏状态
        this.score = 0;
        this.lives = 3;
        this.weaponLevel = 1;          // 1-3
        this.weaponTimer = 0;
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.isInvincible = false;
        this.gameOver = false;
        this.bossActive = false;
        this.difficultyTimer = 0;
        this.enemySpawnDelay = 2000;
        this.killCount = 0;

        // —— 滚动背景 ——
        this.bg1 = this.add.tileSprite(0, 0, width, height, 'skyGradient').setOrigin(0, 0);

        // 云朵层（多个云朵在背景上飘动）
        this.clouds = [];
        for (let i = 0; i < 6; i++) {
            const cloud = this.add.image(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(-50, height + 50),
                'cloud'
            ).setScale(Phaser.Math.FloatBetween(0.5, 1.3))
             .setAlpha(Phaser.Math.FloatBetween(0.3, 0.6))
             .setDepth(0);
            this.clouds.push({ sprite: cloud, speed: Phaser.Math.FloatBetween(0.2, 0.6) });
        }

        // —— 物理分组 ——
        this.playerBullets = this.physics.add.group({
            defaultKey: 'bulletPlayer',
            maxSize: 50
        });

        this.enemyBullets = this.physics.add.group({
            defaultKey: 'bulletEnemy',
            maxSize: 80
        });

        this.enemies = this.physics.add.group();
        this.powerups = this.physics.add.group();

        // —— 玩家 ——
        this.player = this.physics.add.sprite(width / 2, height - 80, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10);
        this.player.setScale(1.1);

        // 玩家进场动画
        this.player.y = height + 50;
        this.tweens.add({
            targets: this.player,
            y: height - 80,
            duration: 600,
            ease: 'Back.easeOut'
        });

        // 玩家呼吸动画
        this.tweens.add({
            targets: this.player,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // —— 护盾精灵（跟随玩家） ——
        this.shieldSprite = this.add.circle(0, 0, 28, 0x45AAF2, 0.2);
        this.shieldSprite.setStrokeStyle(2, 0x45AAF2, 0.6);
        this.shieldSprite.setDepth(11);
        this.shieldSprite.setVisible(false);

        // —— 输入控制 ——
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // 鼠标/触屏移动
        this.input.on('pointermove', (pointer) => {
            if (this.gameOver) return;
            this.player.x = Phaser.Math.Clamp(pointer.x, 20, width - 20);
            this.player.y = Phaser.Math.Clamp(pointer.y, 40, height - 40);
        });

        // 鼠标点击/触屏发射
        this.input.on('pointerdown', () => {
            if (this.gameOver) return;
            this.playerFire();
        });

        // 自动射击定时器
        this.fireTimer = this.time.addEvent({
            delay: 250,
            callback: this.playerFire,
            callbackScope: this,
            loop: true
        });

        // —— 碰撞检测 ——
        // 玩家子弹 vs 敌人
        this.physics.add.overlap(
            this.playerBullets, this.enemies,
            this.onBulletHitEnemy, null, this
        );
        // 敌人子弹 vs 玩家
        this.physics.add.overlap(
            this.enemyBullets, this.player,
            this.onEnemyBulletHitPlayer, null, this
        );
        // 玩家 vs 敌人（碰撞）
        this.physics.add.overlap(
            this.player, this.enemies,
            this.onPlayerCollideEnemy, null, this
        );
        // 玩家 vs 道具
        this.physics.add.overlap(
            this.player, this.powerups,
            this.onCollectPowerup, null, this
        );

        // —— 敌人发生器 ——
        this.spawnEnemy();

        // —— HUD ——
        this.createHUD();

        // 入场淡入
        this.cameras.main.fadeIn(400);
    }

    // ==================== HUD ====================

    createHUD() {
        const { width } = this.cameras.main;

        // 分数
        this.scoreText = this.add.text(16, 16, '⭐ 0', {
            fontSize: '20px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#FFD32A',
            stroke: '#2D3436',
            strokeThickness: 3
        }).setDepth(100).setScrollFactor(0);

        // 生命值（心形图标）
        this.livesIcons = [];
        for (let i = 0; i < 3; i++) {
            const heart = this.add.image(width - 30 - i * 32, 24, 'powerupHeart')
                .setDepth(100)
                .setScrollFactor(0);
            this.livesIcons.push(heart);
        }

        // 武器等级提示
        this.weaponText = this.add.text(16, 42, '🔫 Lv.1', {
            fontSize: '14px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#DFE6E9',
            stroke: '#2D3436',
            strokeThickness: 2
        }).setDepth(100).setScrollFactor(0);

        // 道具状态提示
        this.powerupText = this.add.text(width / 2, 20, '', {
            fontSize: '14px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#FFEAA7',
            stroke: '#2D3436',
            strokeThickness: 2
        }).setOrigin(0.5, 0).setDepth(100).setScrollFactor(0);
    }

    updateHUD() {
        this.scoreText.setText('⭐ ' + this.score);

        // 更新生命图标
        for (let i = 0; i < this.livesIcons.length; i++) {
            this.livesIcons[i].setVisible(i < this.lives);
        }

        this.weaponText.setText('🔫 Lv.' + this.weaponLevel);

        // 道具倒计时
        if (this.weaponTimer > 0) {
            this.powerupText.setText('⭐ 武器升级 ' + Math.ceil(this.weaponTimer / 1000) + 's');
        } else if (this.shieldTimer > 0) {
            this.powerupText.setText('🛡️ 护盾 ' + Math.ceil(this.shieldTimer / 1000) + 's');
        } else {
            this.powerupText.setText('');
        }
    }

    // ==================== 玩家射击 ====================

    playerFire() {
        if (this.gameOver) return;

        const bx = this.player.x;
        const by = this.player.y - 24;

        switch (this.weaponLevel) {
            case 1:
                this.fireBullet(bx, by, 0);
                break;
            case 2:
                this.fireBullet(bx - 8, by, 0);
                this.fireBullet(bx + 8, by, 0);
                break;
            case 3:
                this.fireBullet(bx - 14, by, -0.5);
                this.fireBullet(bx, by - 4, 0);
                this.fireBullet(bx + 14, by, 0.5);
                break;
        }
    }

    fireBullet(x, y, vx) {
        const bullet = this.playerBullets.get(x, y, 'bulletPlayer');
        if (!bullet) return;
        bullet.setActive(true).setVisible(true);
        bullet.body.enable = true;
        bullet.setDepth(8);
        bullet.setScale(1);
        bullet.body.velocity.y = -500;
        bullet.body.velocity.x = vx * 80;
    }

    // ==================== 敌人系统 ====================

    spawnEnemy() {
        if (this.gameOver) return;

        // 检查是否出 Boss
        if (this.killCount > 0 && this.killCount % 15 === 0 && !this.bossActive) {
            this.spawnBoss();
            return;
        }

        const { width } = this.cameras.main;
        const type = Math.random() < 0.6 ? 'blimp' : 'buzzy';
        const x = Phaser.Math.Between(40, width - 40);

        let enemy;
        if (type === 'blimp') {
            enemy = this.enemies.create(x, -30, 'enemyBlimp');
            enemy.setData('hp', 1);
            enemy.setData('score', 10);
            enemy.body.velocity.y = Phaser.Math.Between(80, 150);
            enemy.body.velocity.x = Phaser.Math.Between(-30, 30);
        } else {
            enemy = this.enemies.create(x, -30, 'enemyBuzzy');
            enemy.setData('hp', 2);
            enemy.setData('score', 20);
            enemy.body.velocity.y = Phaser.Math.Between(60, 120);
            enemy.setData('startX', x);
            enemy.setData('waveTime', 0);
        }

        enemy.setDepth(5);
        enemy.setCollideWorldBounds(false);

        // 敌人入场弹跳
        enemy.setScale(0);
        this.tweens.add({
            targets: enemy,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        // 安排下次生成
        const nextDelay = Math.max(400, this.enemySpawnDelay - this.difficultyTimer * 20);
        this.time.delayedCall(nextDelay + Phaser.Math.Between(-200, 200), () => {
            this.spawnEnemy();
        });
    }

    spawnBoss() {
        this.bossActive = true;
        const { width } = this.cameras.main;

        const boss = this.enemies.create(width / 2, -60, 'boss');
        boss.setData('hp', 20);
        boss.setData('score', 200);
        boss.setData('isBoss', true);
        boss.setDepth(6);
        boss.setScale(0);
        boss.body.velocity.y = 60;

        // Boss 入场
        this.tweens.add({
            targets: boss,
            scaleX: 1,
            scaleY: 1,
            duration: 600,
            ease: 'Back.easeOut'
        });

        // Boss 到达位置后开始左右移动和射击
        this.time.delayedCall(1500, () => {
            if (!boss.active) return;
            boss.body.velocity.y = 0;

            // 左右摆动
            this.tweens.add({
                targets: boss,
                x: width - 60,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Boss 射击
            this.time.addEvent({
                delay: 800,
                callback: () => {
                    if (!boss.active) return;
                    this.bossFire(boss);
                },
                loop: true
            });
        });

        // Boss 提示
        this.showMessage('👑 BOSS 出现！', '#FF6B6B');
    }

    bossFire(boss) {
        // 扇形散射
        for (let angle = -30; angle <= 30; angle += 15) {
            const rad = Phaser.Math.DegToRad(angle + 90);
            const bullet = this.enemyBullets.get(boss.x, boss.y + 30, 'bulletEnemy');
            if (!bullet) continue;
            bullet.setActive(true).setVisible(true);
            bullet.body.enable = true;
            bullet.setDepth(8);
            bullet.setScale(1.2);
            bullet.body.velocity.x = Math.cos(rad) * 200;
            bullet.body.velocity.y = Math.sin(rad) * 200;
        }
    }

    enemyFire(enemy) {
        const bullet = this.enemyBullets.get(enemy.x, enemy.y + 15, 'bulletEnemy');
        if (!bullet) return;
        bullet.setActive(true).setVisible(true);
        bullet.body.enable = true;
        bullet.setDepth(8);
        bullet.body.velocity.y = 250;
        bullet.body.velocity.x = Phaser.Math.Between(-30, 30);
    }

    // ==================== 碰撞处理 ====================

    onBulletHitEnemy(bullet, enemy) {
        if (!bullet.active || !enemy.active) return;

        // 回收子弹
        bullet.setActive(false).setVisible(false);
        bullet.body.enable = false;
        this.playerBullets.killAndHide(bullet);

        // 扣敌人 HP
        let hp = enemy.getData('hp') - 1;
        enemy.setData('hp', hp);

        if (hp <= 0) {
            // 敌人被击毁
            const score = enemy.getData('score') || 10;
            this.score += score;
            this.killCount++;

            // 爆炸效果
            this.createExplosion(enemy.x, enemy.y, enemy.getData('isBoss'));

            // 掉落道具（15%概率，Boss必掉）
            if (enemy.getData('isBoss') || Math.random() < 0.15) {
                this.spawnPowerup(enemy.x, enemy.y);
            }

            enemy.destroy();

            // 更新难度
            this.difficultyTimer = Math.min(20, this.difficultyTimer + 0.1);

            if (enemy.getData('isBoss')) {
                this.bossActive = false;
                this.showMessage('🎉 Boss 击败！', '#FFD32A');
            }
        } else {
            // 受伤闪烁
            this.tweens.add({
                targets: enemy,
                alpha: 0.4,
                duration: 80,
                yoyo: true,
                repeat: 3
            });
        }
    }

    onEnemyBulletHitPlayer(player, bullet) {
        if (!bullet.active || !player.active) return;
        bullet.setActive(false).setVisible(false);
        bullet.body.enable = false;
        this.enemyBullets.killAndHide(bullet);

        this.playerTakeDamage();
    }

    onPlayerCollideEnemy(player, enemy) {
        if (!player.active || !enemy.active) return;

        // 撞机伤害
        this.createExplosion(enemy.x, enemy.y, false);
        enemy.destroy();

        if (enemy.getData('isBoss')) {
            this.bossActive = false;
        }

        this.playerTakeDamage();
    }

    playerTakeDamage() {
        if (this.isInvincible || this.shieldActive || this.gameOver) return;

        this.lives--;
        this.isInvincible = true;

        // 受伤闪烁（无敌帧）
        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 10,
            onComplete: () => {
                this.isInvincible = false;
                this.player.setAlpha(1);
            }
        });

        // 屏幕震动
        this.cameras.main.shake(200, 0.01);

        // 检查游戏结束
        if (this.lives <= 0) {
            this.endGame();
        }
    }

    // ==================== 道具系统 ====================

    spawnPowerup(x, y) {
        const types = ['powerupHeart', 'powerupStar', 'powerupShield'];
        const weights = [0.4, 0.35, 0.25];  // 40%爱心, 35%星星, 25%护盾
        let r = Math.random();
        let type = types[0];
        for (let i = 0; i < types.length; i++) {
            r -= weights[i];
            if (r <= 0) { type = types[i]; break; }
        }

        const p = this.powerups.create(x, y, type);
        p.setData('type', type);
        p.setDepth(4);
        p.body.velocity.y = 80;

        // 浮动动画
        this.tweens.add({
            targets: p,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    onCollectPowerup(player, powerup) {
        if (!powerup.active) return;

        const type = powerup.getData('type');
        powerup.destroy();

        switch (type) {
            case 'powerupHeart':
                if (this.lives < 3) {
                    this.lives++;
                    this.showMessage('❤️ +1 生命', '#FF4757');
                } else {
                    this.score += 20;
                    this.showMessage('⭐ +20 分', '#FFD32A');
                }
                break;

            case 'powerupStar':
                this.weaponLevel = Math.min(3, this.weaponLevel + 1);
                this.weaponTimer = 8000;
                this.showMessage('⭐ 武器升级！', '#FFD32A');
                break;

            case 'powerupShield':
                this.shieldActive = true;
                this.shieldTimer = 6000;
                this.shieldSprite.setVisible(true);
                this.showMessage('🛡️ 护盾启动！', '#45AAF2');
                break;
        }

        // 收集特效
        this.tweens.add({
            targets: player,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeInOut'
        });
    }

    // ==================== 特效 ====================

    createExplosion(x, y, isBig) {
        const size = isBig ? 2 : 1;
        for (let i = 0; i < (isBig ? 8 : 4); i++) {
            const ex = this.add.image(x, y, 'explosion').setDepth(15);
            ex.setScale(Phaser.Math.FloatBetween(0.3, 0.7) * size);
            ex.setAlpha(0.8);

            const angle = Math.random() * Math.PI * 2;
            const dist = Phaser.Math.Between(20, 50) * size;

            this.tweens.add({
                targets: ex,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                alpha: 0,
                scale: 0,
                duration: Phaser.Math.Between(300, 600),
                ease: 'Quad.easeOut',
                onComplete: () => ex.destroy()
            });
        }
    }

    showMessage(text, color) {
        const { width, height } = this.cameras.main;
        const msg = this.add.text(width / 2, height / 2 - 40, text, {
            fontSize: '28px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: color || '#FFFFFF',
            stroke: '#2D3436',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(200);

        this.tweens.add({
            targets: msg,
            y: msg.y - 60,
            alpha: 0,
            scale: 1.5,
            duration: 1200,
            ease: 'Quad.easeOut',
            onComplete: () => msg.destroy()
        });
    }

    // ==================== 游戏结束 ====================

    endGame() {
        if (this.gameOver) return;
        this.gameOver = true;

        // 停止各种活动
        this.fireTimer.remove();
        this.player.setActive(false);

        // 玩家爆炸
        this.createExplosion(this.player.x, this.player.y, true);
        this.player.setVisible(false);

        this.cameras.main.shake(400, 0.02);

        this.time.delayedCall(1000, () => {
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameOverScene', {
                    score: this.score,
                    kills: this.killCount
                });
            });
        });
    }

    // ==================== Update ====================

    update(time, delta) {
        if (this.gameOver) return;

        // —— 背景滚动 ——
        this.bg1.tilePositionY -= 0.5;

        // —— 云朵飘动 ——
        for (const c of this.clouds) {
            c.sprite.y += c.speed;
            if (c.sprite.y > this.gameHeight + 40) {
                c.sprite.y = -40;
                c.sprite.x = Phaser.Math.Between(0, this.gameWidth);
            }
        }

        // —— 键盘控制 ——
        if (this.cursors.left.isDown) {
            this.player.x -= 4;
        }
        if (this.cursors.right.isDown) {
            this.player.x += 4;
        }
        if (this.cursors.up.isDown) {
            this.player.y -= 4;
        }
        if (this.cursors.down.isDown) {
            this.player.y += 4;
        }

        // 空格手动射击
        if (this.spaceKey.isDown) {
            // 自动射击已由定时器处理
        }

        // —— 限制玩家在屏幕内 ——
        this.player.x = Phaser.Math.Clamp(this.player.x, 20, this.gameWidth - 20);
        this.player.y = Phaser.Math.Clamp(this.player.y, 40, this.gameHeight - 40);

        // —— 更新护盾位置 ——
        if (this.shieldActive) {
            this.shieldSprite.setPosition(this.player.x, this.player.y);
            this.shieldTimer -= delta;
            if (this.shieldTimer <= 0) {
                this.shieldActive = false;
                this.shieldSprite.setVisible(false);
            }
            // 护盾闪烁提示快消失
            if (this.shieldTimer < 1500 && this.shieldTimer > 0) {
                this.shieldSprite.setVisible(Math.floor(this.shieldTimer / 200) % 2 === 0);
            } else {
                this.shieldSprite.setVisible(true);
            }
        }

        // —— 武器升级倒计时 ——
        if (this.weaponTimer > 0) {
            this.weaponTimer -= delta;
            if (this.weaponTimer <= 0) {
                this.weaponLevel = 1;
                this.weaponTimer = 0;
            }
        }

        // —— 敌人射击（可射击的敌人随机发射） ——
        const shootingEnemies = this.enemies.getChildren().filter(e =>
            e.active && !e.getData('isBoss')
        );
        for (const enemy of shootingEnemies) {
            if (Math.random() < 0.005) {  // 每帧0.5%概率射击
                this.enemyFire(enemy);
            }
        }

        // —— 回收越界对象 ——
        this.playerBullets.getChildren().forEach(b => {
            if (b.active && b.y < -20) {
                b.setActive(false).setVisible(false);
                b.body.enable = false;
                this.playerBullets.killAndHide(b);
            }
        });

        this.enemyBullets.getChildren().forEach(b => {
            if (b.active && (b.y > this.gameHeight + 20 || b.y < -20)) {
                b.setActive(false).setVisible(false);
                b.body.enable = false;
                this.enemyBullets.killAndHide(b);
            }
        });

        this.enemies.getChildren().forEach(e => {
            if (e.active && e.y > this.gameHeight + 60) {
                e.destroy();
                if (e.getData('isBoss')) {
                    this.bossActive = false;
                }
            }
        });

        this.powerups.getChildren().forEach(p => {
            if (p.active && p.y > this.gameHeight + 20) {
                p.destroy();
            }
        });

        // —— 蜂鸟敌人波浪运动 ——
        this.enemies.getChildren().forEach(e => {
            if (e.active && e.texture.key === 'enemyBuzzy') {
                const waveTime = (e.getData('waveTime') || 0) + delta * 0.003;
                e.setData('waveTime', waveTime);
                const startX = e.getData('startX') || e.x;
                e.x = startX + Math.sin(waveTime) * 40;
            }
        });

        // —— 更新 HUD ——
        this.updateHUD();
    }
}