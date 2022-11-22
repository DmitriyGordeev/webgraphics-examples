void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;


    vec2 pos = uv + vec2(0.0, 0.001 * iTime);



    vec4 texel = texture(iChannel0, pos);
    fragColor = texel;


    if (pos.y <= 0.2) {

        if (dot(texel.xyz, vec3(1.0)) <= 1.0) {
            fragColor = vec4(vec3(0.0), 1.0);
        }


    }



    if(iFrame <= 4) {
        bool xCond = uv.x >= 0.49 && uv.x <= 0.51;
        bool yCond = uv.y >= 0.49 && uv.y <= 0.51;

        if (xCond && yCond) {
            fragColor = vec4(vec3(0.0), 1.0);
        }
        else {
            fragColor = vec4(1.0);
        }
    }


}