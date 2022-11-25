vec2 figureCenter = vec2(0.5);
float w = 0.5;
float h = 0.5;


int numPoints = 10;

// coeffs
float offset = 0.1;
float pullCoeff = 0.1;
float pushCoeff = 1.0;


const float PI = 2.0*3.1415926535;


float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}


bool drawBox(vec2 center, vec2 uv) {
    bool xCond = uv.x >= center.x - w / 2.0 && uv.x <= center.x + w / 2.0;
    bool yCond = uv.y >= center.y - h / 2.0 && uv.y <= center.y + h / 2.0;
    return xCond && yCond;
}


bool drawCircle(vec2 center, vec2 uv, float radius) {
    return (uv.x - center.x) * (uv.x - center.x) + (uv.y - center.y) * (uv.y - center.y) <= radius * radius;
}



void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord.xy / iResolution.xy;

    // previous color here at this fragment
    float C0 = texture(iChannel0, uv).r;

    float angle = rand(uv);

    // TODO: second circle layer

    float newColor = 0.0;
    for (int i = 0; i < numPoints; i++) {

        float angleAdd = float(i) * PI / float(numPoints);

        angle += angleAdd;

        vec2 point = uv + offset * vec2(cos(angle), sin(angle));
        float previousColor = texture(iChannel0, point).r;

        float Cpush = previousColor * pushCoeff;
        float Cpull = C0 * previousColor * pullCoeff;
        newColor += Cpush - Cpull;

        // angle += float(i) * PI / float(numPoints);
    }



    fragColor = vec4(newColor, 0.0, 0.0, 1.0);



    if (iFrame < 4) {
        if (drawCircle(figureCenter, uv, 0.1)) {
            fragColor = vec4(0.5, 0.0, 0.0, 1.0);
        }
        else {
            fragColor = vec4(vec3(0.0), 1.0);
        }
    }

}