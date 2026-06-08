/**
 * AssetGenerator - 程序化绘制所有卡通风格游戏素材
 * 所有图形用 Phaser Graphics API 绘制，无需外部图片文件
 */
class AssetGenerator {

    /** 生成所有纹理，在 BootScene 中调用 */
    static generateAll(scene) {
        this.drawPlayer(scene);
        this.drawEnemyBlimp(scene);
        this.drawEnemyBuzzy(scene);
        this.drawBoss(scene);
        this.drawPlayerBullet(scene);
        this.drawEnemyBullet(scene);
        this.drawHeartPowerup(scene);
        this.drawStarPowerup(scene);
        this.drawShieldPowerup(scene);
        this.drawCloud(scene);
        this.drawSkyGradient(scene);
        this.drawExplosion(scene);
        this.drawStarScore(scene);
    }

    /** 可爱的玩家小飞机 (40x48) */
    static drawPlayer(scene) {
        const g = scene.make.graphics({ add: false });
        const w = 40, h = 48;

        // —— 机身 ——
        // 主体：圆润的椭圆/圆角矩形
        g.fillStyle(0x6BC5F0, 1);          // 淡蓝
        g.fillRoundedRect(8, 8, 24, 30, 12);

        // 机身高光
        g.fillStyle(0x8FD6FF, 1);
        g.fillRoundedRect(11, 11, 10, 20, 8);

        // —— 机翼 ——
        g.fillStyle(0x5BB5E0, 1);
        g.fillRoundedRect(0, 20, 40, 10, 5);

        // 机翼装饰条纹
        g.fillStyle(0xFF9EC4, 1);          // 粉色条纹
        g.fillRect(4, 22, 32, 3);

        // —— 尾翼 ——
        g.fillStyle(0x4BA5D0, 1);
        g.fillTriangle(14, 8, 26, 8, 20, 0);

        // —— 驾驶舱/眼睛 ——
        // 大眼睛（白色底）
        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(15, 22, 6);
        g.fillCircle(25, 22, 6);

        // 瞳孔
        g.fillStyle(0x2D3436, 1);
        g.fillCircle(15, 22, 3.5);
        g.fillCircle(25, 22, 3.5);

        // 高光
        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(16, 20, 1.8);
        g.fillCircle(26, 20, 1.8);

        // 腮红
        g.fillStyle(0xFF9EC4, 0.5);
        g.fillCircle(10, 30, 3);
        g.fillCircle(30, 30, 3);

        // 微笑
        g.lineStyle(2, 0x2D3436, 0.8);
        g.beginPath();
        g.arc(20, 32, 5, 0.2, Math.PI - 0.2, false);
        g.strokePath();

        // 起落架小轮子
        g.fillStyle(0x636E72, 1);
        g.fillCircle(12, 42, 3);
        g.fillCircle(28, 42, 3);

        g.generateTexture('player', w, h);
        g.destroy();
    }

    /** 敌人1: 飞艇 (36x34) */
    static drawEnemyBlimp(scene) {
        const g = scene.make.graphics({ add: false });
        const w = 36, h = 34;

        // 身体
        g.fillStyle(0xC084E0, 1);          // 薰衣草紫
        g.fillRoundedRect(4, 4, 28, 22, 12);

        // 高光
        g.fillStyle(0xD8A8F0, 1);
        g.fillRoundedRect(8, 7, 14, 10, 6);

        // 眼睛 (有点生气的可爱表情)
        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(12, 16, 5);
        g.fillCircle(24, 16, 5);

        g.fillStyle(0x2D3436, 1);
        g.fillCircle(12, 16, 3);
        g.fillCircle(24, 16, 3);

        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(13, 15, 1.5);
        g.fillCircle(25, 15, 1.5);

        // 眉毛（有点生气）
        g.lineStyle(2, 0x6C3483, 1);
        g.beginPath();
        g.moveTo(6, 10);
        g.lineTo(14, 12);
        g.strokePath();
        g.beginPath();
        g.moveTo(30, 10);
        g.lineTo(22, 12);
        g.strokePath();

        // 小鳍
        g.fillStyle(0xA86CD0, 1);
        g.fillTriangle(4, 16, 0, 12, 4, 12);
        g.fillTriangle(32, 16, 36, 12, 32, 12);

        // 底部小尾巴
        g.fillStyle(0xA86CD0, 1);
        g.fillTriangle(14, 26, 22, 26, 18, 32);

        g.generateTexture('enemyBlimp', w, h);
        g.destroy();
    }

