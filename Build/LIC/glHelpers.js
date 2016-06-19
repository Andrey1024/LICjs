define(["require", "exports"], function (require, exports) {
    "use strict";
    function createContext(canvas) {
        var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) {
            console.log("Unable to initialize WebGL. Your browser may not support it.");
            gl = null;
        }
        gl.clearColor(0.0, 1.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, canvas.width, canvas.height);
        return gl;
    }
    exports.createContext = createContext;
    function loadExtenstion(gl, ext) {
        var extension = gl.getExtension(ext);
        if (extension === null)
            console.log(ext + " are not supported");
    }
    exports.loadExtenstion = loadExtenstion;
});
