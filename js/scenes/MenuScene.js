/**
 * MenuScene - 主菜单界面，可爱卡通风格
 */
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // —— 天空背景 ——
        this.createSkyBackground(width, height);

        // —— 飘动的云朵 ——
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            const cloud = this.add.image(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(40, height - 100),
                'cloud'
            ).setScale(Phaser.Math.FloatBetween(0.8, 1.5))
             .setAlpha(Phaser.Math.FloatBetween(0.4, 0.7));
            this.clouds.push(cloud);
        }

        // —— 浮动的小飞机装饰 ——
        for (let i = 0; i < 3; i++) {
            const plane = this.add.image(
                Phaser.Math.Between(50, width - 50),
                Phaser.Math.Between(100, height - 200),
                'player'
            ).setScale(0.6)
             .setAlpha(0.3 + i * 0.15);

            this.tweens.add({
                targets: plane,
                y: plane.y - 20,
                duration: 1500 + i * 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // —— 标题 ——
        const titleY = height * 0.22;
        const title = this.add.text(width / 2, titleY, 'guohua2.0', {
            fontSize: '38px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#FF6B6B',
            stroke: '#FFFFFF',
            strokeThickness: 6,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#2D3436',
                blur: 4,
                fill: true
            }
        }).setOrigin(0.5);

        // 标题弹跳动画
        this.tweens.add({
            targets: title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 副标题
        this.add.text(width / 2, titleY + 60, '可爱的卡通射击冒险', {
            fontSize: '16px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#636E72',
            stroke: '#FFFFFF',
            strokeThickness: 3
        }).setOrigin(0.5);

        // —— 开始按钮 ——
        const btnY = height * 0.52;
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0xFF6B6B, 1);
        btnBg.fillRoundedRect(width / 2 - 90, btnY - 25, 180, 50, 25);

        // 按钮脉动
        this.tweens.add({
            targets: btnBg,
            alpha: 0.7,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const btnText = this.add.text(width / 2, btnY, '🎮 开始游戏', {
            fontSize: '24px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#FFFFFF',
            stroke: '#C0392B',
            strokeThickness: 3
        }).setOrigin(0.5);

        // 按钮交互区
        const btnZone = this.add.zone(width / 2, btnY, 180, 50).setInteractive({ useHandCursor: true });

        btnZone.on('pointerover', () => {
            btnBg.clear();
            btnBg.fillStyle(0xFF8585, 1);
            btnBg.fillRoundedRect(width / 2 - 90, btnY - 25, 180, 50, 25);
            btnText.setScale(1.05);
        });

        btnZone.on('pointerout', () => {
            btnBg.clear();
            btnBg.fillStyle(0xFF6B6B, 1);
            btnBg.fillRoundedRect(width / 2 - 90, btnY - 25, 180, 50, 25);
            btnText.setScale(1);
        });

        btnZone.on('pointerdown', () => {
            this.cameras.main.fadeOut(400, 255, 255, 255);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
        });

        // —— 操作提示 ——
        const tipY = height * 0.68;
        this.add.text(width / 2, tipY, '🖱 鼠标/触屏移动  |  点击发射', {
            fontSize: '14px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#636E72',
            stroke: '#FFFFFF',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(width / 2, tipY + 24, '⌨️ 方向键移动  |  空格键发射', {
            fontSize: '14px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#636E72',
            stroke: '#FFFFFF',
            strokeThickness: 2
        }).setOrigin(0.5);

        // —— 底部装饰 ——
        this.add.text(width / 2, height - 30, '❤️ 收集爱心回血 · ⭐ 武器升级 · 🛡️ 护盾保护', {
            fontSize: '12px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#B2BEC3',
            stroke: '#FFFFFF',
            strokeThickness: 2
        }).setOrigin(0.5);

        // 入场淡入
        this.cameras.main.fadeIn(500);
    }

    createSkyBackground(width, height) {
        // 使用渐变条拉伸作为背景
        this.add.image(0, 0, 'skyGradient')
            .setOrigin(0, 0)
            .setDisplaySize(width, height);
    }

    update() {
        // 云朵缓慢飘动
        if (this.clouds) {
            for (const cloud of this.clouds) {
                cloud.x += 0.3;
                if (cloud.x > this.cameras.main.width + 60) {
                    cloud.x = -60;
                    cloud.y = Phaser.Math.Between(40, this.cameras.main.height - 100);
                }
            }
        }
    }
}