vec2 ballPos = vec2(0.0, 0.5);
float radius = 0.1;
vec2 vel = vec2(0.1, 0.0);


#define Res  iChannelResolution[0]
#define Res1  iChannelResolution[1]





void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;


    vec2 rUV = vec2(float(iFrame) / Res.x, 0.5 / Res1.y);


    vec4 lastFrameTex = texture(iChannel0, rUV);


    if (ballPos.x + radius >= 1.0) vel *= -1.0;


    ballPos += vel * iTime;
    radius = 0.01 * iTime;


    // rectangle
    // bool xCond = (uv.x >= ballPos.x - radius) && (uv.x <= ballPos.x + radius);
    // bool yCond = (uv.y >= ballPos.y - radius) && (uv.y <= ballPos.y + radius);


    // ellipse
    float xpart = (uv.x - ballPos.x) * (uv.x - ballPos.x);
    float ypart = (uv.y - ballPos.y) * (uv.y - ballPos.y);

    fragColor = vec4(vec3(0.0), 1.0);

    if (xpart + ypart <= radius * radius) {
        fragColor = 0.5 * vec4(1.0) + 0.5 * lastFrameTex;
    }
}