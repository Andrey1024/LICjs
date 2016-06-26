define(["require","exports","gl-matrix","jquery","./Shader","./glHelpers"],function(a,b,c,d,e,f){"use strict";var g=function(){function a(a){this.size=512,this.animation=!1,this.scaleVal=1,this.transX=0,this.transY=0,this.averageTime=0,this.renderCount=0,this.gl=f.createContext(a),this.size=a.width,f.loadExtenstion(this.gl,"OES_texture_float"),f.loadExtenstion(this.gl,"OES_texture_float_linear"),this.shader=new e.licShaderProgram(this.gl),this.square=new e.Square(this.gl,this.shader),this.model=c.mat4.create(),this.projection=c.mat4.create(),this.view=c.mat4.create(),this.MVP=c.mat4.create(),c.mat4.identity(this.MVP),c.mat4.identity(this.model),c.mat4.identity(this.view),c.mat4.ortho(this.projection,-1,1,-1,1,-1,1)}return Object.defineProperty(a.prototype,"AverageRenderTime",{get:function(){return this.averageTime/this.renderCount},enumerable:!0,configurable:!0}),a.prototype.restore=function(){this.scaleVal=1,this.transX=this.transY=0,this.createModelMat()},a.prototype.scale=function(a){return a/=20,(this.scaleVal-=a)<0||this.scaleVal>1?void(this.scaleVal+=a):void this.createModelMat()},a.prototype.moveX=function(a){a/=this.size/2,this.transX-=a*this.scaleVal,this.createModelMat()},a.prototype.moveY=function(a){a/=this.size/2,this.transY-=a*this.scaleVal,this.createModelMat()},a.prototype.createModelMat=function(){var a=c.quat.identity(c.quat.create()),b=c.vec3.fromValues(this.scaleVal,this.scaleVal,1),d=c.vec3.fromValues(this.transX,this.transY,0);this.view=c.mat4.invert(this.view,c.mat4.fromRotationTranslationScale(this.view,a,d,b)),c.mat4.multiply(this.MVP,this.model,this.view),c.mat4.multiply(this.MVP,this.MVP,this.projection)},a.prototype.loadNoise=function(a){var b=this,c=d.Deferred(),f=new Image;return f.onload=function(){var a=e.Texture.fromImage(b.gl,f);c.resolve(a)},f.src=a?a:"assets/noise.png",c.promise()},a.prototype.loadField=function(a){var b=this,c=d.Deferred();return setTimeout(function(){var d=e.Texture.fromArray(b.gl,new Float32Array(a.buffer),a.width,a.height);c.resolve(d)}),c.promise()},a.prototype.loadNoiseTexture=function(a){var b=d.Deferred(),c=this;return d.when(this.loadNoise(a)).done(function(a){c.square.NoiseTexture=a,b.resolve()}),b.promise()},a.prototype.loadFieldTexture=function(a){var b=this,c=d.Deferred(),e=this;return d.when(this.loadField(a)).done(function(d){e.square.FieldTexture=d,b.shader.max=a.max?a.max:1,c.resolve()}),c.promise()},a.prototype.startAnimation=function(){this.animation=!0,this.render()},a.prototype.stopAnimation=function(){this.animation=!1},a.prototype.render=function(){var a=this,b=performance.now();this.shader.model=this.MVP,this.shader.size=Math.floor(this.size/this.scaleVal),this.square.Draw(),this.animation&&requestAnimationFrame(function(){a.render()}),this.averageTime+=performance.now()-b,this.renderCount++},a}();b.JSLIC=g});