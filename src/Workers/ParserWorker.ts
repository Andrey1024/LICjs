import * as Expr from '../ExpressionParser/Expression';

let parserX = new Expr.Expression();
let parserY = new Expr.Expression();
let lastMessage: Expr.IWorkerMessage;

export = (e: MessageEvent) => {
    let msg = <Expr.IWorkerMessage>e.data;
    let isChanged = false;

    if (!parserX.IsValid || parserX.Input !== msg.input.x.replace(/\s+/g, '')) {
        parserX.Parse(msg.input.x);
        isChanged = true;
    }
    if (!parserY.IsValid || parserY.Input !== msg.input.y.replace(/\s+/g, '')) {
        parserY.Parse(msg.input.y);
        isChanged = true;
    }

    if (!isChanged && JSON.stringify(msg.bounds) === JSON.stringify(lastMessage.bounds))
        return; //nothing changed

    if (!parserX.IsValid || !parserY.IsValid) { // there are errors in parsed expressions
        (<any>self).postMessage(<Expr.IWorkerResponse>
            {
                type: "error",
                error: {
                    errorX: parserX.IsValid ? '' : parserX.Error,
                    errorY: parserY.IsValid ? '' : parserY.Error
                }
            });
        return;
    } else {
        (<any>self).postMessage(<Expr.IWorkerResponse>{type: "parsed"});
    }
    // compute new field now
    let size     = Number(msg.size);
    let left     = Number(msg.bounds.left);
    let top      = Number(msg.bounds.top);
    let right    = Number(msg.bounds.right);
    let boottom  = Number(msg.bounds.bottom);

    let step = (right - left) / size;
    let pixelsNum = size * size;
    let arrayLength = pixelsNum * 4;
    let buf = new Float32Array(arrayLength);
    let max = 0;
    let start = Date.now();
    for (var i = 0; i < size; i++)
        for (var j = 0; j < size; j++) {
            var off = (i * size + j) * 4;
            let x = left + j * step;
            let y = top - i * step;
            var vx = parserX.getResult([{name: 'x', value: x}, {name: 'y', value: y}]);
            var vy = parserY.getResult([{name: 'x', value: x}, {name: 'y', value: y}]);
            var mod = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
            max = Math.max(max, mod);
            buf[off + 0] = vx / mod;
            buf[off + 1] = vy / mod;
            buf[off + 2] = mod;
        }    
    console.log("Compute field with parsed expressions took " + (Date.now() - start) + " ms");
    lastMessage = msg;
    (<any>self).postMessage(<Expr.IWorkerResponse>{type: "value", field: {buffer: buf.buffer, width: size, height: size, max: max}});
}