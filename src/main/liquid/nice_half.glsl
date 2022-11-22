
#define ROT_NUM 3

const float ang = 2.0*3.1415926535 / float(ROT_NUM);
mat2 m = mat2(cos(ang),sin(ang),-sin(ang),cos(ang));


vec4 randS(vec2 uv)
{
    return texture(iChannel2, uv);
}


float getRot(vec2 offset, vec2 b) {

    vec2 p = b;

    float rot = 0.0;

    for (int i = 0; i < ROT_NUM; i++) {

        // vec2 texelCoord = fract((offset + p) / iResolution.xy);


        vec2 texelCoord = (offset + p) / iResolution.xy;


        vec4 prevTexel = texture(iChannel0, texelCoord);

        vec2 picker = p.yx * vec2(-1.0, 1.0);

        rot += 2.0 * dot(prevTexel.xy, picker) * dot(prevTexel.xy, 0.15 * picker);

        p = 3.5 * m * p;

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



    for (int i = 0; i < 1; i++) {

        vec2 p = b;

        for(int j = 0; j < ROT_NUM; j++) {


            v += 1.0 * p.yx * getRot(pos + p, 0.25 * b);


            p = m * p;

        }

        b += 4.0;
    }


    // vec2 f = fract((pos + v * vec2(-1, 1)) / iResolution.xy);


    vec2 grav = iTime * vec2(0.0, -0.08);
    v += grav;


    if (uv.x < 0.5) {
        v.x -= 1.1;
    }

    if (uv.x > 0.5) {
        v.x += 0.0;
    }


    if (uv.x >= 0.5 && uv.x <= 0.5) {
        v.y -= 1.2;
    }


    vec2 f = (pos + v * vec2(-2.0, 1.0)) / iResolution.xy;




    fragColor = texture(iChannel0, f);




    if (iFrame < 4) {


        // rectangle
        if ((uv.x >= 0.49 && uv.x <= 0.51) && (uv.y >= 0.0 && uv.y <= 0.2)) {
            fragColor = vec4(0.0, 0.0, 0.2, 1.0);
            // fragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
        else {
            fragColor = vec4(1.0, 1.0, 1.0, 1.0);
            // fragColor = vec4(0.0, 0.0, 0.2, 1.0);
        }
    }
}