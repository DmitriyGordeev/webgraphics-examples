vec2 boxCenter = vec2(0.5);
float w = 0.1;
float h = 0.1;



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


    float r = 0.01 * rand(uv);






    // TODO: где существуют глоб переменные ?\
    // TODO: сколько раз выполняется main



    vec2 center = boxCenter;
    center.y -= 0.05 * iTime;


    if (center.y <= 0.2) {
        center.y = 0.2;
    }



    if (drawBox(center, uv)) {
        fragColor = vec4(vec3(0.0), 1.0);
    }
    else {
        fragColor = vec4(1.0);
    }


}