/**
 * tests/syntax-check.js — 语法检查 + 项目结构验证
 * 零依赖，只使用 Node.js 内置模块
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (e) {
        console.log(`  ❌ ${name}`);
        console.log(`      ${e.message}`);
        failed++;
    }
}

function assert(cond, msg) {
    if (!cond) throw new Error(msg || "assertion failed");
}

// ── 1. 检查项目文件结构 ──
console.log("\n📁 项目结构检查");

const requiredFiles = [
    "index.html",
    "js/main.js",
    "js/AssetGenerator.js",
    "js/scenes/BootScene.js",
    "js/scenes/MenuScene.js",
    "js/scenes/GameScene.js",
    "js/scenes/GameOverScene.js",
];

for (const f of requiredFiles) {
    test(`文件存在: ${f}`, () => {
        assert(fs.existsSync(path.join(ROOT, f)), `找不到 ${f}`);
    });
}

// ── 2. JS 语法检查 ──
console.log("\n🔍 JS 语法检查");

const jsFiles = requiredFiles.filter(f => f.endsWith(".js"));
for (const f of jsFiles) {
    test(`语法通过: ${f}`, () => {
        execSync(`node --check "${path.join(ROOT, f)}"`, { stdio: "pipe", encoding: "utf8" });
    });
}

// ── 3. index.html 内容验证 ──
console.log("\n📄 index.html 内容检查");

const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

test("标题包含「郭华打飞机」", () => {
    assert(html.includes("郭华打飞机"), `标题错误，实际内容不包含「郭华打飞机」`);
});

test("加载 Phaser CDN", () => {
    assert(html.includes("phaser"), "未引用 Phaser");
});

test("加载所有 JS 脚本", () => {
    const scripts = ["AssetGenerator.js", "BootScene.js", "MenuScene.js", "GameScene.js", "GameOverScene.js", "main.js"];
    for (const s of scripts) {
        assert(html.includes(s), `缺少脚本引用: ${s}`);
    }
});

test("viewport 配置正确", () => {
    assert(html.includes("viewport"), "缺少 viewport meta");
});

// ── 4. main.js 验证 ──
console.log("\n⚙️  main.js 配置检查");

const mainJs = fs.readFileSync(path.join(ROOT, "js/main.js"), "utf8");

test("注册了所有 4 个场景", () => {
    const scenes = ["BootScene", "MenuScene", "GameScene", "GameOverScene"];
    for (const s of scenes) {
        assert(mainJs.includes(s), `场景未注册: ${s}`);
    }
});

test("使用 Arcade 物理引擎", () => {
    assert(mainJs.includes("arcade"), "未配置 arcade 物理引擎");
});

test("游戏尺寸 480x720", () => {
    assert(mainJs.includes("480"), "宽度未设置 480");
    assert(mainJs.includes("720"), "高度未设置 720");
});

// ── 5. AssetGenerator 验证 ──
console.log("\n🎨 AssetGenerator 检查");

const assetJs = fs.readFileSync(path.join(ROOT, "js/AssetGenerator.js"), "utf8");

const expectedTextures = [
    "drawPlayer", "drawEnemyBlimp", "drawEnemyBuzzy", "drawBoss",
    "drawPlayerBullet", "drawEnemyBullet",
    "drawHeartPowerup", "drawStarPowerup", "drawShieldPowerup",
    "drawCloud", "drawSkyGradient", "drawExplosion", "drawStarScore"
];

for (const tex of expectedTextures) {
    test(`纹理方法存在: ${tex}`, () => {
        assert(assetJs.includes(tex), `未找到方法 ${tex}`);
    });
}

// ── 6. GameScene 核心逻辑验证 ──
console.log("\n🎮 GameScene 逻辑检查");

const gameJs = fs.readFileSync(path.join(ROOT, "js/scenes/GameScene.js"), "utf8");

const gameFeatures = [
    { name: "玩家射击", key: "playerFire" },
    { name: "敌人生成", key: "spawnEnemy" },
    { name: "Boss 生成", key: "spawnBoss" },
    { name: "道具系统", key: "spawnPowerup" },
    { name: "碰撞检测", key: "onBulletHitEnemy" },
    { name: "玩家受伤", key: "playerTakeDamage" },
    { name: "游戏结束", key: "endGame" },
    { name: "HUD 更新", key: "updateHUD" },
    { name: "爆炸特效", key: "createExplosion" },
    { name: "键盘控制", key: "cursors" },
];

for (const feat of gameFeatures) {
    test(`核心功能: ${feat.name}`, () => {
        assert(gameJs.includes(feat.key), `未找到 ${feat.key}`);
    });
}

// ── 结果汇总 ──
console.log(`\n${"=".repeat(40)}`);
console.log(`总计: ${passed + failed}  |  通过: ${passed}  |  失败: ${failed}`);
console.log(`${"=".repeat(40)}`);

process.exit(failed > 0 ? 1 : 0);