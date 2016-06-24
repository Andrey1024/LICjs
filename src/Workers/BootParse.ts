/// <reference path="../../typings/requirejs/require.d.ts" />

importScripts("../../lib/requirejs/require.js");

var message;

self.onmessage = (ev: MessageEvent) => {
    message = ev;
}

require(["./ParserWorker"], (Parser) => {
    self.onmessage = Parser;
    if (message !== undefined)
        self.onmessage(message)
});
