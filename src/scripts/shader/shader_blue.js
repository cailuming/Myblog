var DefaultShader = {
   uniforms:{}, 
   pixelShader: 
   `
   vec3 getColor(float c){
      float r = cos((c-0.75)*PI*1.66);
      float g = cos((c-0.55)*PI*1.66);
      float b = cos((c-0.25)*PI*1.66);
      return vec3(r, g, b); 
   }
   mat2 rot2D(float a){
      float c = cos(a);
      float s = cos(a);
      return mat2(c, s, -s, c); 
   }
   
   float hash1(vec2 p){
      vec2 v = vec2(PI*1453.0, exp(1.)*3054.0);
      return fract(sin(dot(p, v)*0.1)*4323.0);
   }
    
   vec2 hash2(vec2 p){
      vec2 v = vec2(hash1(p), hash1(p*p));   
      return v+v*rot2D(iTime*0.5); 
   }

   void testCurve1(inout vec3 col, vec2 cuv, vec2 c, float sh, float alpha){
      cuv-=c;
      cuv*=4.0;
      float t = iTime;
      float v =0.;
   
      float f1 = 0.0;
      float f2 = sin(cuv.x*1.0+0.5+t*1.2)*0.2;
      float v1 = pow(abs(f1-f2), 1.2); 
   
      float c1 = length(cuv-vec2(cuv.x, sh));
      float ma = max(f1, f2);
      float ec = 5.0;
      v1*=exp(-length(cuv.y-ma)*ec); 
       
      c1 /= exp(-c1);
      v+= 0.01/pow(c1+0.03, 1.3); 
      v+= v1;
    
      col += mix(col, vec3(0.2, 0.3, 0.9)*4.4, v)*alpha;
   
   }
   
   float noise2D(vec2 uv){
      vec2 p = floor(uv);
      vec2 f = fract(uv);
      vec2 e = vec2(1, 0);
      vec2 p00 = p;
      vec2 p10 = p+e;
      vec2 p11 = p+e.xx;
      vec2 p01 = p+e.yx;
      float v00 = dot(f-e.yy, hash2(p00));
      float v10 = dot(f-e.xy, hash2(p10));
      float v11 = dot(f-e.xx, hash2(p11));
      float v01 = dot(f-e.yx, hash2(p01));
       
      f = f*f*f*(f*(f*6.-15.)+10.); 
      
      return mix(mix(v00, v10, f.x), mix(v01, v11, f.x), f.y);
   }
   
   float fbm(vec2 uv){
      float am =1.0;
      float frq = 1.0;
      float ret = 0.0;
      for(int i=0;i<4;i++){
         ret+=noise2D(uv*frq)*am;
         frq*=0.5;
         am*=2.0;
         uv+=sin(0.1*float(i));
      }
      return ret/2.0;
   }
   
   void mainImage( out vec4 fragColor,  in vec2 fragCoord )
   {
       // Normalized pixel coordinates (from 0 to 1)
       vec2 uv = fragCoord/iResolution.xy;
       vec2 cuv = uv -  vec2(0.5);
       cuv.x*= iResolution.x/iResolution.y;
       // Time varying pixel color
       vec3 col = vec3(.03, 0.15+cuv.y*cos(uv.x*1.5+iTime*0.5)*0.2, 0.4);
       float sh = texture2D(uAudioSource, vec2(uv.x*0.1, 0.0)).a;
       testCurve1(col, cuv, vec2(0., -0.45), sh, 2.99);
       col = pow(col, vec3(.5));
       col=mix(col, vec3(fbm(uv*3.0+iTime)*0.2), 0.5);
       col = smoothstep(0., 1., col); 
       fragColor = vec4(col, 1.0);
   }
    `      
};

export {DefaultShader};

