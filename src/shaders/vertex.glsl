attribute vec3 aVertexPosition;
varying vec2 vTextureCoords;
void main(void) {
    gl_Position = vec4(aVertexPosition, 1.0);
    vTextureCoords = aVertexPosition.xy * 0.5 + 0.5;
}