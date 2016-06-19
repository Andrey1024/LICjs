importScripts("../../lib/requirejs/require.js");
var message;
self.onmessage = function (ev) {
    message = ev;
};
require(["./ParserWorker"], function (Parser) {
    self.onmessage = Parser;
    if (message !== undefined)
        self.onmessage(message);
});