    /** 敌人2: 小蜂鸟 (32x28) */
    static drawEnemyBuzzy(scene) {
        const g = scene.make.graphics({ add: false });
        const w = 32, h = 28;

        // 身体
        g.fillStyle(0xF5D76E, 1);          // 金黄色
        g.fillRoundedRect(6, 4, 20, 18, 10);

        // 条纹
        g.fillStyle(0x2D3436, 0.3);
        g.fillRect(8, 10, 16, 2);
        g.fillRect(8, 14, 16, 2);

        // 翅膀
        g.fillStyle(0xE8C84E, 0.7);
        g.fillEllipse(2, 12, 8, 14);
        g.fillEllipse(30, 12, 8, 14);

        // 眼睛（大而圆）
        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(12, 12, 4);
        g.fillCircle(20, 12, 4);

        g.fillStyle(0x2D3436, 1);
        g.fillCircle(12, 12, 2.5);
        g.fillCircle(20, 12, 2.5);

        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(13, 11, 1.2);
        g.fillCircle(21, 11, 1.2);

        // 微笑
        g.lineStyle(1.5, 0x2D3436, 0.7);
        g.beginPath();
        g.arc(16, 17, 3, 0.3, Math.PI - 0.3, false);
        g.strokePath();

        // 小触角
        g.lineStyle(2, 0x2D3436, 0.6);
        g.beginPath();
        g.moveTo(10, 4);
        g.lineTo(7, -2);
        g.strokePath();
        g.beginPath();
        g.moveTo(22, 4);
        g.lineTo(25, -2);
        g.strokePath();

        g.fillStyle(0x2D3436, 0.6);
        g.fillCircle(7, -2, 1.5);
        g.fillCircle(25, -2, 1.5);

        g.generateTexture('enemyBuzzy', w, h);
        g.destroy();
    }

    /** Boss敌人 (64x60) */
    static drawBoss(scene) {
        const g = scene.make.graphics({ add: false });
        const w = 64, h = 60;

        // 大身体
        g.fillStyle(0xE8799C, 1);          // 粉红
        g.fillRoundedRect(6, 10, 52, 40, 18);

        // 高光
        g.fillStyle(0xF0A0C0, 1);
        g.fillRoundedRect(12, 14, 28, 18, 10);

        // 大机翼
        g.fillStyle(0xD0698C, 1);
        g.fillRoundedRect(0, 24, 64, 14, 7);

        // 机翼装饰
        g.fillStyle(0xFFD32A, 0.8);
        for (let x = 4; x < 64; x += 12) {
            g.fillCircle(x + 4, 30, 2.5);
        }

        // 王冠
        g.fillStyle(0xFFD32A, 1);
        g.fillTriangle(18, 10, 22, 0, 26, 10);
        g.fillTriangle(24, 10, 28, 0, 32, 10);
        g.fillTriangle(30, 10, 34, 0, 38, 10);
        g.fillRect(18, 8, 20, 5);

        // 宝石
        g.fillStyle(0xFF4757, 1);
        g.fillCircle(28, 10, 3);

        // 眼睛（愤怒又可爱）
        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(20, 28, 7);
        g.fillCircle(44, 28, 7);

        g.fillStyle(0x2D3436, 1);
        g.fillCircle(20, 28, 4);
        g.fillCircle(44, 28, 4);

        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(21, 26, 2);
        g.fillCircle(45, 26, 2);

        // 愤怒眉毛
        g.lineStyle(3, 0x8B3B5A, 1);
        g.beginPath();
        g.moveTo(8, 18);
        g.lineTo(18, 22);
        g.strokePath();
        g.beginPath();
        g.moveTo(56, 18);
        g.lineTo(46, 22);
        g.strokePath();

        // 嘴巴
        g.fillStyle(0x8B3B5A, 1);
        g.fillEllipse(32, 40, 12, 6);

        g.generateTexture('boss', w, h);
        g.destroy();
    }

