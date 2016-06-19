var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    var vertexLIC = "\
attribute vec3 aVertexPosition;\n\
varying vec2 vTextureFieldCoords;\n\
varying vec2 vTextureNoiseCoords;\n\
uniform mat4 model;\n\
uniform mat4 reverse;\n\
\n\
void main(void) {\n\
    gl_Position = model * vec4(aVertexPosition, 1.0);\n\
    vTextureFieldCoords = aVertexPosition.xy * 0.5 + 0.5;\n\
    vTextureNoiseCoords = aVertexPosition.xy * 0.5 + 0.5;\n\
}\n\
";
    var fragmentLIC = "\
#define N 15\n\
#define L 15.0\n\
precision highp float;\n\
varying vec2 vTextureFieldCoords;\n\
varying vec2 vTextureNoiseCoords;\n\
uniform sampler2D image;\n\
uniform sampler2D field;\n\
uniform float size;\n\
uniform float maxv;\n\
varying vec2 v_texCoord;\n\
vec2 pointi;\n\
vec2 noise_choord;\n\
vec2 pointf;\n\
vec2 vector;\n\
vec2 v;\n\
float len;\n\
const float eps = 0.000001;\n\
\n\
float top_distance()\n\
{\n\
    if (abs(vector.y) < eps) {\n\
        return 2.0;\n\
    }\n\
    return (pointi.y + 1.0 - pointf.y) / vector.y;\n\
}\n\
float bottom_distance()\n\
{\n\
    if (abs(vector.y) < eps) {\n\
        return 2.0;\n\
    }\n\
    return (pointi.y - pointf.y) / vector.y;\n\
}\n\
float left_distance()\n\
{\n\
    if (abs(vector.x) < eps) {\n\
        return 2.0;\n\
    }\n\
    return (pointi.x - pointf.x) / vector.x;\n\
}\n\
float right_distance()\n\
{\n\
    if (abs(vector.y) < eps) {\n\
        return 2.0;\n\
    }\n\
    return (pointi.x + 1.0 - pointf.x) / vector.x;\n\
}\n\
float get_distance()\n\
{\n\
    float top    = max(top_distance()   , 0.0);\n\
    float bottom = max(bottom_distance(), 0.0);\n\
    float left   = max(left_distance()  , 0.0);\n\
    float right  = max(right_distance() , 0.0);\n\
\n\
    float minimum = 2.0;\n\
    if (top    > eps) minimum = min(top   , minimum);\n\
    if (bottom > eps) minimum = min(bottom, minimum);\n\
    if (left   > eps) minimum = min(left  , minimum);\n\
    if (right  > eps) minimum = min(right , minimum);\n\
\n\
    if (minimum  < eps   ) return 0.0;\n\
    if (minimum == 2.0   ) return 0.0;\n\
    pointf += vector * minimum;\n\
    if (minimum == top   ) pointi.y += 1.0, noise_choord.y += 1.0;\n\
    if (minimum == bottom) pointi.y -= 1.0, noise_choord.y -= 1.0;\n\
    if (minimum == left  ) pointi.x -= 1.0, noise_choord.x -= 1.0;\n\
    if (minimum == right ) pointi.x += 1.0, noise_choord.x += 1.0;\n\
    return minimum;\n\
}\n\
vec2 get_vector(vec2 p)\n\
{\n\
    vec4 vt = texture2D(field, p / size);\n\
    len = vt.z;\n\
    return normalize(vt.xy);\n\
}\n\
float core(float arg)\n\
{\n\
    return exp(-pow(arg, 2.0) / (2.0 * L) ) / sqrt(2.0 * L * 3.1415926535);\n\
}\n\
float integrate(float start, float stop)\n\
{\n\
    float precize = 5.0;\n\
    float step    = (stop - start) / precize;\n\
    float result  = 0.0;\n\
    float k       = 0.0;\n\
    for(float i = 0.0; i < 5.0; i += 1.0) {\n\
        result += core(start + step * i);\n\
    }\n\
    return result;\n\
}\n\
void main()\n\
{\n\
    float dist = 0.0, norm = 0.0;\n\
    vec4 result = vec4(0.0);\n\
    pointi = floor(vTextureFieldCoords * size);\n\
    noise_choord = floor(vTextureNoiseCoords * size);\n\
    pointf = pointi + vec2(0.5, 0.5);\n\
    vector = get_vector(pointi);\n\
    //positive stream line\n\
    for(int i = 0; i < N; i++) {\n\
        vec4 tmp  = texture2D(image, noise_choord / size);\n\
        float mod = get_distance();\n\
        if (mod < eps) break;\n\
        float t   = integrate(dist, dist + mod);\n\
        dist     += mod;\n\
        norm     += t;\n\
        result   += tmp * t;\n\
        vector    = get_vector(pointi);\n\
    }\n\
    //negative stream line\n\
    dist   = 0.0;\n\
    pointi = floor(vTextureFieldCoords * size);\n\
    noise_choord = floor(vTextureNoiseCoords * size);\n\
    pointf = pointi + vec2(0.5, 0.5);\n\
    vector = -get_vector(pointi);\n\
    for(int i = 0; i < N; i++) {\n\
        vec4 tmp  = texture2D(image, noise_choord / size);\n\
        float mod = get_distance();\n\
        if (mod < eps) break;\n\
        float t   = integrate(-dist, -dist - mod);\n\
        dist     += mod;\n\
        norm     += t;\n\
        result   += tmp * t;\n\
        vector    = -get_vector(pointi);\n\
    }\n\
\n\
    result /= norm;\n\
    vec4 clr = mix(vec4(0.0, 0.0, 1.0, 1.0), vec4(1.0, 0.5, 0.0, 1.0), len / maxv);\n\
    gl_FragColor = result * clr;\n\
}";
    var ShaderProgram = (function () {
        function ShaderProgram(gl) {
            this.gl = gl;
            this.program = gl.createProgram();
        }
        ShaderProgram.prototype.attach = function (shader) {
            this.gl.attachShader(this.program, shader.shaderID);
        };
        ShaderProgram.prototype.detach = function (shader) {
            this.gl.detachShader(this.program, shader.shaderID);
        };
        ShaderProgram.prototype.link = function () {
            var gl = this.gl;
            gl.linkProgram(this.program);
            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
                console.log("Program link error: " + gl.getProgramInfoLog(this.program));
                gl.deleteProgram(this.program);
            }
        };
        ShaderProgram.prototype.use = function () {
            this.gl.useProgram(this.program);
        };
        ShaderProgram.prototype.getUniLoc = function (name) {
            return this.gl.getUniformLocation(this.program, name);
        };
        ShaderProgram.prototype.getAttribLoc = function (name) {
            return this.gl.getAttribLocation(this.program, name);
        };
        return ShaderProgram;
    }());
    exports.ShaderProgram = ShaderProgram;
    var Shader = (function () {
        function Shader(gl, type, source) {
            this.gl = gl;
            this.type = type;
            this.source = source;
            this.loadShader();
        }
        Shader.prototype.loadShader = function () {
            var gl = this.gl;
            this.shaderID = gl.createShader(this.type);
            gl.shaderSource(this.shaderID, this.source);
            gl.compileShader(this.shaderID);
            if (!gl.getShaderParameter(this.shaderID, gl.COMPILE_STATUS)) {
                console.log("Shader compilation error: " + gl.getShaderInfoLog(this.shaderID));
                gl.deleteShader(this.shaderID);
            }
        };
        return Shader;
    }());
    exports.Shader = Shader;
    var licShaderProgram = (function (_super) {
        __extends(licShaderProgram, _super);
        function licShaderProgram(gl) {
            _super.call(this, gl);
            this.vertexShader = new Shader(gl, gl.VERTEX_SHADER, vertexLIC);
            this.fragmentShader = new Shader(gl, gl.FRAGMENT_SHADER, fragmentLIC);
            this.attach(this.vertexShader);
            this.attach(this.fragmentShader);
            this.link();
            this.use();
            this.size_loc = this.getUniLoc('size');
            this.model_loc = this.getUniLoc('model');
            this.reverse_loc = this.getUniLoc('reverse');
            this.max_loc = this.getUniLoc('maxv');
            this.size = 512;
            gl.uniform1i(this.getUniLoc("image"), 0);
            gl.uniform1i(this.getUniLoc("field"), 1);
        }
        Object.defineProperty(licShaderProgram.prototype, "size", {
            get: function () {
                return this.gl.getUniform(this.program, this.size_loc);
            },
            set: function (v) {
                this.gl.uniform1f(this.size_loc, v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(licShaderProgram.prototype, "max", {
            get: function () {
                return this.gl.getUniform(this.program, this.max_loc);
            },
            set: function (v) {
                this.gl.uniform1f(this.max_loc, v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(licShaderProgram.prototype, "model", {
            get: function () {
                return this.gl.getUniform(this.program, this.model_loc);
            },
            set: function (v) {
                this.gl.uniformMatrix4fv(this.model_loc, false, v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(licShaderProgram.prototype, "reverse", {
            get: function () {
                return this.gl.getUniform(this.program, this.reverse_loc);
            },
            set: function (v) {
                this.gl.uniformMatrix4fv(this.reverse_loc, false, v);
            },
            enumerable: true,
            configurable: true
        });
        return licShaderProgram;
    }(ShaderProgram));
    exports.licShaderProgram = licShaderProgram;
    var Drawable = (function () {
        function Drawable(gl, shader) {
            this.gl = gl;
            this.shader = shader;
        }
        return Drawable;
    }());
    exports.Drawable = Drawable;
    var Square = (function (_super) {
        __extends(Square, _super);
        function Square(gl, shader) {
            _super.call(this, gl, shader);
            this.vertices = [
                -1.0, -1.0, 0,
                -1.0, 1.0, 0,
                1.0, 1.0, 0,
                1.0, -1.0, 0,
            ];
            this.indeces = [0, 1, 2, 2, 3, 0];
            this.attribName = 'aVertexPosition';
            this.vertexBuffer = gl.createBuffer();
            this.indexBuffer = gl.createBuffer();
            this.numElements = this.indeces.length;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indeces), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(shader.getAttribLoc(this.attribName));
        }
        Object.defineProperty(Square.prototype, "FieldTexture", {
            get: function () {
                return this.fieldTexture;
            },
            set: function (v) {
                this.fieldTexture = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Square.prototype, "NoiseTexture", {
            get: function () {
                return this.noiseTexture;
            },
            set: function (v) {
                this.noiseTexture = v;
            },
            enumerable: true,
            configurable: true
        });
        Square.prototype.Draw = function () {
            var gl = this.gl;
            var attribLocation = this.shader.getAttribLoc(this.attribName);
            this.FieldTexture.Bind();
            this.NoiseTexture.Bind();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.vertexAttribPointer(attribLocation, 3, gl.FLOAT, false, 0, 0);
            gl.drawElements(gl.TRIANGLES, this.numElements, gl.UNSIGNED_SHORT, 0);
        };
        return Square;
    }(Drawable));
    exports.Square = Square;
    var Texture = (function () {
        function Texture(gl, active, target) {
            if (active === void 0) { active = WebGLRenderingContext.TEXTURE0; }
            if (target === void 0) { target = WebGLRenderingContext.TEXTURE_2D; }
            this.gl = gl;
            this.active = active;
            this.target = target;
            this.texture = this.gl.createTexture();
        }
        Texture.prototype.Bind = function () {
            this.gl.activeTexture(this.active);
            this.gl.bindTexture(this.target, this.texture);
        };
        Texture.createNoiseTexture = function (gl, source) {
            var result = new Texture(gl);
            result.Bind();
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            return result;
        };
        Texture.fromArray = function (gl, arr, width, height) {
            var result = new Texture(gl, gl.TEXTURE1);
            result.Bind();
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, arr);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            return result;
        };
        Texture.createFieldTexture = function (gl, arr) {
            var numPixels = arr.length * arr[0].length;
            var width = arr[0].length;
            var height = arr.length;
            var size = numPixels * 4;
            var buf = new Float32Array(size);
            var max = 0;
            for (var i = 0; i < height; i++)
                for (var j = 0; j < width; j++) {
                    var off = (i * width + j) * 4;
                    var vx = arr[i][j][0];
                    var vy = arr[i][j][1];
                    var mod = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
                    max = Math.max(max, mod);
                    buf[off + 0] = vx / mod;
                    buf[off + 1] = vy / mod;
                    buf[off + 2] = mod;
                    buf[off + 3] = max;
                }
            var result = new Texture(gl, gl.TEXTURE1);
            result.Bind();
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, buf);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            return result;
        };
        return Texture;
    }());
    exports.Texture = Texture;
    var Camera = (function () {
        function Camera() {
        }
        return Camera;
    }());
    exports.Camera = Camera;
});
