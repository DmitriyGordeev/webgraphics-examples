vec2 figureCenter = vec2(0.5);
float w = 0.5;
float h = 0.5;




// coeffs
float offset = 0.005;
float pullCoeff = 1.0;
float pushCoeff = 0.1;
float gravCoeff = 0.1;


const float PI = 2.0*3.1415926535;

float gravProj = cos(PI / 4.0);


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



void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;

    // previous color here
    float C0 = texture(iChannel0, uv).r;

    float newColor0 = 0.0;

    // TODO: ограничения по стенкам

    // Point 1
    // previous color in the point 1
    float C1 = texture(iChannel0, vec2(uv.x - offset, uv.y)).r;
    float colorPull = C0 * C1 * pullCoeff;
    float colorPush = C1 * pushCoeff;
    float colorGrav = C1 * gravCoeff;



    // Point 2
    float C2 = texture(iChannel0, vec2(uv.x, uv.y + offset)).r;
    colorPull = C0 * C2 * pullCoeff;
    colorPush = C2 * pushCoeff;
    colorGrav = C2 * gravCoeff;
    if (C2 > 0.0)
        newColor0 = C2;


    // Point 3
    float C3 = texture(iChannel0, vec2(uv.x + offset, uv.y)).r;
    colorPull = C0 * C3 * pullCoeff;
    colorPush = C3 * pushCoeff;
    colorGrav = C3 * gravCoeff;
    if (C1 > 0.0 && C3 > 0.0)
        newColor0 = max(C1, C3);


    // Point 4
    float C4 = texture(iChannel0, vec2(uv.x, uv.y - offset)).r;
    colorPull = C0 * C4 * pullCoeff;
    colorPush = C4 * pushCoeff;
    colorGrav = 0.0;



    fragColor = vec4(newColor0, 0.0, 0.0, 1.0);



    if (iFrame < 4) {
        if (drawCircle(figureCenter, uv, 0.1)) {
            fragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
        else {
            fragColor = vec4(vec3(0.0), 1.0);
        }
    }

}