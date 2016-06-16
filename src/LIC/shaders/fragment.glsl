#define N 20
#define L 20.0
precision highp float;
varying vec2 vTextureCoords;
uniform sampler2D image;
uniform sampler2D field;
uniform float size;
varying vec2 v_texCoord;
vec2 pointi;
vec2 pointf;
vec2 vector;
vec2 v;
float len;
float maxv;
const float eps = 0.000001;

float top_distance()
{
    if (abs(vector.y) < eps) {
        return 2.0;
    }
    return (pointi.y + 1.0 - pointf.y) / vector.y;
}
float bottom_distance()
{
    if (abs(vector.y) < eps) {
        return 2.0;
    }
    return (pointi.y - pointf.y) / vector.y;
}
float left_distance()
{
    if (abs(vector.x) < eps) {
        return 2.0;
    }
    return (pointi.x - pointf.x) / vector.x;
}
float right_distance()
{
    if (abs(vector.y) < eps) {
        return 2.0;
    }
    return (pointi.x + 1.0 - pointf.x) / vector.x;
}
float get_distance() 
{                
    float top    = max(top_distance()   , 0.0);
    float bottom = max(bottom_distance(), 0.0);
    float left   = max(left_distance()  , 0.0);
    float right  = max(right_distance() , 0.0);
    
    float minimum = 2.0;
    if (top    > eps) minimum = min(top   , minimum);
    if (bottom > eps) minimum = min(bottom, minimum);
    if (left   > eps) minimum = min(left  , minimum);
    if (right  > eps) minimum = min(right , minimum);
    
    if (minimum  < eps   ) return 0.0;
    if (minimum == 2.0   ) return 0.0;
    pointf += vector * minimum;
    if (minimum == top   ) pointi.y += 1.0;
    if (minimum == bottom) pointi.y -+ 1.0;
    if (minimum == left  ) pointi.x -= 1.0;
    if (minimum == right ) pointi.x += 1.0;
    return minimum;                
}
vec2 get_vector(vec2 p) 
{
    vec4 vt = texture2D(field, p / size);
    len = vt.z;
    maxv = vt.w;
    return normalize(vt.xy);
}
float core(float arg)
{
    return exp(-pow(arg, 2.0) / (2.0 * L) ) / sqrt(2.0 * L * 3.1415926535);
}
float integrate(float start, float stop)
{
    float precize = 50.0;
    float step    = (stop - start) / precize;
    float result  = 0.0;
    float k       = 0.0;
    for(float i = 0.0; i < 50.0; i += 1.0) {
        result += core(start + step * i);
    }
    return result;
}
void main() 
{
    float dist = 0.0, norm = 0.0;
    vec4 result = vec4(0.0);
    pointi = floor(vTextureCoords * size);
    pointf = pointi + vec2(0.5, 0.5);
    vector = get_vector(pointi);
    //positive stream line
    for(int i = 0; i < N; i++) {
        vec4 tmp  = texture2D(image, pointi / size);
        float mod = get_distance();
        if (mod < eps) break;
        float t   = integrate(dist, dist + mod);
        dist     += mod;
        norm     += t;
        result   += tmp * t;
        vector    = get_vector(pointi);
    }
    //negative stream line    
    dist   = 0.0;          
    pointi = floor(vTextureCoords * size);
    pointf = pointi + vec2(0.5, 0.5);
    vector = -get_vector(pointi);
    for(int i = 0; i < N; i++) {
        vec4 tmp  = texture2D(image, pointi / size);
        float mod = get_distance();
        if (mod < eps) break;
        float t   = integrate(-dist, -dist - mod);
        dist     += mod;
        norm     += t;
        result   += tmp * t;
        vector    = -get_vector(pointi);
    }

    result /= norm;                
    pointi = floor(vTextureCoords * size);
    vector = get_vector(pointi);
    vec4 clr = mix(vec4(0.0, 0.0, 1.0, 1.0), vec4(1.0, 0.5, 0.0, 1.0), len / maxv); 
    gl_FragColor = result * clr;
}