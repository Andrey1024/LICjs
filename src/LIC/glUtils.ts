let vertexLIC = "\
attribute vec3 aVertexPosition;\
varying vec2 vTextureCoords;\
void main(void) {\
    gl_Position = vec4(aVertexPosition, 1.0);\
    vTextureCoords = aVertexPosition.xy * 0.5 + 0.5;\
}"

let fragmentLIC = "\
#define N 20\
#define L 20.0\
precision highp float;\
varying vec2 vTextureCoords;\
uniform sampler2D image;\
uniform sampler2D field;\
uniform float size;\
varying vec2 v_texCoord;\
vec2 pointi;\
vec2 pointf;\
vec2 vector;\
vec2 v;\
float len;\
float maxv;\
const float eps = 0.000001;\
\
float top_distance()\
{\
    if (abs(vector.y) < eps) {\
        return 2.0;\
    }\
    return (pointi.y + 1.0 - pointf.y) / vector.y;\
}\
float bottom_distance()\
{\
    if (abs(vector.y) < eps) {\
        return 2.0;\
    }\
    return (pointi.y - pointf.y) / vector.y;\
}\
float left_distance()\
{\
    if (abs(vector.x) < eps) {\
        return 2.0;\
    }\
    return (pointi.x - pointf.x) / vector.x;\
}\
float right_distance()\
{\
    if (abs(vector.y) < eps) {\
        return 2.0;\
    }\
    return (pointi.x + 1.0 - pointf.x) / vector.x;\
}\
float get_distance()\
{\
    float top    = max(top_distance()   , 0.0);\
    float bottom = max(bottom_distance(), 0.0);\
    float left   = max(left_distance()  , 0.0);\
    float right  = max(right_distance() , 0.0);\
    \
    float minimum = 2.0;\
    if (top    > eps) minimum = min(top   , minimum);\
    if (bottom > eps) minimum = min(bottom, minimum);\
    if (left   > eps) minimum = min(left  , minimum);\
    if (right  > eps) minimum = min(right , minimum);\
    \
    if (minimum  < eps   ) return 0.0;\
    if (minimum == 2.0   ) return 0.0;\
    pointf += vector * minimum;\
    if (minimum == top   ) pointi.y += 1.0;\
    if (minimum == bottom) pointi.y -+ 1.0;\
    if (minimum == left  ) pointi.x -= 1.0;\
    if (minimum == right ) pointi.x += 1.0;\
    return minimum;\
}\
vec2 get_vector(vec2 p)\
{\
    vec4 vt = texture2D(field, p / size);\
    len = vt.z;\
    maxv = vt.w;\
    return normalize(vt.xy);\
}\
float core(float arg)\
{\
    return exp(-pow(arg, 2.0) / (2.0 * L) ) / sqrt(2.0 * L * 3.1415926535);\
}\
float integrate(float start, float stop)\
{\
    float precize = 50.0;\
    float step    = (stop - start) / precize;\
    float result  = 0.0;\
    float k       = 0.0;\
    for(float i = 0.0; i < 50.0; i += 1.0) {\
        result += core(start + step * i);\
    }\
    return result;\
}\
void main()\
{\
    float dist = 0.0, norm = 0.0;\
    vec4 result = vec4(0.0);\
    pointi = floor(vTextureCoords * size);\
    pointf = pointi + vec2(0.5, 0.5);\
    vector = get_vector(pointi);\
    //positive stream line\
    for(int i = 0; i < N; i++) {\
        vec4 tmp  = texture2D(image, pointi / size);\
        float mod = get_distance();\
        if (mod < eps) break;\
        float t   = integrate(dist, dist + mod);\
        dist     += mod;\
        norm     += t;\
        result   += tmp * t;\
        vector    = get_vector(pointi);\
    }\
    //negative stream line\
    dist   = 0.0;\
    pointi = floor(vTextureCoords * size);\
    pointf = pointi + vec2(0.5, 0.5);\
    vector = -get_vector(pointi);\
    for(int i = 0; i < N; i++) {\
        vec4 tmp  = texture2D(image, pointi / size);\
        float mod = get_distance();\
        if (mod < eps) break;\
        float t   = integrate(-dist, -dist - mod);\
        dist     += mod;\
        norm     += t;\
        result   += tmp * t;\
        vector    = -get_vector(pointi);\
    }\
\
    result /= norm;\
    pointi = floor(vTextureCoords * size);\
    vector = get_vector(pointi);\
    vec4 clr = mix(vec4(0.0, 0.0, 1.0, 1.0), vec4(1.0, 0.5, 0.0, 1.0), len / maxv);\
    gl_FragColor = result * clr;\
}"


