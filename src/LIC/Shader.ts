/// <reference path="../../typings/gl-matrix/gl-matrix.d.ts" />

import glMatrix = require("gl-matrix");

let vertexLIC = "\n\
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
"

let fragmentLIC = "\n\
#define N 20\n\
#define L 20.0\n\
precision highp float;\n\
varying vec2 vTextureFieldCoords;\n\
varying vec2 vTextureNoiseCoords;\n\
uniform sampler2D image;\n\
uniform sampler2D field;\n\
uniform float size;\n\
varying vec2 v_texCoord;\n\
vec2 pointi;\n\
vec2 noise_choord;\n\
vec2 pointf;\n\
vec2 vector;\n\
vec2 v;\n\
float len;\n\
float maxv;\n\
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
    maxv = vt.w;\n\
    return normalize(vt.xy);\n\
}\n\
float core(float arg)\n\
{\n\
    return exp(-pow(arg, 2.0) / (2.0 * L) ) / sqrt(2.0 * L * 3.1415926535);\n\
}\n\
float integrate(float start, float stop)\n\
{\n\
    float precize = 50.0;\n\
    float step    = (stop - start) / precize;\n\
    float result  = 0.0;\n\
    float k       = 0.0;\n\
    for(float i = 0.0; i < 50.0; i += 1.0) {\n\
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
}"

export abstract class ShaderProgram {
    protected program: WebGLProgram;

    constructor(protected gl: WebGLRenderingContext) {
        this.program = gl.createProgram();
    }

    protected attach(shader: Shader) {
        this.gl.attachShader(this.program, shader.shaderID);
    }

    protected detach(shader: Shader) {
        this.gl.detachShader(this.program, shader.shaderID);
    }

    protected link() {
        let gl = this.gl;
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.log("Program link error: " + gl.getProgramInfoLog(this.program));
            gl.deleteProgram(this.program);
        }
    }

    protected use() {
        this.gl.useProgram(this.program);
    }

    protected getUniLoc(name: string): WebGLUniformLocation {
        return this.gl.getUniformLocation(this.program, name);
    }

    public getAttribLoc(name: string): number {
        return this.gl.getAttribLocation(this.program, name);
    }
}

export class Shader {
    public shaderID: WebGLShader;
    constructor(private gl: WebGLRenderingContext, private type: number, private source: string) {
        this.loadShader();
    }

    private loadShader() {
        let gl = this.gl;
        this.shaderID = gl.createShader(this.type);
        gl.shaderSource(this.shaderID, this.source);
        gl.compileShader(this.shaderID);
        if (!gl.getShaderParameter(this.shaderID, gl.COMPILE_STATUS)) {
            console.log("Shader compilation error: " + gl.getShaderInfoLog(this.shaderID));
            gl.deleteShader(this.shaderID);
        }
    }
}

export class licShaderProgram extends ShaderProgram {
    private vertexShader: Shader;
    private fragmentShader: Shader;
    //uniforms
    private size_loc: WebGLUniformLocation;
    private model_loc: WebGLUniformLocation;
    private reverse_loc: WebGLUniformLocation;

    constructor(gl: WebGLRenderingContext) {
        super(gl);
        this.vertexShader = new Shader(gl, gl.VERTEX_SHADER, vertexLIC);
        this.fragmentShader = new Shader(gl, gl.FRAGMENT_SHADER, fragmentLIC);

        this.attach(this.vertexShader);
        this.attach(this.fragmentShader);
        this.link();
        this.use();
        this.size_loc = this.getUniLoc('size'); 
        this.model_loc = this.getUniLoc('model');
        this.reverse_loc = this.getUniLoc('reverse');
        
        this.size = 512;  
        gl.uniform1i(this.getUniLoc("image"), 0);
        gl.uniform1i(this.getUniLoc("field"), 1);
    }

    
    public get size() : number {
        return <number>this.gl.getUniform(this.program, this.size_loc);
    }    
    public set size(v : number) {
        this.gl.uniform1f(this.size_loc, v);
    }   
    
    public get model() : Float32Array  {
        return this.gl.getUniform(this.program, this.model_loc);
    }    
    public set model(v : Float32Array) {
        this.gl.uniformMatrix4fv(this.model_loc, false, v);
    }

    
    public get reverse() : Float32Array  {
        return this.gl.getUniform(this.program, this.reverse_loc);
    }    
    public set reverse(v : Float32Array) {
        this.gl.uniformMatrix4fv(this.reverse_loc, false, v);
    }  
}

export abstract class Drawable {
    constructor(protected gl: WebGLRenderingContext, protected shader: ShaderProgram) {}
    abstract Draw();
}

export class Square extends Drawable {
    private vertices = [        
        -1.0, -1.0, 0,
        -1.0,  1.0, 0,
         1.0,  1.0, 0,
         1.0, -1.0, 0,
    ]
    private indeces = [0, 1, 2, 2, 3, 0];
    private numElements: number;

    private fieldTexture: Texture;
    private noiseTexture: Texture;

    
    public get FieldTexture() : Texture {
        return this.fieldTexture;
    }    
    public set FieldTexture(v : Texture) {
        this.fieldTexture = v;
    }
    
    public get NoiseTexture() : Texture {
        return this.noiseTexture;
    }    
    public set NoiseTexture(v : Texture) {
        this.noiseTexture = v;
    }
    
    private vertexBuffer: WebGLBuffer;
    private indexBuffer: WebGLBuffer;

    private attribName = 'aVertexPosition';

    constructor(gl: WebGLRenderingContext, shader: ShaderProgram) {
        super(gl, shader);
        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        this.numElements = this.indeces.length;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indeces), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(shader.getAttribLoc(this.attribName));
    }

    Draw() {
        let gl = this.gl;
        let attribLocation = this.shader.getAttribLoc(this.attribName);
        this.FieldTexture.Bind();
        this.NoiseTexture.Bind();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(attribLocation, 3, gl.FLOAT, false, 0, 0);
        
        gl.drawElements(gl.TRIANGLES, this.numElements, gl.UNSIGNED_SHORT, 0);
    }
}

export class Texture {
    private texture: WebGLTexture;
    constructor(private gl: WebGLRenderingContext, private active = WebGLRenderingContext.TEXTURE0,
                private target = WebGLRenderingContext.TEXTURE_2D) {
        this.texture = this.gl.createTexture();
    }

    public Bind() {
        this.gl.activeTexture(this.active);
        this.gl.bindTexture(this.target, this.texture);
    }

    static createNoiseTexture(gl: WebGLRenderingContext, source: HTMLImageElement): Texture {
        let result = new Texture(gl);
        result.Bind();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        return result;
    }

    static createFieldTexture(gl: WebGLRenderingContext, arr: number[][][]): Texture {
        let numPixels = arr.length * arr[0].length;
        let width = arr[0].length;
        let height = arr.length;
        var size = numPixels * 4;
        var buf = new Float32Array(size);
        let max = 0;
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

        let result = new Texture(gl, gl.TEXTURE1);
        result.Bind();

        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
            gl.RGBA, gl.FLOAT, buf);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        return result;
    }    
}

export class Camera {

}