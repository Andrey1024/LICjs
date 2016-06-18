/// <reference path="../../typings/requirejs/require.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/gl-matrix/gl-matrix.d.ts" />

import glMatrix = require("gl-matrix");
import $ = require('jquery');
import * as glCore from './Shader';
import * as Helpers from './glHelpers';
import {Expression} from '../ExpressionParser/Expression';

export class JSLIC {
    private gl: WebGLRenderingContext;
    private shader: glCore.licShaderProgram;
    private square: glCore.Drawable;
    private model: Float32Array;
    private reverse: Float32Array;
    private size = 512;

    private animation: boolean = false;

    private noise: glCore.Texture;
    private field: glCore.Texture;

    private scaleVal = 1;
    private transX = 0;
    private transY = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.gl = Helpers.createContext(canvas);
        this.size = canvas.width;
        Helpers.loadExtenstion(this.gl, 'OES_texture_float');
        Helpers.loadExtenstion(this.gl, 'OES_texture_float_linear');
        this.shader = new glCore.licShaderProgram(this.gl);
        this.square = new glCore.Square(this.gl, this.shader);
        this.model = glMatrix.mat4.create();
        this.reverse = glMatrix.mat4.create();
        glMatrix.mat4.identity(this.model);
        glMatrix.mat4.identity(this.reverse);
    }

    public scale(i: number) {
        i /= 20;
        this.scaleVal += i;
        this.createModelMat();
    }

    public moveX(i: number) {
        i /= this.size / 2;
        this.transX += i;
        this.createModelMat();
    }

    public moveY(i: number) {
        i /= this.size / 2;
        this.transY += i;
        this.createModelMat();
    }

    private createModelMat() {
        let ident = glMatrix.quat.create();
        glMatrix.quat.identity(ident);
        let scale = glMatrix.vec3.fromValues(this.scaleVal, this.scaleVal, 0);
        let trans = glMatrix.vec3.fromValues(this.transX, this.transY, 0);
        glMatrix.mat4.fromRotationTranslationScale(this.model, ident, trans, scale);
    }

    private loadNoise(src?: string): JQueryPromise<glCore.Texture> {
        let ret = $.Deferred();
        let image = new Image();
        image.onload = () => {
            let res = glCore.Texture.createNoiseTexture(this.gl, image);
            ret.resolve(res);
        }
        image.src = src ? src : 'assets/noise.png';
        return ret.promise();
    }
    
    private loadField(parsers?: Expression[]): JQueryPromise<glCore.Texture> {
        let ret = $.Deferred();
        setTimeout(() => {
            let width = 1024;
            let height = 1024;
            let arr: number[][][] = new Array(height);

            let start = Date.now();
            for (var i = 0; i < height; i++) {
                arr[i] = new Array(width);
                for (var j = 0; j < width; j++) {
                    var x = (j - 512) / 100;
                    var y = (512 - i) / 100;
                    var t = parsers;
                    var vx = parsers ? parsers[0].getResult([{name: 'x', value: x}, {name: 'y', value: y}]) : Math.pow(y, 2);
                    var vy = parsers ? parsers[1].getResult([{name: 'x', value: x}, {name: 'y', value: y}]) : -x;
                    arr[i][j] = [vx, vy];
                }
            }
            console.log("Compute filed with " + (parsers ? "parsed" : "hardcoded") + " expressions took " + (Date.now() - start) + " ms");
            let res = glCore.Texture.createFieldTexture(this.gl, arr);
            ret.resolve(res);
        });

        return ret.promise();
    }

    public loadNoiseTexture(src?: string): JQueryPromise<{}> {
        let ret = $.Deferred();
        let that = this;
        $.when(this.loadNoise(src)).done((v) => {
            (<glCore.Square>that.square).NoiseTexture = v;
            ret.resolve();
        })

        return ret.promise();
    }

    public loadFieldTexture(parsers?: Expression[]): JQueryPromise<{}> {        
        let ret = $.Deferred();
        let that = this;
        $.when(this.loadField(parsers)).done((v) => {
            (<glCore.Square>that.square).FieldTexture = v;
            ret.resolve();
        })
        return ret.promise();
    }

    public startAnimation() {
        this.animation = true;
        this.render();
    }

    public stopAnimation() {
        this.animation = false;
    }

    public render() {
        this.shader.size = this.size;
        this.shader.model = this.model;
        //this.shader.reverse = this.reverse;
        this.square.Draw();
        if (this.animation) requestAnimationFrame(() => { this.render();});
    }
}