abstract class webgl {
    protected gl: WebGLRenderingContext;

    protected loadExtension(ext: string) {        
        var extenstion = this.gl.getExtension(ext);
        if (!extenstion)
            console.log("float texture not work");
    }

    constructor(canvas: HTMLCanvasElement) {            
        this.gl = canvas.getContext("experimental-webgl");
        if (!this.gl) {
            console.log("Your browser doesn't support WebGL");
        }
    }
}

export class webglLIC extends webgl {
    program: licShader;
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.loadExtension('OES_texture_float');
        this.loadExtension('OES_texture_float_linear');
        this.program = new licShader(this.gl);
        
    }
}

abstract class webglShader {
    protected program: WebGLProgram;
    protected vertex: WebGLShader;
    protected fragment: WebGLShader;

    constructor(protected gl: WebGLRenderingContext, vertex: string, fragment: string) {
        this.vertex = this.compileShader(gl.VERTEX_SHADER, vertex);
        this.fragment = this.compileShader(gl.FRAGMENT_SHADER, fragment);

        this.program = gl.createProgram();

        gl.attachShader(this.program, this.vertex);
        gl.attachShader(this.program, this.fragment);

        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.log("Program link error: " + gl.getProgramInfoLog(this.program));
            gl.deleteProgram(this.program);
            return ;
        }

        gl.useProgram(this.program);
    }

    private compileShader(type: number, source: string): WebGLShader {
        let gl = this.gl;
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log("Shader compilation error: " + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
}

class licShader extends webglShader {
    private size: WebGLUniformLocation;

    public set Size(size: number) {
        this.gl.uniform1f(this.size, size); 
    }

    public get Size(): number {
        return this.gl.getUniform(this.program, this.size);
    }

    constructor(gl: WebGLRenderingContext) {
        super(gl, vertexLIC, fragmentLIC);
        this.size = gl.getUniformLocation(this.program, 'size');
    }
    
}

class webglTexture {
    private texture: WebGLTexture;
    constructor(private gl: WebGLRenderingContext, private active = WebGLRenderingContext.TEXTURE0,
                private target = WebGLRenderingContext.TEXTURE_2D) {
        this.texture = this.gl.createTexture();
    }

    public Bind() {
        this.gl.activeTexture(this.active);
        this.gl.bindTexture(this.target, this.texture);
    }

    static createFieldTexture(gl: WebGLRenderingContext, arr: number[][][]): webglTexture {
        let numPixels = arr.length * arr[0].length;
        let width = arr[0].length;
        let height = arr.length;
        var size = numPixels * 4;
        var buf = new Float32Array(size);
        
        for (var i = 0; i < height; i++)
            for (var j = 0; j < width; j++) {
                var off = (i * width + j) * 4;
                var vx = arr[i][j][0];
                var vy = arr[i][j][1];
                var mod = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
                buf[off + 0] = vx / mod;
                buf[off + 1] = vy / mod;
                buf[off + 2] = mod;
                buf[off + 3] = 3 * Math.sqrt(2);
            }

        let result = new webglTexture(gl, gl.TEXTURE1);
        result.Bind();

        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
            gl.RGBA, gl.FLOAT, buf);

        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        return result;
    }

    
}