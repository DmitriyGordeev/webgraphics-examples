
#define ROT_NUM 5

const float ang = 2.0*3.1415926535 / float(ROT_NUM);
mat2 m = mat2(cos(ang),sin(ang),-sin(ang),cos(ang));


vec4 randS(vec2 uv)
{
    return texture(iChannel2, uv);
}


float getRot(vec2 pos, vec2 b) {

    vec2 p = b;

    float rot = 0.0;

    for (int i = 0; i < ROT_NUM; i++) {

        vec2 texelCoord = fract((pos + p) / iResolution.xy);

        vec4 prevTexel = texture(iChannel0, texelCoord);

        vec2 pivotPoint = p.yx * vec2(0, 1);

        rot += 0.1 * dot(prevTexel.xy, pivotPoint);

        p = m * p;

    }

    return rot / dot(b, b) / float(ROT_NUM);
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 pos = fragCoord.xy;
    vec2 uv = fragCoord.xy / iResolution.xy;


    float r = randS(vec2(float(iTime) / iResolution.x, 0.5 / iResolution.y)).x;

    vec2 b = vec2(cos(ang * r), sin(ang * r));

    vec2 v = vec2(0);




    for (int i = 0; i < 5; i++) {

        vec2 p = b;

        for(int j = 0; j < ROT_NUM; j++) {

            // vec2 texelCoord = fract((pos + p) / iResolution.xy);

            vec2 texelCoord = fract(pos / iResolution.xy);

            vec4 prevTexel = texture(iChannel0, texelCoord);



            // vec2 pivotPoint = p.yx * vec2(-1, 1);



            // v += 0.01 * dot(vec2(1.0), p);

            // v += 0.001 * dot(prevTexel.xyz, vec3(1.0));

            // v += 0.01 * dot(prevTexel.xy, p.yx * vec2(0, 1));


            p = m * p;


        }
    }


    // fract() дает эффект зеркала


    // vec2 f = fract((pos + r * b) / iResolution.xy);


    vec2 f = fract((pos + v) / iResolution.xy);


    fragColor=texture(iChannel0, f);



    if (iFrame < 4) {

        if ((uv.x >= 0.45 && uv.x <= 0.55) && (uv.y >= 0.1 && uv.y <= 0.9)) {
            fragColor = vec4(0.0, 0.0, 0.2, 1.0);
            // fragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
        else {
            fragColor = vec4(1.0, 1.0, 1.0, 1.0);
            // fragColor = vec4(0.0, 0.0, 0.2, 1.0);
        }
    }
}