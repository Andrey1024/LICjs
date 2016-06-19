/// <reference path="../../typings/requirejs/require.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/gl-matrix/gl-matrix.d.ts" />

import glMatrix = require("gl-matrix");
import $ = require('jquery');
import * as glCore from './Shader';
import * as Helpers from './glHelpers';
import {Expression, IField} from '../ExpressionParser/Expression';

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

    public restore() {
        this.scaleVal = 1;
        this.transX = this.transY = 0;
        this.createModelMat();
    }

    public scale(i: number) {
        i /= 20;
        if ((this.scaleVal += i) < 1) {
            this.scaleVal -= i;
            return;
        }        
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
    
    private loadField(field: IField): JQueryPromise<glCore.Texture> {
        let ret = $.Deferred();
        setTimeout(() => {
            let res = glCore.Texture.fromArray(this.gl, new Float32Array(field.buffer), field.width, field.height);
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

    public loadFieldTexture(field: IField): JQueryPromise<{}> {        
        let ret = $.Deferred();
        let that = this;
        $.when(this.loadField(field)).done((v) => {
            (<glCore.Square>that.square).FieldTexture = v;
            this.shader.max = field.max ? field.max : 1;
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
        this.shader.model = this.model;
        this.shader.size = Math.floor(this.size * this.scaleVal);
        //this.shader.reverse = this.reverse;
        this.square.Draw();
        if (this.animation) requestAnimationFrame(() => { this.render();});
    }
}