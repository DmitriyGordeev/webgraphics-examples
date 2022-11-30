vec2 figureCenter = vec2(0.5);


// coeffs
float offset = 0.001;


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



float collectIntensity(vec2 point, float radius) {

    // random number from 0 to PI / 2
    // TODO: this will give the same number for the same UV?
    // TODO: better use iTime ?

    float random_angle = rand(iTime * point) * PI / 2.0;
    float value = 0.0;

    while (random_angle <= 2.0 * PI) {
        vec2 probing_point = point + radius * vec2(cos(random_angle), sin(random_angle));
        vec4 texel = texture(iChannel0, probing_point);
        value += dot(vec4(1.0), texel);

        random_angle += rand(iTime * point) * PI / 2.0;
    }

    return value;
}



void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord.xy / iResolution.xy;

    // colors at the previous frame
    vec4 C0 = texture(iChannel0, uv);


//    float i = collectIntensity(uv, 0.1);


    vec4 finalColor = C0 * 0.1;
    fragColor = finalColor;

    // Initial figure
    if (iFrame < 2) {
        if (drawBox(figureCenter, uv, 0.1, 0.1)) {
            fragColor = itc(vec3(1.0, 0.0, 0.0));
        }
        else {
            fragColor = itc(vec3(0.0));
        }
    }

}