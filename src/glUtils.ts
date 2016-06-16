
export class glUtils {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private vertex: WebGLShader;
    private fragment: WebGLShader;
    private uniforms = {};

    public createContext(canvas: HTMLCanvasElement) {            
        let gl = canvas.getContext("experimental-webgl");
        if (!gl) {
            alert("Your browser doesn't support WebGL");
        }
        this.gl = gl;
    }

    public shaderProgram(vertex: string, fragment: string) {
        let gl = this.gl;
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

    public addUniform(name) {
        this.uniforms[name] = this.gl.getAttribLocation(this.program, name);
    }
}