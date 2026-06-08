const http = require("http");
const fs = require("fs");
const path = require("path");
const types = {
  ".js": "application/javascript",
  ".html": "text/html",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".json": "application/json"
};
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url);
  try {
    const content = fs.readFileSync(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": types[ext] || "text/plain", "Access-Control-Allow-Origin": "*" });
    res.end(content);
  } catch (e) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found: " + req.url);
  }
});
server.listen(8080, "0.0.0.0", () => console.log("Server on http://localhost:8080"));

