vec2 figureCenter = vec2(0.5, 0.0);


const float offsetPx = 1.0;
const float rPx = 10.0;

const float PI = 3.1415926535;
const float sqrt2 = sqrt(2.0);


float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

float getRandAngle(vec2 pxCoords) {
    return PI / 10.0 * rand(pxCoords) + PI / 3.0;
}

bool drawBox(vec2 center, vec2 uv, float w, float h) {
    bool xCond = uv.x >= center.x - w / 2.0 && uv.x <= center.x + w / 2.0;
    bool yCond = uv.y >= center.y - h / 2.0 && uv.y <= center.y + h / 2.0;
    return xCond && yCond;
}


bool drawCircle(vec2 center, vec2 uv, float radius) {
    return (uv.x - center.x) * (uv.x - center.x) + (uv.y - center.y) * (uv.y - center.y) <= radius * radius;
}


float getRotation(vec2 pxCoords) {
    float angle = getRandAngle(pxCoords);   // rand angle from PI/12 (15deg) to PI / 4 (45deg);
    float outValue = 0.0;
    int rotations = 1;
    while (angle <= 2.0 * PI) {
        vec2 n = vec2(floor(rPx * cos(angle)), floor(rPx * sin(angle)));

        vec2 pos = (pxCoords + n * vec2(-0.2, 3.0)) / iResolution.xy;
        vec4 color = texture(iChannel0, pos);

        outValue += 1.0 * dot(color.xy, n.xy);
        angle += getRandAngle(pxCoords + n * vec2(10.0, -30.0));
        rotations += 1;
    }
    return outValue / float(rotations + 1);
}



// color to impulse
vec3 cti(vec4 color) {
    color.r = clamp(color.r, 0.0, 1.0);
    color.g = clamp(color.g, 0.0, 1.0);
    color.b = clamp(color.b, 0.0, 1.0);

    int mass = int(color.r * 255.0);
    int velX = int(color.g * 255.0) - 128;
    int velY = int(color.b * 255.0) - 128;
    return vec3(mass, velX, velY);
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


void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord.xy / iResolution.xy;


    // Rotations
    float r_angle = getRandAngle(uv);

    float angle = r_angle;
    vec2 n = vec2(floor(rPx * cos(angle)), floor(rPx * sin(angle)));
    int rotations = 1;
    float rotation = 1.0;
    while (angle <= 2.0 * PI) {
        rotation += getRotation(fragCoord.xy + n);
        angle += getRandAngle(fragCoord.xy + n);

        float factor = 1.0;
        // TODO: factor should change from 1.0 to 3.0 with time ?

        n += factor * rotation * vec2(floor(rPx * cos(angle)), floor(rPx * sin(angle)));
        rotations += 1;
    }
    n = n / float(rotations);


    float finalAngle = getRandAngle(fragCoord.xy + n);


    vec2 offset = vec2(-0.1, -1.0);

    // vec2 pos = (fragCoord.xy + n * vec2(cos(PI * finalAngle), sin(PI * finalAngle))) / iResolution.xy;

    vec2 pos = (fragCoord.xy + n * offset) / iResolution.xy;

    vec4 texel = texture(iChannel0, fract(pos));
    vec4 finalColor = texel;



    fragColor = finalColor;

    // Initial figure
    if (iFrame < 2) {
        if (drawCircle(figureCenter, uv, 0.15)) {
            fragColor = itc(vec3(255, 0, 0));
        }
        else {
            fragColor = vec4(0.0, 0.1, 0.3, 1.0);
        }
    }

}