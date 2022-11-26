vec2 figureCenter = vec2(0.5);


// coeffs
float offset = 0.1;


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
    return vec3(color.r, 2.0 * color.g - 1.0, 2.0 * color.b  - 1.0);
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
    vec3 I0 = cti(C0);
                                                            // Convert colors to impulses
    vec4 C1 = texture(iChannel0, uv + vec2(-offset, 0.0));  vec3 I1 = cti(C1);
    vec4 C2 = texture(iChannel0, uv + vec2(0.0, offset));   vec3 I2 = cti(C2);
    vec4 C3 = texture(iChannel0, uv + vec2(offset, 0.0));   vec3 I3 = cti(C3);
    vec4 C4 = texture(iChannel0, uv + vec2(0.0, -offset));  vec3 I4 = cti(C4);


    // 1. Mass outcome
    float newM0 = I0.r * (sqrt2 - sqrt(I0.g * I0.g + I0.b * I0.b)) / sqrt2;

    // 2. Mass income
    int count = 0;
    if (I1.g > 0.0) {
        newM0 += I1.r * I1.g;
        count++;
    }

    if (I2.b < 0.0) {
        newM0 += I2.r * abs(I2.b);      // todo: abs -> -= ?
        count++;
    }

    if (I3.g < 0.0) {
        newM0 += I3.r * abs(I3.g);      // todo: abs -> -= ?
        count++;
    }

    if (I4.b > 0.0) {
        newM0 += I4.r * I4.b;
        count++;
    }
    newM0 /= float(count);



    // 3. Xvel change
    float newVg0 = I0.g;
    if (I1.g > 0.0) {
        newVg0 += I1.g * I1.r / (I1.r + I0.r);
    }
    if (I3.g < 0.0) {
        newVg0 += I3.g * I3.r / (I3.r + I0.r);
    }

    // 4. Yvel change
    float newVb0 = I0.b;
    if (I2.b < 0.0) {
        newVb0 += I2.b * I2.r / (I2.r + I0.r);
    }
    if (I4.b > 0.0) {
        newVb0 += I4.b * I4.r / (I4.r + I0.r);
    }


    fragColor = itc(vec3(newM0, newVg0, newVb0));



    // Initial figure
    if (iFrame < 2) {
        if (drawCircle(figureCenter, uv, 0.1)) {
            fragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
        else {
            fragColor = vec4(vec3(0.0), 1.0);
        }
    }

}