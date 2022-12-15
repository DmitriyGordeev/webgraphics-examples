uniform vec2 u_screenSize;
uniform float u_time;
uniform sampler2D u_texture;    // this texture holds rendering from the previous frame
uniform sampler2D u_noise;      // this is noise texture reference
varying vec3 vPos;
varying vec2 vUV;

vec2 figureCenter = vec2(0.5, 0.5);

const float offsetPx = 1.0;
const float rPx = 10.0;

const float PI = 3.1415926535;
const float sqrt2 = sqrt(2.0);

float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}


bool drawBox(vec2 center, vec2 uv, float w, float h) {
    bool xCond = uv.x >= center.x - w / 2.0 && uv.x <= center.x + w / 2.0;
    bool yCond = uv.y >= center.y - h / 2.0 && uv.y <= center.y + h / 2.0;
    return xCond && yCond;
}


bool drawCircle(vec2 center, vec2 uv, float radius) {
    return (uv.x - center.x) * (uv.x - center.x) + (uv.y - center.y) * (uv.y - center.y) <= radius * radius;
}


float getRandAngle(vec2 pxCoords) {
    return PI * rand(pxCoords) + PI / 3.0;
}

float getRotation(vec2 pxCoords) {
    float angle = getRandAngle(pxCoords);
    float outValue = 0.0;
    int rotations = 1;
    while (angle <= 2.0 * PI) {
        vec2 n = vec2(floor(rPx * cos(angle)), floor(rPx * sin(angle)));
        vec2 pos = (pxCoords + n * vec2(0.1 * sin(10.0 * u_time), 0.1 * cos(10.0 * u_time))) / u_screenSize.xy;
        vec4 color = texture(u_texture, pos);

        outValue += 1.0 * dot(color.xy, n.xy);
        angle += getRandAngle(pxCoords);
        rotations += 1;
    }
    return outValue / float(rotations + 1);
}


// impulse to color
vec4 itc(vec3 impulse) {
    impulse.r = clamp(impulse.r, 0.0, 255.0);
    impulse.g = clamp(impulse.g, -128.0, 127.0);
    impulse.b = clamp(impulse.b, -128.0, 127.0);

    float r = float(impulse.r) / 255.0;
    float g = float(impulse.g + 128.0) / 255.0;
    float b = float(impulse.b + 128.0) / 255.0;
    return vec4(r, g, b, 1.0);
}


void main()
{
    // vec2 uv = gl_FragCoord.xy / u_screenSize.xy;

    vec2 uv = vUV;
    
//    // Rotations
//    float r_angle = getRandAngle(uv * u_time);   // rand angle from PI/12 (15deg) to PI / 4 (45deg);
//
//    float angle = r_angle;
//    vec2 n = vec2(floor(rPx * cos(angle)), floor(rPx * sin(angle)));
//    int rotations = 1;
//    float rotation = 1.0;
//    while (angle <= 2.0 * PI) {
//        rotation += getRotation(gl_FragCoord.xy + n);
//        angle += getRandAngle(gl_FragCoord.xy * u_time);
//        n += 2.0 * rotation * vec2(floor(rPx * cos(angle)), floor(rPx * sin(angle)));
//        rotations += 1;
//    }
//    n = n / float(rotations);


//    vec2 pos = (gl_FragCoord.xy + n * vec2(0.1 * sin(10.0 * u_time), 0.1 * cos(10.0 * u_time))) / u_screenSize.xy;

    vec4 texel = texture(u_texture, uv);
    vec4 finalColor = texel;
    gl_FragColor = finalColor;

    // Initial figure
    if (u_time <= 1.0) {
        if (drawCircle(figureCenter, uv, 0.15)) {
            gl_FragColor = itc(vec3(255, -128, -128));
        }
        else {
            gl_FragColor = itc(vec3(0, 0, 100));
        }
    }

}