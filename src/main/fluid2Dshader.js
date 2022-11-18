

export function getFragmentShader() {
    return `
        uniform vec2 u_screenSize;
        uniform float u_time;
        uniform sampler2D u_texture;    // this texture holds rendering from the previous frame
        uniform sampler2D u_noise;      // this is noise texture reference
        varying vec3 vPos;
        
        const int RotNum = 5;
        
        const float ang = 2.0*3.1415926535/float(RotNum);
        
        mat2 m = mat2(cos(ang), sin(ang), -sin(ang), cos(ang));
        mat2 mh = mat2(cos(ang*0.5), sin(ang*0.5), -sin(ang*0.5), cos(ang*0.5));
        
        vec4 randS(vec2 uv)
        {
            return texture(u_noise, uv * u_screenSize.xy / u_screenSize.xy) - vec4(0.5);
        }
        
        float getRot(vec2 pos, vec2 b)
        {
            vec2 p = b;
            float rot=0.0;
            for (int i = 0; i < RotNum; i++)
            {
                // rot+=dot(texture(u_texture,fract((pos+p)/u_screenSize.xy)).xy-vec2(0.5),p.yx*vec2(1,-1));
        
                vec2 texelCoord = fract((pos + p) / u_screenSize.xy);
        
                vec4 prevTexel = texture(u_texture, texelCoord);
        
                vec2 rotor = p.yx * vec2(0, 1);
        
                rot += 3.0 * dot(prevTexel.xy, rotor);
        
                p = m*p;
            }
            return rot / float(RotNum) / dot(b, b);
        }
        
        void main()
        {
            vec2 pos = gl_FragCoord.xy;
            vec2 uv = gl_FragCoord.xy / u_screenSize.xy;
        
            // TODO: iFrame -> u_time (Correct ?)
            float rnd = randS(vec2(float(u_time) / u_screenSize.x, 0.5 / u_screenSize.y)).x;
        
            rnd = 0.0;
        
            vec2 b = vec2(cos(ang*rnd), sin(ang*rnd));
            vec2 v=vec2(0);
        
            float bbMax= 1.0 * u_screenSize.y;
            bbMax*=bbMax;
        
            for (int l=0;l < 10;l++)
            {
                if (dot(b, b) > bbMax) break;
                vec2 p = b;
                for (int i=0;i<RotNum;i++)
                {
                    v+=p.yx*getRot(pos + p, b);
                    p = m*p;
                }
                b *= 3.0;
            }
        
            vec2 f = fract((pos + v * vec2(1, -1)) / u_screenSize.xy);
        
            gl_FragColor = texture(u_texture, f);
        
            if (u_time <= 0.01) {
                if ((uv.x >= 0.45 && uv.x <= 0.55) && (uv.y >= 0.45 && uv.y <= 0.55)) {
                    gl_FragColor = vec4(0.0, 0.0, 0.2, 1.0);
                }
                else {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                }
            }
        
        }
    `;
}