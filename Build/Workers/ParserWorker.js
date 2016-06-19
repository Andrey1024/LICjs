define(["require", "exports", '../ExpressionParser/Expression'], function (require, exports, Expr) {
    "use strict";
    var parserX = new Expr.Expression();
    var parserY = new Expr.Expression();
    var lastMessage;
    function UpdateExpression(expression, input) {
        if (expression.IsValid && expression.Input === input.replace(/\s+/g, '')) {
            return true;
        }
        else {
            expression.Parse(input);
            return expression.IsValid;
        }
    }
    return function (e) {
        var msg = e.data;
        var isChanged = false;
        if (!parserX.IsValid || parserX.Input !== msg.input.x.replace(/\s+/g, '')) {
            parserX.Parse(msg.input.x);
            isChanged = true;
        }
        if (!parserY.IsValid || parserY.Input !== msg.input.y.replace(/\s+/g, '')) {
            parserY.Parse(msg.input.y);
            isChanged = true;
        }
        if (!parserX.IsValid || !parserY.IsValid) {
            self.postMessage({
                type: "error",
                error: {
                    errorX: parserX.IsValid ? '' : parserX.Error,
                    errorY: parserY.IsValid ? '' : parserY.Error
                }
            });
            return;
        }
        else {
            self.postMessage({ type: "parsed" });
        }
        var size = Number(msg.size);
        var left = Number(msg.bounds.left);
        var top = Number(msg.bounds.top);
        var right = Number(msg.bounds.right);
        var boottom = Number(msg.bounds.bottom);
        var step = (right - left) / size;
        var pixelsNum = size * size;
        var arrayLength = pixelsNum * 4;
        var buf = new Float32Array(arrayLength);
        var max = 0;
        var start = Date.now();
        for (var i = 0; i < size; i++)
            for (var j = 0; j < size; j++) {
                var off = (i * size + j) * 4;
                var x = left + j * step;
                var y = top - i * step;
                var vx = parserX.getResult([{ name: 'x', value: x }, { name: 'y', value: y }]);
                var vy = parserY.getResult([{ name: 'x', value: x }, { name: 'y', value: y }]);
                var mod = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
                max = Math.max(max, mod);
                buf[off + 0] = vx / mod;
                buf[off + 1] = vy / mod;
                buf[off + 2] = mod;
            }
        console.log("Compute filed with parsed expressions took " + (Date.now() - start) + " ms");
        self.postMessage({ type: "value", field: { buffer: buf.buffer, width: size, height: size, max: max } });
    };
});
