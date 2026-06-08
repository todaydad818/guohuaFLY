/**
 * GameOverScene - 游戏结束界面
 */
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalKills = data.kills || 0;
    }

    create() {
        const { width, height } = this.cameras.main;

        // —— 背景 ——
        this.add.image(0, 0, 'skyGradient')
            .setOrigin(0, 0)
            .setDisplaySize(width, height);

        // —— 深色遮罩 ——
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.4);
        overlay.fillRect(0, 0, width, height);

        // —— 标题 ——
        const titleText = this.add.text(width / 2, height * 0.18, '💥 游戏结束', {
            fontSize: '40px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#FF6B6B',
            stroke: '#FFFFFF',
            strokeThickness: 5,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#2D3436',
                blur: 4,
                fill: true
            }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: titleText,
            y: titleText.y - 5,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // —— 小飞机 ——
        const plane = this.add.image(width / 2, height * 0.33, 'player')
            .setScale(1.3)
            .setAlpha(0.6);

        this.tweens.add({
            targets: plane,
            angle: -5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // —— 分数卡片背景 ——
        const cardY = height * 0.48;
        const card = this.add.graphics();
        card.fillStyle(0xFFFFFF, 0.15);
        card.fillRoundedRect(width / 2 - 120, cardY - 50, 240, 100, 16);
        card.lineStyle(2, 0xFFFFFF, 0.3);
        card.strokeRoundedRect(width / 2 - 120, cardY - 50, 240, 100, 16);

        // 分数
        this.add.text(width / 2, cardY - 20, '最终得分', {
            fontSize: '16px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#B2BEC3'
        }).setOrigin(0.5);

        this.add.text(width / 2, cardY + 10, '⭐ ' + this.finalScore, {
            fontSize: '36px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#FFD32A',
            stroke: '#2D3436',
            strokeThickness: 3
        }).setOrigin(0.5);

        // 击杀数
        this.add.text(width / 2, cardY + 42, '👾 击毁 ' + this.finalKills + ' 个敌人', {
            fontSize: '13px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#DFE6E9'
        }).setOrigin(0.5);

        // —— 评价 ——
        const comment = this.getComment();
        this.add.text(width / 2, height * 0.67, comment, {
            fontSize: '16px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#FFFFFF',
            stroke: '#2D3436',
            strokeThickness: 2
        }).setOrigin(0.5);

        // —— 重新开始按钮 ——
        const btnY = height * 0.78;
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x45AAF2, 1);
        btnBg.fillRoundedRect(width / 2 - 100, btnY - 22, 200, 44, 22);

        this.tweens.add({
            targets: btnBg,
            alpha: 0.7,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const btnText = this.add.text(width / 2, btnY, '🔄 再来一次', {
            fontSize: '22px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#FFFFFF',
            stroke: '#2D86C7',
            strokeThickness: 3
        }).setOrigin(0.5);

        const btnZone = this.add.zone(width / 2, btnY, 200, 44).setInteractive({ useHandCursor: true });

        btnZone.on('pointerover', () => {
            btnBg.clear();
            btnBg.fillStyle(0x6CC4F7, 1);
            btnBg.fillRoundedRect(width / 2 - 100, btnY - 22, 200, 44, 22);
            btnText.setScale(1.05);
        });

        btnZone.on('pointerout', () => {
            btnBg.clear();
            btnBg.fillStyle(0x45AAF2, 1);
            btnBg.fillRoundedRect(width / 2 - 100, btnY - 22, 200, 44, 22);
            btnText.setScale(1);
        });

        btnZone.on('pointerdown', () => {
            this.cameras.main.fadeOut(400, 255, 255, 255);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
        });

        // —— 返回菜单 ——
        const menuText = this.add.text(width / 2, height * 0.88, '🏠 返回主菜单', {
            fontSize: '16px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#B2BEC3',
            stroke: '#2D3436',
            strokeThickness: 2
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        menuText.on('pointerover', () => menuText.setColor('#FFFFFF'));
        menuText.on('pointerout', () => menuText.setColor('#B2BEC3'));
        menuText.on('pointerdown', () => {
            this.cameras.main.fadeOut(400, 255, 255, 255);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        });

        // 入场
        this.cameras.main.fadeIn(500);
    }

    getComment() {
        if (this.finalScore >= 3000) return '🏆 王牌飞行员！太厉害了！';
        if (this.finalScore >= 1500) return '🎖️ 精英飞行员，非常棒！';
        if (this.finalScore >= 500) return '👍 不错的成绩，继续加油！';
        return '💪 再试一次，你可以的！';
    }
}