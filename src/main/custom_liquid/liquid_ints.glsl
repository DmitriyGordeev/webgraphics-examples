vec2 figureCenter = vec2(0.5, 0.5);


const float offsetPx = 1.0;


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
    int mass = int(color.r * 255.0);
    int velX = int(color.g * 255.0) - 128;
    int velY = int(color.b * 255.0) - 128;
    return vec3(mass, velX, velY);
}


// impulse to color
vec4 itc(vec3 impulse) {
    float r = float(impulse.r) / 255.0;
    float g = float(impulse.g + 128) / 255.0;
    float b = float(impulse.b + 128) / 255.0;
    return vec4(r, g, b, 1.0);
}

const vec2 e1 = vec2(offsetPx, 0.0);
const vec2 e2 = vec2(offsetPx, offsetPx);
const vec2 e3 = vec2(0.0, offsetPx);
const vec2 e4 = vec2(-offsetPx, offsetPx);

const vec2 e5 = -e1;
const vec2 e6 = -e2;
const vec2 e7 = -e3;
const vec2 e8 = -e4;


float weightSum(vec2 vel) {
    float outValue = 0.0;
    if (dot(vel, e1) > 0.0)
        outValue += dot(vel, e1);
    if (dot(vel, e2) > 0.0)
        outValue += dot(vel, e2);
    if (dot(vel, e3) > 0.0)
        outValue += dot(vel, e3);
    if (dot(vel, e4) > 0.0)
        outValue += dot(vel, e4);
    if (dot(vel, e5) > 0.0)
        outValue += dot(vel, e5);
    if (dot(vel, e6) > 0.0)
        outValue += dot(vel, e6);
    if (dot(vel, e7) > 0.0)
        outValue += dot(vel, e7);
    if (dot(vel, e8) > 0.0)
        outValue += dot(vel, e8);
    return outValue;
}


// mass0, mass = [0, 255]
// vel.x,y = [-128, 127]
float getMassInflow(vec2 vel, vec2 e, float mass0, float mass) {
    float s = weightSum(vel);
    if (dot(vel, -e) > 0.0) {
        return min(floor(mass * dot(vel, -e) / s), 255.0 - mass0);
    }
    return 0.0;
}


//float getMassInflowDeltaVel(vec2 vel, vec2 vel0, vec2 e, float mass) {
//    vec2 deltaVel = vel - vel0;
//    float dir = dot(deltaVel, -e) / offsetPx;
//    if (dir > 0.0) {
//        return dir * mass;
//    }
//    return 0.0;
//}


vec2 getNewVel(vec2 vel0, vec2 vel, float mass0, float mass, vec2 e) {

    float mw = mass / (mass0 + mass);

    vec2 deltaVel = vel - vel0;

    float dir = dot(deltaVel, e) / offsetPx;

    if (dir < 0.0 && length(deltaVel) > 0.000001) {
        vel0.x -= dir / length(deltaVel) * deltaVel.x * mw;
        vel0.y -= dir / length(deltaVel) * deltaVel.y * mw;
    }

    return vel0;
}