    /** 玩家子弹 (10x18) */
    static drawPlayerBullet(scene) {
        const g = scene.make.graphics({ add: false });
        const w = 10, h = 18;

        // 发光效果
        g.fillStyle(0xFFF5CC, 0.3);
        g.fillCircle(5, 9, 6);

        // 子弹主体
        g.fillStyle(0xFFE066, 1);
        g.fillRoundedRect(1, 2, 8, 14, 4);

        // 高光
        g.fillStyle(0xFFFFFF, 0.8);
        g.fillRoundedRect(3, 3, 4, 8, 2);

        g.generateTexture('bulletPlayer', w, h);
        g.destroy();
    }

    /** 敌人子弹 (8x8) */
    static drawEnemyBullet(scene) {
        const g = scene.make.graphics({ add: false });
        const w = 8, h = 8;

        g.fillStyle(0xFF6B6B, 0.3);
        g.fillCircle(4, 4, 5);

        g.fillStyle(0xFF6B6B, 1);
        g.fillCircle(4, 4, 3.5);

        g.fillStyle(0xFF9999, 1);
        g.fillCircle(4, 3, 1.5);

        g.generateTexture('bulletEnemy', w, h);
        g.destroy();
    }

    /** 爱心道具 (20x18) */
    static drawHeartPowerup(scene) {
        const g = scene.make.graphics({ add: false });
        const w = 20, h = 18;

        g.fillStyle(0xFF4757, 0.3);
        g.fillCircle(10, 9, 11);

        g.fillStyle(0xFF4757, 1);
        // 用两个圆加一个三角形合成心形
        g.fillCircle(6, 6, 6);
        g.fillCircle(14, 6, 6);
        g.fillTriangle(0, 7, 20, 7, 10, 18);

        g.fillStyle(0xFF6B7F, 1);
        g.fillCircle(6, 5, 3);
        g.fillCircle(14, 5, 3);

        g.generateTexture('powerupHeart', w, h);
        g.destroy();
    }

