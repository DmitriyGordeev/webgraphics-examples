vec2 figureCenter = vec2(0.5);


// coeffs
float offset = 0.01;


const float PI = 2.0 * 3.1415926535;
const float sqrt2 = sqrt(2.0);


float rand(vec2 co){
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



void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord.xy / iResolution.xy;

    // colors at the previous frame
    vec4 C0 = texture(iChannel0, uv);

    vec4 C1 = texture(iChannel0, uv + vec2(-offset, 0.0));
    vec4 C2 = texture(iChannel0, uv + vec2(0.0, offset));
    vec4 C3 = texture(iChannel0, uv + vec2(offset, 0.0));
    vec4 C4 = texture(iChannel0, uv + vec2(0.0, -offset));


    float newC0 = C0.r + C1.r + C2.r + C3.r + C4.r;
    newC0 /= 5.0;

    fragColor = vec4(newC0, 0.0, 0.0, 1.0);


    // Initial figure
    if (iFrame < 2) {
        if (drawCircle(figureCenter, uv, 0.1)) {

            fragColor = itc(vec3(1.0, 0.0, 0.0));

        }
        else {
            // zero mass and zero speed (no liquid there)
            // fragColor = vec4(0.0, 0.5, 0.5, 1.0);

            fragColor = itc(vec3(0.0));
        }
    }

}