# LLM自己的经验

## 2026-06-08

### 用 PowerShell 启动本地 HTTP 服务器供浏览器访问时，注意进程启动方式
在受限沙箱环境中调用 `Start-Job` 或 `Start-Process -WindowStyle Hidden` 启动的 HTTP 服务器进程（如 Python http.server、Node.js http），可能绑定端口但无法正常响应 HTTP 请求（表现为 ERR_EMPTY_RESPONSE 或 ERR_CONNECTION_REFUSED）。
解决方案：
- 使用 `Start-Process -WindowStyle Normal` 或 `-WindowStyle Maximized` 启动服务器进程，创建可见窗口可使其正常工作。
- 或者在 shell 中直接前台运行（配合长时间 timeout），也能正常工作。
- 如果 sandbox 权限为 managed/restricted，应先确认沙箱是否限制了网络访问。

