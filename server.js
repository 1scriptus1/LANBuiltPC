const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const {
    mouse,
    keyboard,
    Button,
    Key,
    Point
} = require("@nut-tree-fork/nut-js");

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({
    server
});

app.use(express.static("public"));

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

                    if (Key[data.key.toUpperCase()]) {

                        await keyboard.pressKey(
                            Key[data.key.toUpperCase()]
                        );

                    }

                    break;

                case "keyup":

                    if (Key[data.key.toUpperCase()]) {

                        await keyboard.releaseKey(
                            Key[data.key.toUpperCase()]
                        );

                    }

                    break;
            }

        } catch (err) {

            console.log(err);

        }

    });

});

server.listen(3000, "0.0.0.0", () => {

    console.log("server running");

});