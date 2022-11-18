// #define Res  iChannelResolution[0]
// #define u_screenSize iChannelResolution[1]

uniform vec2 u_screenSize;
uniform float u_time;
uniform sampler2D u_texture;// this texture holds rendering from the previous frame
uniform sampler2D u_noise;// this is noise texture reference
varying vec3 vPos;



void main()
{
    vec2 pos = gl_FragCoord.xy;
    vec2 uv = gl_FragCoord.xy / u_screenSize.xy;

    gl_FragColor = vec4(1.0);
}
