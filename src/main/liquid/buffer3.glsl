uniform vec2 u_screenSize;
uniform float u_time;
uniform sampler2D u_texture;// this texture holds rendering from the previous frame
varying vec3 vPos;

void main() {
    vec2 uv = gl_FragCoord.xy / u_screenSize.xy;
    gl_FragColor = texture(u_texture, uv);
}