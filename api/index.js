const fs = require('fs'),
    http = require('http'),
    https = require('https'),
    express = require('express');

const userRouter = require("./routers/userRouter")
const kitsRouter = require("./routers/kitsRouter")

async function start() {
    var port = 8000;

    var options = {
        key: fs.readFileSync('./api/cert/key.pem'),
        cert: fs.readFileSync('./api/cert/cert.pem'),
    };

    var app = express();
    app.use("/users", userRouter)
    app.use("/kits", kitsRouter)

    var server = https.createServer(options, app).listen(port, function(){
    console.log("Express server listening on port " + port)
    });

    app.get('/', async function (req, res) {
        res.writeHead(200);
        res.end("hello world\n");
    });
}

module.exports = {
    start
}