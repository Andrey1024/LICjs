define(["require", "exports", "gl-matrix", 'jquery', './Shader', './glHelpers'], function (require, exports, glMatrix, $, glCore, Helpers) {
    "use strict";
    var JSLIC = (function () {
        function JSLIC(canvas) {
            this.size = 512;
            this.animation = false;
            this.scaleVal = 1;
            this.transX = 0;
            this.transY = 0;
            this.gl = Helpers.createContext(canvas);
            this.size = canvas.width;
            Helpers.loadExtenstion(this.gl, 'OES_texture_float');
            Helpers.loadExtenstion(this.gl, 'OES_half_float_linear ');
            Helpers.loadExtenstion(this.gl, 'OES_texture_float_linear');
            this.shader = new glCore.licShaderProgram(this.gl);
            this.square = new glCore.Square(this.gl, this.shader);
            this.model = glMatrix.mat4.create();
            this.reverse = glMatrix.mat4.create();
            glMatrix.mat4.identity(this.model);
            glMatrix.mat4.identity(this.reverse);
        }
        JSLIC.prototype.restore = function () {
            this.scaleVal = 1;
            this.transX = this.transY = 0;
            this.createModelMat();
        };
        JSLIC.prototype.scale = function (i) {
            i /= 20;
            if ((this.scaleVal += i) < 1) {
                this.scaleVal -= i;
                return;
            }
            this.createModelMat();
        };
        JSLIC.prototype.moveX = function (i) {
            i /= this.size / 2;
            this.transX += i;
            this.createModelMat();
        };
        JSLIC.prototype.moveY = function (i) {
            i /= this.size / 2;
            this.transY += i;
            this.createModelMat();
        };
        JSLIC.prototype.createModelMat = function () {
            var ident = glMatrix.quat.create();
            glMatrix.quat.identity(ident);
            var scale = glMatrix.vec3.fromValues(this.scaleVal, this.scaleVal, 0);
            var trans = glMatrix.vec3.fromValues(this.transX, this.transY, 0);
            glMatrix.mat4.fromRotationTranslationScale(this.model, ident, trans, scale);
        };
        JSLIC.prototype.loadNoise = function (src) {
            var _this = this;
            var ret = $.Deferred();
            var image = new Image();
            image.onload = function () {
                var res = glCore.Texture.createNoiseTexture(_this.gl, image);
                ret.resolve(res);
            };
            image.src = src ? src : 'assets/noise.png';
            return ret.promise();
        };
        JSLIC.prototype.loadField = function (field) {
            var _this = this;
            var ret = $.Deferred();
            setTimeout(function () {
                var res = glCore.Texture.fromArray(_this.gl, new Float32Array(field.buffer), field.width, field.height);
                ret.resolve(res);
            });
            return ret.promise();
        };
        JSLIC.prototype.loadNoiseTexture = function (src) {
            var ret = $.Deferred();
            var that = this;
            $.when(this.loadNoise(src)).done(function (v) {
                that.square.NoiseTexture = v;
                ret.resolve();
            });
            return ret.promise();
        };
        JSLIC.prototype.loadFieldTexture = function (field) {
            var _this = this;
            var ret = $.Deferred();
            var that = this;
            $.when(this.loadField(field)).done(function (v) {
                that.square.FieldTexture = v;
                _this.shader.max = field.max ? field.max : 1;
                ret.resolve();
            });
            return ret.promise();
        };
        JSLIC.prototype.startAnimation = function () {
            this.animation = true;
            this.render();
        };
        JSLIC.prototype.stopAnimation = function () {
            this.animation = false;
        };
        JSLIC.prototype.render = function () {
            var _this = this;
            this.shader.model = this.model;
            this.shader.size = Math.floor(this.size * this.scaleVal);
            this.square.Draw();
            if (this.animation)
                requestAnimationFrame(function () { _this.render(); });
        };
        return JSLIC;
    }());
    exports.JSLIC = JSLIC;
});
