var AudioShader = {
   uniforms:{}, 
   pixelShader: 
   `
   #define PI 3.141592653589793
   vec3 getColor(float a){
       float r = cos(PI*(a-0.25));
       float g = cos(PI*(a-0.5));
       float b = cos(PI*(a-0.75));
       return vec3(r,g,b);
   }
   
   //this is the default main entry function
   void bar(inout vec3 col,vec2 uv,vec2 c,float height){
       float minus = abs(uv.x);
       uv-=c;
       float freq = texture2D(channel0,vec2((floor(-uv.x/0.15)+5.0)*0.001,0)).a*8.0;
       uv.x = mod(uv.x ,0.15);
       uv.x-=0.075;
       float r = 0.1/max(abs(uv.x*2.0),abs(uv.y/freq));
       r = smoothstep(0.0,1.0,pow(r,500.0));
       col += getColor(uv.y)*r;
       col -= pow(minus+0.1,200.0);
   }
   
   void mainImage( out vec4 fragColor,  in vec2 fragCoord )
   {
      // Normalized pixel coordinates (from 0 to 1)
      vec2 uv = fragCoord/iResolution.xy;
      vec2 cuv = uv -  vec2(0.5);
      cuv.x*= iResolution.x/iResolution.y;
      // Time varying pixel color
      vec3 col = vec3(0);
      
      bar(col,cuv,vec2(0.,-0.5),sin(iTime)*0.3+0.5);
      
      col = smoothstep(0., 1., col); 
      fragColor = vec4(col, 1.0);
   }
    `      
};

export {AudioShader};

