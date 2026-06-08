/**
 * BootScene - 加载/生成资源，显示加载进度
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // 显示加载文字
        const { width, height } = this.cameras.main;
        this.add.text(width / 2, height / 2, '✈️ 起飞准备中...', {
            fontSize: '24px',
            fontFamily: 'Microsoft YaHei, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    create() {
        // 生成所有纹理
        AssetGenerator.generateAll(this);

        // 创建云朵动画帧（用单帧，用缩放和移动做效果）
        // 直接跳转到菜单场景
        this.time.delayedCall(500, () => {
            this.scene.start('MenuScene');
        });
    }
}