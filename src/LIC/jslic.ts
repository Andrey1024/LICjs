/// <reference path="../../typings/requirejs/require.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />

import $ = require('jquery');
import * as glCore from './Shader';
import * as Helpers from './glHelpers';
import {Expression} from '../ExpressionParser/Expression';

export class JSLIC {
    private gl: WebGLRenderingContext;
    private shader: glCore.licShaderProgram;
    private drawables: glCore.Drawable[] = [];

    private noise: glCore.Texture;
    private parsers: Expression[];

    constructor(canvas: HTMLCanvasElement) {
        this.gl = Helpers.createContext(canvas);
        Helpers.loadExtenstion(this.gl, 'OES_texture_float');
        Helpers.loadExtenstion(this.gl, 'OES_texture_float_linear');
        this.shader = new glCore.licShaderProgram(this.gl);
    }

    private loadNoise(): JQueryPromise<glCore.Texture> {
        let ret = $.Deferred();
        let image = new Image();
        image.onload = () => {
            let res = glCore.Texture.createNoiseTexture(this.gl, image);
            ret.resolve(res);
        }
        image.src = 'assets/noise.jpg';
        return ret.promise();
    }

    public render (parsers: Expression[]): JQueryPromise<{}> {
        let ret = $.Deferred();
        this.parsers = parsers;
        $.when(this.loadField()).done((v) => {
            ret.resolve();
            (<glCore.Square>this.drawables[0]).FieldTexture = v;
            this.drawables.forEach((val) => {
                val.Draw();
            });

        });
        return ret.promise();
    }
    
    private loadField(): JQueryPromise<glCore.Texture> {
        let ret = $.Deferred();
        setTimeout(() => {
            let width = 512;
            let height = 512;
            let arr: number[][][] = new Array(height);

            for (var i = 0; i < height; i++) {
                arr[i] = new Array(width);
                for (var j = 0; j < width; j++) {
                    var x = (j - 256.5) / 100;
                    var y = (256.5 - i) / 100;
                    var t = this.parsers;
                    var vx = this.parsers ? this.parsers[0].getResult([{name: 'x', value: x}, {name: 'y', value: y}]) : Math.pow(y, 2);
                    var vy = this.parsers ? this.parsers[1].getResult([{name: 'x', value: x}, {name: 'y', value: y}]) : -x;
                    arr[i][j] = [vx, vy];
                }
            }
            let res = glCore.Texture.createFieldTexture(this.gl, arr);
            ret.resolve(res);
        });

        return ret.promise();
    }

    public loadTextures(): JQueryPromise<{}> {
        let ret = $.Deferred();
        let that = this;
        $.when(this.loadNoise(), this.loadField()).done((v1, v2) => {
            let square = new glCore.Square(this.gl, this.shader);
            square.FieldTexture = v2;
            square.NoiseTexture = v1;
            that.drawables.push(square);
            ret.resolve();
        })

        return ret.promise();
    }
}