const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const screenshot = require("screenshot-desktop");

const {
    mouse,
    keyboard,
    Button,
    Key,
    Point
} = require("@nut-tree-fork/nut-js");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));

let currentScreenIndex = 0;

// ===== SCREEN STREAM =====
async function sendScreen() {
    try {
        const img = await screenshot({
            screen: currentScreenIndex
        });

        const base64 = img.toString("base64");

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: "screen",
                    image: base64
                }));
            }
        });

    } catch (err) {
        console.log("screen error:", err);
    }
}

// 10–15 FPS (safe for CPU)
setInterval(sendScreen, 80);

// ===== INPUT HANDLING =====
wss.on("connection", (ws) => {
    console.log("client connected");

    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {

                case "mousemove":
                    await mouse.setPosition(
                        new Point(data.x, data.y)
                    );
                    break;

                case "mousedown":
                    await mouse.pressButton(Button.LEFT);
                    break;

                case "mouseup":
                    await mouse.releaseButton(Button.LEFT);
                    break;

                case "keydown":
                    if (data.key) {
                        try {
                            await keyboard.pressKey(
                                Key[data.key.toUpperCase()]
                            );
                        } catch {}
                    }
                    break;

                case "keyup":
                    if (data.key) {
                        try {
                            await keyboard.releaseKey(
                                Key[data.key.toUpperCase()]
                            );
                        } catch {}
                    }
                    break;

                case "switchScreen":
                    currentScreenIndex = data.index || 0;
                    console.log("screen switched:", currentScreenIndex);
                    break;
            }

        } catch (err) {
            console.log("input error:", err);
        }
    });
});

server.listen(3000, "0.0.0.0", () => {
    console.log("server running on port 3000");
});