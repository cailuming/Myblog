var DefaultShader = {
   uniforms:{}, 
   fragTitle:`
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float fLimit;
      uniform sampler2D channel0;
      uniform sampler2D channel1;
      uniform sampler2D channel2;
      uniform sampler2D channel3;
   `,
   fragTail: `
     void main()	{
        mainImage(gl_FragColor, gl_FragCoord.xy);
     }
  `,
   pixelShader: 
`//this is the default main entry function
void mainImage( out vec4 fragColor,  in vec2 fragCoord )
{
   // Normalized pixel coordinates (from 0 to 1)
   vec2 uv = fragCoord/iResolution.xy;
   vec2 cuv = uv -  vec2(0.5);
   cuv.x*= iResolution.x/iResolution.y;
   // Time varying pixel color
   vec3 col = vec3(sin(cuv.x+iTime)*0.5+0.5, cuv.y*cos(cuv.x*1.5+iTime*0.5)*0.5+0.4, 0.4);
   col = smoothstep(0., 1., col); 
   fragColor = vec4(col, 1.0);
}`,
 texShader:`
   void mainImage( out vec4 fragColor,  in vec2 fragCoord )
   {
      // Normalized pixel coordinates (from 0 to 1)
      vec2 uv = fragCoord/iResolution.xy;
      vec3 col = texture2D(channel0,uv).xyz;
      col = smoothstep(0., 1., col); 
      fragColor = vec4(col, 1.0);
   }  
 `,
          
};

export {DefaultShader};

