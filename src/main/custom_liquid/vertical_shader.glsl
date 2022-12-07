vec2 figureCenter = vec2(0.5);


// coeffs
int offsetPx = 10;


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


// color to impulse
vec3 cti(vec4 color) {
    return vec3(color.r, 2.0 * color.g - 1.0, 2.0 * color.b - 1.0);
}


// impulse to color
vec4 itc(vec3 vel) {
    return vec4(vel.r, (vel.g + 1.0) / 2.0, (vel.b + 1.0) / 2.0, 1.0);
}





const float a1 = 0.0;
const float a2 = PI / 4.0;
const float a3 = PI / 2.0;
const float a4 = 3.0 * PI / 4.0;
const float a5 = PI;
const float a6 = 5.0 * PI / 4.0;
const float a7 = 6.0 * PI / 4.0;
const float a8 = 7.0 * PI / 4.0;


const vec2 e1 = vec2(1.0, 0.0);
const vec2 e2 = vec2(cos(a2), sin(a2));
const vec2 e3 = vec2(0.0, 1.0);
const vec2 e4 = vec2(cos(a4), sin(a4));
const vec2 e5 = vec2(-1.0, 0.0);
const vec2 e6 = vec2(cos(a6), sin(a6));
const vec2 e7 = vec2(0.0, -1.0);
const vec2 e8 = vec2(cos(a8), sin(a8));












void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord.xy / iResolution.xy;

    // colors at the previous frame
    vec4 C0 = texture(iChannel0, uv);



//    // Convert colors to impulses
//    vec4 C1 = texture(iChannel0, uv + offset * e1);         vec3 I1 = cti(C1);
//    vec4 C2 = texture(iChannel0, uv + offset * e2);         vec3 I2 = cti(C2);
//    vec4 C3 = texture(iChannel0, uv + offset * e3);         vec3 I3 = cti(C3);
//    vec4 C4 = texture(iChannel0, uv + offset * e4);         vec3 I4 = cti(C4);
//    vec4 C5 = texture(iChannel0, uv + offset * e5);         vec3 I5 = cti(C5);
//    vec4 C6 = texture(iChannel0, uv + offset * e6);         vec3 I6 = cti(C6);
//    vec4 C7 = texture(iChannel0, uv + offset * e7);         vec3 I7 = cti(C7);
//    vec4 C8 = texture(iChannel0, uv + offset * e8);         vec3 I8 = cti(C8);


    vec2 i7Coord = fragCoord.xy + vec2(0.0, -offsetPx);
    vec2 i7CoordUV = i7Coord / iResolution.xy;
    vec4 C7 = texture(iChannel0, i7CoordUV);
    vec3 I7 = cti(C7);

    vec2 vel7 = vec2(I7.g, I7.b);

    vec4 finalColor = C0;

    if (C7.r > 0.0 && C7.r < 1.0) {
        finalColor.r = 1.0;
        finalColor.g = 1.0;
        finalColor.b = 1.0;
    }


    fragColor = finalColor;


    // Initial figure
    if (iFrame < 2) {
        if (drawBox(figureCenter, uv, 0.3, 0.3)) {

            vec4 color = vec4(1.0, 0.5, -1.0, 1.0);
            fragColor = color;

        }
        else {
            // zero mass and zero speed (no liquid there)
            // fragColor = vec4(0.0, 0.5, 0.5, 1.0);

            fragColor = itc(vec3(0.0));
        }
    }

}