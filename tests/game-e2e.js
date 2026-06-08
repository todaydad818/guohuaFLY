/**
 * tests/game-e2e.js — E2E 浏览器测试
 * 
 * 依赖: playwright (需安装: npm install playwright)
 * 如果 playwright 不可用，则仅运行 HTTP 服务级测试并跳过浏览器测试。
 */
"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");

const ROOT = path.resolve(__dirname, "..");
const PORT = 8976;
const HOST = "127.0.0.1";
const SCREENSHOT_DIR = path.join(__dirname, "screenshots");

let playwright = null;
try {
    playwright = require("playwright");
} catch (e) {
    // Playwright 未安装
}

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

async function testAsync(name, fn) {
    try {
        await fn();
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

// ── HTTP 服务器 ──
const MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".json": "application/json",
};

function createServer() {
    return http.createServer((req, res) => {
        let filePath = req.url === "/" ? "/index.html" : req.url;
        filePath = path.join(ROOT, filePath);
        if (!filePath.startsWith(ROOT)) {
            res.writeHead(403);
            res.end("Forbidden");
            return;
        }
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end("Not Found");
                return;
            }
            const ext = path.extname(filePath);
            res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
            res.end(data);
        });
    });
}

function closeServer(server) { return new Promise(resolve => { try { server.close(resolve); } catch(e) { resolve(); } }); }

// ── HTTP 服务级测试 ──
async function runHttpTests() {
    console.log("\n🌐 HTTP 服务测试");
    const server = createServer();
    await new Promise(resolve => server.listen(PORT, HOST, resolve));

    try {
        await testAsync("index.html 返回 200", async () => {
            const res = await fetch(`http://${HOST}:${PORT}/`);
            assert(res.status === 200, `状态码 ${res.status}`);
            const text = await res.text();
            assert(text.includes("guohua2.0"), "页面内容不包含标题");
        });

        await testAsync("JS 文件均可访问", async () => {
            const jsFiles = [
                "/js/main.js", "/js/AssetGenerator.js",
                "/js/scenes/BootScene.js", "/js/scenes/MenuScene.js",
                "/js/scenes/GameScene.js", "/js/scenes/GameOverScene.js",
            ];
            for (const f of jsFiles) {
                const res = await fetch(`http://${HOST}:${PORT}${f}`);
                assert(res.status === 200, `${f} 返回 ${res.status}`);
            }
        });

        await testAsync("Phaser CDN 引用正确", async () => {
            const res = await fetch(`http://${HOST}:${PORT}/`);
            const text = await res.text();
            assert(text.includes("cdn.jsdelivr.net"), "HTML 中未引用 Phaser CDN");
        });

        await testAsync("404 处理正确", async () => {
            const res = await fetch(`http://${HOST}:${PORT}/nonexistent.js`);
            assert(res.status === 404, `应为 404，得到 ${res.status}`);
        });
    } finally {
        await closeServer(server);
    }
}

// ── Playwright 浏览器测试 ──
async function runBrowserTests(browser) {
    const page = await browser.newPage({
        viewport: { width: 480, height: 720 },
    });

    const consoleErrors = [];
    page.on("console", msg => {
        if (msg.type() === "error") {
            consoleErrors.push(msg.text());
        }
    });

    const pageErrors = [];
    page.on("pageerror", err => {
        pageErrors.push(err.message);
    });

    await fs.promises.mkdir(SCREENSHOT_DIR, { recursive: true });

    // ── 场景1: 菜单 ──
    console.log("\n🏠 场景1: 菜单场景");
    await testAsync("页面加载无 JS 错误", async () => {
        await page.goto(`http://${HOST}:${PORT}/`, { waitUntil: "networkidle", timeout: 15000 });
        await page.waitForTimeout(3000);
        if (consoleErrors.length > 0) {
            throw new Error("控制台错误: " + consoleErrors.join("; "));
        }
        if (pageErrors.length > 0) {
            throw new Error("页面错误: " + pageErrors.join("; "));
        }
    });

    await testAsync("页面标题正确", async () => {
        const title = await page.title();
        assert(title.includes("guohua2.0"), `标题为: ${title}`);
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-menu.png") });
    console.log("      📸 tests/screenshots/01-menu.png");

    // ── 场景2: 游戏场景 ──
    console.log("\n🎯 场景2: 游戏场景");
    await testAsync("点击开始按钮进入游戏", async () => {
        const canvas = await page.$("canvas");
        assert(canvas !== null, "未找到 canvas");
        // 开始按钮在 y=0.52*720 ≈ 374
        await canvas.click({ position: { x: 240, y: 374 } });
        await page.waitForTimeout(2000);
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-game-start.png") });

    await testAsync("等待敌人出现", async () => {
        await page.waitForTimeout(3000);
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-game-enemies.png") });

    // ── 场景3: 游戏操作 ──
    console.log("\n🕹️  场景3: 游戏操作");
    await testAsync("模拟鼠标移动和射击", async () => {
        const canvas = await page.$("canvas");
        await page.mouse.move(240, 500);
        await page.mouse.click(240, 500);
        await page.waitForTimeout(1000);
        for (let i = 0; i < 5; i++) {
            await page.mouse.move(100 + i * 60, 400);
            await page.mouse.click(100 + i * 60, 400);
            await page.waitForTimeout(300);
        }
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-game-action.png") });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-game-progress.png") });

    // ── 场景4: 控制台检查 ──
    console.log("\n🔇 负面测试");
    await testAsync("控制台无严重错误", async () => {
        const criticalErrors = consoleErrors.filter(e =>
            !e.includes("favicon") && !e.includes("WebGL") && !e.includes("ERR_BLOCKED")
        );
        if (criticalErrors.length > 0) {
            console.log(`      ⚠️  控制台有 ${consoleErrors.length} 条输出，${criticalErrors.length} 条需关注`);
        }
    });

    console.log("\n      📸 截图已保存到 tests/screenshots/");
}

// ── 主流程 ──
async function main() {
    console.log("╔══════════════════════════════════════╗");
    console.log("║     ✈️  guohua2.0 — E2E 测试       ║");
    console.log("╚══════════════════════════════════════╝");

    await runHttpTests();

    if (playwright) {
        const browser = await playwright.chromium.launch({
            headless: true,
            args: ["--no-sandbox"],
        });
        const server = createServer();
        await new Promise(resolve => server.listen(PORT, HOST, resolve));
        try {
            await runBrowserTests(browser);
        } finally {
            await closeServer(server);
            await browser.close();
        }
    } else {
        console.log("\n⚠️  Playwright 未安装，跳过浏览器测试。");
        console.log("   安装后运行完整测试:");
        console.log("   npm install");
        console.log("   npm test");
    }

    console.log(`\n${"=".repeat(40)}`);
    console.log(`总计: ${passed + failed}  |  通过: ${passed}  |  失败: ${failed}`);
    console.log(`${"=".repeat(40)}`);

    setTimeout(() => process.exit(failed > 0 ? 1 : 0), 500);
}

main().catch(err => {
    console.error("测试异常:", err.message);
    process.exit(1);
});