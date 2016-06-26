export function createContext(canvas: HTMLCanvasElement) {    
    let gl = <WebGLRenderingContext>canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
        console.log("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }
    
    gl.clearColor(0.9647058823529412, 0.9647058823529412, 0.9647058823529412, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);
    return gl;
}

export function loadExtenstion(gl: WebGLRenderingContext, ext: string) {    
    var extension = gl.getExtension(ext);
    if (extension === null)
        console.log(ext+ " are not supported");
}