    /** 星星道具 (18x18) */
    static drawStarPowerup(scene) {
        const g = scene.make.graphics({ add: false });
        const w = 18, h = 18;

        g.fillStyle(0xFFD32A, 0.3);
        g.fillCircle(9, 9, 10);

        g.fillStyle(0xFFD32A, 1);
        // 绘制五角星
        const cx = 9, cy = 9, r = 8, r2 = 3.5;
        g.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI / 5);
            const angle2 = angle + Math.PI / 5;
            const x1 = cx + r * Math.cos(angle);
            const y1 = cy + r * Math.sin(angle);
            const x2 = cx + r2 * Math.cos(angle2);
            const y2 = cy + r2 * Math.sin(angle2);
            if (i === 0) g.moveTo(x1, y1);
            else g.lineTo(x1, y1);
            g.lineTo(x2, y2);
        }
        g.closePath();
        g.fillPath();

        g.fillStyle(0xFFFFFF, 0.6);
        g.fillCircle(8, 7, 2);

        g.generateTexture('powerupStar', w, h);
        g.destroy();
    }

    /** 护盾道具 (18x18) */
    static drawShieldPowerup(scene) {
        const g = scene.make.graphics({ add: false });
        const w = 18, h = 18;

        g.fillStyle(0x45AAF2, 0.3);
        g.fillCircle(9, 9, 10);

        g.fillStyle(0x45AAF2, 1);
        g.fillCircle(9, 9, 7);

        g.fillStyle(0xFFFFFF, 1);
        g.fillRect(6, 5, 6, 9);
        g.fillRect(5, 6, 8, 7);

        g.fillStyle(0x45AAF2, 1);
        g.fillRect(7, 6, 4, 7);
        g.fillRect(6, 7, 6, 5);

        g.fillStyle(0xFFFFFF, 0.6);
        g.fillCircle(8, 7, 2);

        g.generateTexture('powerupShield', w, h);
        g.destroy();
    }

    /** 云朵 (60x30) */
    static drawCloud(scene) {
        const g = scene.make.graphics({ add: false });
        const w = 60, h = 30;

        g.fillStyle(0xFFFFFF, 0.7);
        g.fillCircle(14, 20, 10);
        g.fillCircle(30, 16, 14);
        g.fillCircle(46, 20, 10);
        g.fillCircle(22, 14, 8);
        g.fillCircle(38, 14, 8);

        g.fillStyle(0xFFFFFF, 0.3);
        g.fillCircle(14, 18, 8);
        g.fillCircle(30, 14, 10);
        g.fillCircle(46, 18, 8);

        g.generateTexture('cloud', w, h);
        g.destroy();
    }

    /** 天空渐变背景 (2x720) - 垂直渐变条 */
    static drawSkyGradient(scene) {
        const g = scene.make.graphics({ add: false });
        const w = 2, h = 720;

        // 用多个色块模拟渐变
        const colors = [
            { y: 0, c: 0x87CEEB },
            { y: 120, c: 0x9FD8EF },
            { y: 240, c: 0xB8E3F3 },
            { y: 360, c: 0xD0EDF7 },
            { y: 480, c: 0xE8F7FB },
            { y: 600, c: 0xF0FAFF },
            { y: 720, c: 0xF5FCFF }
        ];
        for (let i = 0; i < colors.length - 1; i++) {
            const y1 = colors[i].y;
            const y2 = colors[i + 1].y;
            g.fillStyle(colors[i].c, 1);
            g.fillRect(0, y1, w, y2 - y1);
        }

        g.generateTexture('skyGradient', w, h);
        g.destroy();
    }

    /** 爆炸特效 (32x32) - 多帧合成在贴图里 */
    static drawExplosion(scene) {
        const g = scene.make.graphics({ add: false });
        const w = 32, h = 32;

        // 外圈
        g.fillStyle(0xFF6B35, 0.7);
        g.fillCircle(16, 16, 14);
        // 中圈
        g.fillStyle(0xFFB347, 0.8);
        g.fillCircle(16, 16, 10);
        // 内核
        g.fillStyle(0xFFFFFF, 0.9);
        g.fillCircle(16, 16, 5);

        g.generateTexture('explosion', w, h);
        g.destroy();
    }

    /** 得分星星装饰 (12x12) */
    static drawStarScore(scene) {
        const g = scene.make.graphics({ add: false });
        const w = 12, h = 12;

        g.fillStyle(0xFFD32A, 1);
        const cx = 6, cy = 6, r = 5, r2 = 2.5;
        g.beginPath();
        for (let i = 0; i < 5; i++) {
            const a1 = -Math.PI / 2 + (i * 2 * Math.PI / 5);
            const a2 = a1 + Math.PI / 5;
            const x1 = cx + r * Math.cos(a1);
            const y1 = cy + r * Math.sin(a1);
            const x2 = cx + r2 * Math.cos(a2);
            const y2 = cy + r2 * Math.sin(a2);
            if (i === 0) g.moveTo(x1, y1);
            else g.lineTo(x1, y1);
            g.lineTo(x2, y2);
        }
        g.closePath();
        g.fillPath();

        g.generateTexture('starScore', w, h);
        g.destroy();
    }
}