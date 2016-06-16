/// <reference path="../../typings/requirejs/require.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="./glUtils.ts" />

import * as GL from './glUtils';

export class JSLIC {
    gl: GL.webglLIC;

    constructor(canvas: HTMLCanvasElement) {
        this.gl = new GL.webglLIC(canvas);

        let width = 512;
        let height = 512;
        let arr = new Array(height);
        for (var i = 0; i < height; i++) {
            arr.push(new Array(width));
            for (var j = 0; j < width; j++) {
                var x = (j - 256.5) / 100;
                var y = (256.5 - i) / 100;
                var vx = Math.pow(y, 2);
                var vy = -x;
                arr[i][j] = [vx, vy];
            }
        }
        
    }
}