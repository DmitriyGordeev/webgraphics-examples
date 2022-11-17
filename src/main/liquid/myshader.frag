vec2 ballPos = vec2(0.5);
float radius = 0.1;

vec2 vel = vec2(0.1);


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;


    ballPos += vel * iTime;


    // rectangle
    // bool xCond = (uv.x >= ballPos.x - radius) && (uv.x <= ballPos.x + radius);
    // bool yCond = (uv.y >= ballPos.y - radius) && (uv.y <= ballPos.y + radius);


    // ellipse
    float xpart = (uv.x - ballPos.x) * (uv.x - ballPos.x);
    float ypart = (uv.y - ballPos.y) * (uv.y - ballPos.y);

    fragColor = vec4(vec3(0.0), 1.0);

    if (xpart + ypart <= radius * radius) fragColor = vec4(1.0);
}