void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord.xy / iResolution.xy;

    // colors at the previous frame
    vec4 C0 = texture(iChannel0, uv);
    vec3 I0 = cti(C0);


    // Convert colors to impulses
    vec4 C1 = texture(iChannel0, (fragCoord.xy + e1) / iResolution.xy);     vec3 I1 = cti(C1);
    vec4 C2 = texture(iChannel0, (fragCoord.xy + e2) / iResolution.xy);     vec3 I2 = cti(C2);
    vec4 C3 = texture(iChannel0, (fragCoord.xy + e3) / iResolution.xy);     vec3 I3 = cti(C3);
    vec4 C4 = texture(iChannel0, (fragCoord.xy + e4) / iResolution.xy);     vec3 I4 = cti(C4);
    vec4 C5 = texture(iChannel0, (fragCoord.xy + e5) / iResolution.xy);     vec3 I5 = cti(C5);
    vec4 C6 = texture(iChannel0, (fragCoord.xy + e6) / iResolution.xy);     vec3 I6 = cti(C6);
    vec4 C7 = texture(iChannel0, (fragCoord.xy + e7) / iResolution.xy);     vec3 I7 = cti(C7);
    vec4 C8 = texture(iChannel0, (fragCoord.xy + e8) / iResolution.xy);     vec3 I8 = cti(C8);


    vec2 vel0 = vec2(I0.g, I0.b);
    float S = weightSum(vel0);

    // total mass outflow
    float massOutflow = 0.0;

    float w01 = 0.0;
    float w02 = 0.0;
    float w03 = 0.0;
    float w04 = 0.0;
    float w05 = 0.0;
    float w06 = 0.0;
    float w07 = 0.0;
    float w08 = 0.0;

    if (S > 0.0) {
        w01 = dot(vel0, e1) / S;
        w02 = dot(vel0, e2) / S;
        w03 = dot(vel0, e3) / S;
        w04 = dot(vel0, e4) / S;
        w05 = dot(vel0, e5) / S;
        w06 = dot(vel0, e6) / S;
        w07 = dot(vel0, e7) / S;
        w08 = dot(vel0, e8) / S;
    }

    if (w01 > 0.0) {
        massOutflow += min(floor(w01 * I0.r), 255 - I1.r);
    }

    if (w02 > 0.0) {
        massOutflow += min(floor(w02 * I0.r), 255 - I2.r);
    }

    if (w03 > 0.0) {
         massOutflow += min(floor(w03 * I0.r), 255 - I3.r);
    }

    if (w04 > 0.0) {
         massOutflow += min(floor(w04 * I0.r), 255 - I4.r);
    }

    if (w05 > 0.0) {
        massOutflow += min(floor(w05 * I0.r), 255 - I5.r);
    }

    if (w06 > 0.0) {
        massOutflow += min(floor(w06 * I0.r), 255 - I6.r);
    }

    if (w07 > 0.0) {
        massOutflow += min(floor(w07 * I0.r), 255 - I7.r);
    }

    if (w08 > 0.0) {
        massOutflow += min(floor(w08 * I0.r), 255 - I8.r);
    }


    // total mass inflow
    float massInflow = 0.0;


    // point 1
    vec2 vel1 = vec2(I1.g, I1.b);
    massInflow += getMassInflow(vel1, e1, I0.r, I1.r);


    // point 2
    vec2 vel2 = vec2(I2.g, I2.b);
    massInflow += getMassInflow(vel2, e2, I0.r, I2.r);


    // point 3
    vec2 vel3 = vec2(I3.g, I3.b);
    massInflow += getMassInflow(vel3, e3, I0.r, I3.r);


    // point 4
    vec2 vel4 = vec2(I4.g, I4.b);
    massInflow += getMassInflow(vel4, e4, I0.r, I4.r);


    // point 5
    vec2 vel5 = vec2(I5.g, I5.b);
    massInflow += getMassInflow(vel5, e5, I0.r, I5.r);


    // point 6
    vec2 vel6 = vec2(I6.g, I6.b);
    massInflow += getMassInflow(vel6, e6, I0.r, I6.r);


    // point 7
    vec2 vel7 = vec2(I7.g, I7.b);
    massInflow += getMassInflow(vel7, e7, I0.r, I7.r);


    // point 8
    vec2 vel8 = vec2(I8.g, I8.b);
    massInflow +=  getMassInflow(vel8, e8, I0.r, I8.r);



    float newMass = I0.r - massOutflow + massInflow;
    if (newMass < 1.0 / 255.0)
    newMass = 0.0;


    vec2 newVel = vec2(0.0);
    if (newMass > 0.0) {
        //        newVel += newVel10 + newVel20 + newVel30 +
        //            newVel40 + newVel50 + newVel60 + newVel70 + newVel80;

        newVel += newVel30 + newVel10 + newVel70 + newVel50;
    }


    // newVel.x = floor(newVel.x * 255.0) / 255.0;
    // newVel.y = floor(newVel.y * 255.0) / 255.0;



    //    // BOUNDARIES -------------------
    //
    //    // Bottom
    //    if ((fragCoord.xy + e7).y <= 0.0) {
    //        if (newVel.y < 0.0)
    //            newVel.y *= -1.0;
    //    }
    //
    //    // Top
    //    if ((fragCoord.xy + e3).y >= iResolution.y) {
    //        if (newVel.y > 0.0)
    //            newVel.y *= -1.0;
    //    }
    //
    //    // Right
    //    if ((fragCoord.xy + e1).x >= iResolution.x) {
    //        if (newVel.x > 0.0)
    //            newVel.x *= -1.0;
    //    }
    //
    //    // Left
    //    if ((fragCoord.xy + e5).x <= 0.0) {
    //        if (newVel.x < 0.0)
    //            newVel.x *= -1.0;
    //    }
    //
    //    // -------------------


    vec4 finalColor = itc(vec3(newMass, newVel.x, newVel.y));


    // TODO: главная проблема - почему фигура лопается?


    if (finalColor.r > 0.0 && finalColor.g == 0.5 && finalColor.b == 0.5) {

        finalColor = vec4(1.0);

    }


    fragColor = finalColor;


    // Initial figure
    if (iFrame < 2) {
        //        if (drawBox(figureCenter, uv, 0.2, 0.3)) {


        if (fragCoord.x >= 280.0 && fragCoord.x <= 300.0 && fragCoord.y >= 180.0 && fragCoord.y <= 200.0) {

            fragColor = itc(vec3(1.0, 1.0, -1.0));
        }
        else {
            // zero mass and zero speed (no liquid there)
            // fragColor = vec4(0.0, 0.5, 0.5, 1.0);

            fragColor = itc(vec3(0.0));
        }
    }

}