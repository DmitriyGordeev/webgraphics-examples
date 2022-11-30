vec2 figureCenter = vec2(0.5);


// coeffs
float offset = 0.001;


const float PI = 2.0 * 3.1415926535;
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
const float a7 = -PI / 2.0;
const float a8 = 7.0 * PI / 4.0;


const vec2 e1 = vec2(cos(a1), sin(a1));
const vec2 e2 = vec2(cos(a2), sin(a2));
const vec2 e3 = vec2(cos(a3), sin(a3));
const vec2 e4 = vec2(cos(a4), sin(a4));
const vec2 e5 = vec2(cos(a5), sin(a5));
const vec2 e6 = vec2(cos(a6), sin(a6));
const vec2 e7 = vec2(cos(a7), sin(a7));
const vec2 e8 = vec2(cos(a8), sin(a8));



float weightSum(vec2 vel) {
    return dot(vel, e1) + dot(vel, e2) + dot(vel, e3) + dot(vel, e4) +
            dot(vel, e5) + dot(vel, e6) + dot(vel, e7) + dot(vel, e8);
}


void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord.xy / iResolution.xy;

    // colors at the previous frame
    vec4 C0 = texture(iChannel0, uv);
    vec3 I0 = cti(C0);

    // Convert colors to impulses
    vec4 C1 = texture(iChannel0, uv + vec2(offset, 0.0));   vec3 I1 = cti(C1);
    vec4 C2 = texture(iChannel0, uv + offset * e2);         vec3 I2 = cti(C2);
    vec4 C3 = texture(iChannel0, uv + vec2(0.0, offset));   vec3 I3 = cti(C3);
    vec4 C4 = texture(iChannel0, uv + offset * e4);         vec3 I4 = cti(C4);
    vec4 C5 = texture(iChannel0, uv + vec2(-offset, 0.0));  vec3 I5 = cti(C5);
    vec4 C6 = texture(iChannel0, uv + offset * e6);         vec3 I6 = cti(C6);
    vec4 C7 = texture(iChannel0, uv + vec2(0.0, -offset));  vec3 I7 = cti(C7);
    vec4 C8 = texture(iChannel0, uv + offset * e8);         vec3 I8 = cti(C8);

    vec2 vel0 = vec2(I0.g, I0.b);


    float S = weightSum(vel0);

    // total mass outflow
    float massOutflow = 0.0;
    float w01 = dot(vel0, e1) / S;
    float w02 = dot(vel0, e2) / S;
    float w03 = dot(vel0, e3) / S;
    float w04 = dot(vel0, e4) / S;
    float w05 = dot(vel0, e5) / S;
    float w06 = dot(vel0, e6) / S;
    float w07 = dot(vel0, e7) / S;
    float w08 = dot(vel0, e8) / S;

    if (w01 > 0.0)
        massOutflow += w01 * I0.r;
    if (w02 > 0.0)
        massOutflow += w02 * I0.r;
    if (w03 > 0.0)
        massOutflow += w03 * I0.r;
    if (w04 > 0.0)
        massOutflow += w04 * I0.r;
    if (w05 > 0.0)
        massOutflow += w05 * I0.r;
    if (w06 > 0.0)
        massOutflow += w06 * I0.r;
    if (w07 > 0.0)
        massOutflow += w07 * I0.r;
    if (w08 > 0.0)
        massOutflow += w08 * I0.r;


    // total mass inflow
    float massInflow = 0.0;

    // point 1
    vec2 vel1 = vec2(I1.g, I1.b);
    float S1 = weightSum(vel1);
    if (dot(vel1, -e1) > 0.0)
        massInflow = I1.r * dot(vel1, -e1) / S1;

    // velocity
    float mw0 = I0.r / (I0.r + I1.r);
    float mw1 = I1.r / (I0.r + I1.r);
    float deltaVelX1 = 0.0;
    float deltaVelY1 = 0.0;
    if (dot(vel0, vel1) < 0.0) {
        deltaVelX1 += mw0 * I0.g + mw1 * I1.g;
        deltaVelY1 += mw0 * I0.b + mw1 * I1.b;
    }


    // point 2
    vec2 vel2 = vec2(I2.g, I2.b);
    float S2 = weightSum(vel2);
    if (dot(vel2, -e2) > 0.0)
        massInflow = I2.r * dot(vel2, -e2) / S2;

    // velocity
    mw0 = I0.r / (I0.r + I1.r);
    float mw2 = I2.r / (I0.r + I2.r);
    float deltaVelX2 = 0.0;
    float deltaVelY2 = 0.0;
    if (dot(vel0, vel2) < 0.0) {
        deltaVelX2 += mw0 * I0.g + mw2 * I2.g;
        deltaVelY2 += mw0 * I0.b + mw2 * I2.b;
    }


    // point 3
    vec2 vel3 = vec2(I3.g, I3.b);
    float S3 = weightSum(vel3);
    if (dot(vel3, -e3) > 0.0)
        massInflow = I3.r * dot(vel3, -e3) / S3;

    // velocity
    mw0 = I0.r / (I0.r + I3.r);
    float mw3 = I3.r / (I0.r + I3.r);
    float deltaVelX3 = 0.0;
    float deltaVelY3 = 0.0;
    if (dot(vel0, vel3) < 0.0) {
        deltaVelX3 += mw0 * I0.g + mw3 * I3.g;
        deltaVelY3 += mw0 * I0.b + mw3 * I3.b;
    }


    // point 4
    vec2 vel4 = vec2(I4.g, I4.b);
    float S4 = weightSum(vel4);
    if (dot(vel4, -e4) > 0.0)
        massInflow = I4.r * dot(vel4, -e4) / S4;

    // velocity
    mw0 = I0.r / (I0.r + I4.r);
    float mw4 = I4.r / (I0.r + I4.r);
    float deltaVelX4 = 0.0;
    float deltaVelY4 = 0.0;
    if (dot(vel0, vel4) < 0.0) {
        deltaVelX4 += mw0 * I0.g + mw4 * I4.g;
        deltaVelY4 += mw0 * I0.b + mw4 * I4.b;
    }


    // point 5
    vec2 vel5 = vec2(I5.g, I5.b);
    float S5 = weightSum(vel5);
    if (dot(vel5, -e5) > 0.0)
        massInflow = I5.r * dot(vel5, -e5) / S5;

    // velocity
    mw0 = I0.r / (I0.r + I5.r);
    float mw5 = I5.r / (I0.r + I5.r);
    float deltaVelX5 = 0.0;
    float deltaVelY5 = 0.0;
    if (dot(vel0, vel5) < 0.0) {
        deltaVelX5 += mw0 * I0.g + mw5 * I5.g;
        deltaVelY5 += mw0 * I0.b + mw5 * I5.b;
    }


    // point 6
    vec2 vel6 = vec2(I6.g, I6.b);
    float S6 = weightSum(vel6);
    if (dot(vel6, -e6) > 0.0)
        massInflow = I6.r * dot(vel6, -e6) / S6;

    // velocity
    mw0 = I0.r / (I0.r + I6.r);
    float mw6 = I6.r / (I0.r + I6.r);
    float deltaVelX6 = 0.0;
    float deltaVelY6 = 0.0;
    if (dot(vel0, vel6) < 0.0) {
        deltaVelX6 += mw0 * I0.g + mw6 * I6.g;
        deltaVelY6 += mw0 * I0.b + mw6 * I6.b;
    }



    // point 7
    vec2 vel7 = vec2(I7.g, I7.b);
    float S7 = weightSum(vel7);
    if (dot(vel7, -e7) > 0.0)
        massInflow = I7.r * dot(vel7, -e7) / S7;

    // velocity
    mw0 = I0.r / (I0.r + I7.r);
    float mw7 = I7.r / (I0.r + I7.r);
    float deltaVelX7 = 0.0;
    float deltaVelY7 = 0.0;
    if (dot(vel0, vel7) < 0.0) {
        deltaVelX7 += mw0 * I0.g + mw7 * I7.g;
        deltaVelY7 += mw0 * I0.b + mw7 * I7.b;
    }



    // point 8
    vec2 vel8 = vec2(I8.g, I8.b);
    float S8 = weightSum(vel8);
    if (dot(vel8, -e8) > 0.0)
        massInflow = I8.r * dot(vel8, -e8) / S8;

    // velocity
    mw0 = I0.r / (I0.r + I8.r);
    float mw8 = I8.r / (I0.r + I8.r);
    float deltaVelX8 = 0.0;
    float deltaVelY8 = 0.0;
    if (dot(vel0, vel8) < 0.0) {
        deltaVelX8 += mw0 * I0.g + mw8 * I8.g;
        deltaVelY8 += mw0 * I0.b + mw8 * I8.b;
    }


    float newMass = I0.r - massOutflow + massInflow;

    float newVelX0 = I0.g;
    float newVelY0 = I0.b;
    if (newMass > 0.0) {
       newVelX0 += deltaVelX1 + deltaVelX2 + deltaVelX3 + deltaVelX4 + deltaVelX5 + deltaVelX6 + deltaVelX7 + deltaVelX8;
       newVelY0 += deltaVelY1 + deltaVelY2 + deltaVelY3 + deltaVelY4 + deltaVelY5 + deltaVelY6 + deltaVelY7 + deltaVelY8;
    }


    vec4 finalColor = itc(vec3(newMass, newVelX0, newVelY0));



    fragColor = finalColor;



    // Initial figure
    if (iFrame < 2) {
        if (drawBox(figureCenter, uv, 0.2, 0.3)) {

            fragColor = itc(vec3(1.0, 0.0, 0.0));

        }
        else {
            // zero mass and zero speed (no liquid there)
            // fragColor = vec4(0.0, 0.5, 0.5, 1.0);

            fragColor = itc(vec3(0.0));
        }
    }

}