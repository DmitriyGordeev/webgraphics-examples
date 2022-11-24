vec2 boxCenter = vec2(0.5);
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



void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;



    // previous color here
    float C0 = texture(iChannel0, uv).r;

    float newColor0 = 0.0;

    // TODO: ограничения по стенкам

    // Point 1
    // previous color in the point 1
    float C1 = texture(iChannel0, vec2(uv.x - offset, uv.y + offset)).r;

    float colorPull = C0 * C1 * pullCoeff;
    float colorPush = C1 * pushCoeff;
    float colorGrav = C1 * gravCoeff;
    newColor0 += gravProj * (colorPush + colorPull + colorGrav) / 3.0;


    // Point 2
    float C2 = texture(iChannel0, vec2(uv.x, uv.y + offset)).r;
    colorPull = C0 * C2 * pullCoeff;
    colorPush = C2 * pushCoeff;
    colorGrav = C2 * gravCoeff;
    newColor0 += (colorPush + colorPull + colorGrav) / 3.0;


    // Point 3
    float C3 = texture(iChannel0, vec2(uv.x + offset, uv.y + offset)).r;
    colorPull = C0 * C3 * pullCoeff;
    colorPush = C3 * pushCoeff;
    colorGrav = C3 * gravCoeff;
    newColor0 += gravProj * (colorPush + colorPull + colorGrav) / 3.0;


    // Point 4
    float C4 = texture(iChannel0, vec2(uv.x + offset, uv.y)).r;
    colorPull = C0 * C4 * pullCoeff;
    colorPush = C4 * pushCoeff;
    colorGrav = 0.0;
    newColor0 += (colorPush + colorPull + colorGrav) / 3.0;


    // Point 5
    float C5 = texture(iChannel0, vec2(uv.x + offset, uv.y - offset)).r;
    colorPull = C0 * C5 * pullCoeff;
    colorPush = C5 * pushCoeff;
    colorGrav = 0.0;
    newColor0 += gravProj * (colorPush + colorPull + colorGrav) / 3.0;


    // Point 6
    float C6 = texture(iChannel0, vec2(uv.x, uv.y - offset)).r;
    colorPull = C0 * C6 * pullCoeff;
    colorPush = C6 * pushCoeff;
    colorGrav = 0.0;
    newColor0 += (colorPush + colorPull + colorGrav) / 3.0;


    // Point 7
    float C7 = texture(iChannel0, vec2(uv.x - offset, uv.y - offset)).r;
    colorPull = C0 * C7 * pullCoeff;
    colorPush = C7 * pushCoeff;
    colorGrav = 0.0;
    newColor0 += gravProj * (colorPush + colorPull + colorGrav) / 3.0;


    // Point 8
    float C8 = texture(iChannel0, vec2(uv.x - offset, uv.y)).r;
    colorPull = C0 * C8 * pullCoeff;
    colorPush = C8 * pushCoeff;
    colorGrav = 0.0;
    newColor0 += (colorPush + colorPull + colorGrav) / 3.0;



    fragColor = vec4(newColor0, 0.0, 0.0, 1.0);


    if (iFrame < 4) {
        if (drawBox(boxCenter, uv)) {
            fragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
        else {
            fragColor = vec4(vec3(0.0), 1.0);
        }
    }

}