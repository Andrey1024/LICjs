attribute vec3 aVertexPosition;
varying vec2 vTextureFieldCoords;
varying vec2 vTextureNoiseCoords;
uniform mat4 model;
uniform mat4 reverse;

void main(void) {
    gl_Position = model * vec4(aVertexPosition, 1.0);
    vTextureFieldCoords = aVertexPosition.xy * 0.5 + 0.5;
    vTextureNoiseCoords = (reverse * (aVertexPosition, 1.0)).xy;
}