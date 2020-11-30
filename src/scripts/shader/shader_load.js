var LoadShader = {
   uniforms:{},
   vertexShader:
    `
    attribute vec2 aPos;
    void main()	{
       
       gl_Position = vec4( aPos,0.0, 1.0 );
    }
    `, 
   pixelShader: 
   `
   #define PI 3.1415926
    precision highp float;
    precision highp int;
    uniform vec2 iResolution;
    uniform vec4 iSound;
    uniform float iTime;
    uniform float fLimit;
     
    uniform vec3 lightPos;
    uniform mat4 matView;
    uniform mat4 matProj;
    uniform mat4 matProjInv;
    uniform mat4 matViewInv;
    uniform mat4 matLightView;
   
    uniform sampler2D uTexture;
    uniform sampler2D uDepthBuffer;
    uniform sampler2D uLightDepthBuffer;
    varying  vec2 ttex;
   mat2 rot2D(float a){
      float c = cos(a);
      float s = sin(a);
      return mat2(c,s,-s,c); 
   }

   vec3 getColor(float c){
      float r = cos((c-0.25)*3.);
      float g = cos((c-0.55)*3.);
      float b = cos((c-0.75)*3.);
      
      return vec3(r,g,b);
   }

   float hash1(float x){
      return fract(sin(dot(vec2(x),vec2(3.1233*x,-3.2345+x)))*1000.0);
   }

   float hash1(vec2 uv){
      float u = hash1(uv.x);
      float v = fract(sin(dot(vec2(uv.y,u),vec2(3.1234342,1.234554)))*10000.0);
      return  v;
   }
   
   vec2 hash2(vec2 uv){
      float u = hash1(uv.x);
      float v = fract(sin(dot(vec2(uv.y,u),vec2(3.1234342,1.2345554)))*10000.0);
      vec2 nv = vec2(u,v);
      nv *= rot2D(iTime*70.3+length(uv+u));
      return  nv;
   }

   float rand(vec2 n) {
      return fract(sin(cos(dot(n, vec2(12.9898,12.1414)))) * 83758.5453);
   }

   float noise(vec2 n) {
      const vec2 d = vec2(0.0, 1.0);
      vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
      return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
   }

   float fbm(vec2 n) {
      float total = 0.0, amplitude = 1.4;
      for (int i = 0; i <4; i++) {
         total += noise(n+float(i)+iTime*10.) * amplitude;
         n += n*0.5;
         amplitude *= 0.5;
      }
      return total;
   }

   void drawCircle(inout vec3 col,vec2 uv,vec2 c,float agle)
   {
      uv-=c;
      uv*=rot2D(PI*agle);
      uv.x*=0.5;
      uv.y*=(sin(iTime*3.)*0.8+1.5);
      float theta = atan(uv.y,uv.x);
      float r = cos(theta*1.3)*0.02; 
      vec2 formula =   vec2(r*cos(theta),r*sin(theta));
      float v = length(uv-formula);
      col+= (0.003/v)*getColor(.32);
   }

   void drawLine(inout vec3 col,vec2 uv,vec2 suv,vec2 startP,vec2 endP,float cv){
      vec2 lineDir=endP-startP;
      vec2 fragDir=uv-startP;
      // keep the line coefficient bewteen [0,1] so that the projective dir on the 
      // lineDir will not exceed or we couldn't get a line segment but a line.
      float lineCoe=clamp(dot(lineDir,fragDir)/dot(lineDir,lineDir),0.,1.0);
                        
      vec2 projDir=lineCoe*lineDir;
      
      vec2 fragToLineDir= fragDir- projDir;
      float v=length(fragToLineDir);
      v =0.01/(v+0.00001);
      v = pow(v,1.2);
      col+=getColor(cv)*v;
   }

   void drawIconF(inout vec3 col,vec2 uv,vec2 suv,vec2 c,float snum,float r )
   {
      uv-=c;
      uv*=2.0;
      uv*=rot2D(PI*1.5);
      float theta = atan(uv.y,uv.x);
      float num = 2.0*PI/(snum+sin(length(uv)*5.-0.3));
      
      float inter = mod(theta,num)-0.5*num;
      float r1 = length(vec2(inter))+0.5;
      r1*=r; 
      vec2 formula =   vec2(r1*cos(theta),r1*sin(theta));
      float v = length(uv-formula);
      col+= ((0.03+sin(iTime)*0.01)/v)*getColor(.75);
      
      vec3 fc = vec3(0);
      for(float i=0.0;i<2.0;i++){
         suv *= rot2D(i*PI*0.2);
         v    = smoothstep(0.,0.8,(fbm((suv+i)*28.)*v))*5.;
         fc+=getColor(-v*0.1+0.1);
      }
      
      col+=mix(col,fc,0.7)*1.5;
   }
  
   void mainImage( out vec4 fragColor, in vec2 fragCoord )
   {
      vec2 uv = fragCoord.xy / iResolution.xy-vec2(0.5);
      uv*=1.6;
      uv.y-=0.1;
      float aspect=iResolution.x/iResolution.y;
      
      vec3 screenP=vec3(uv.x*aspect,uv.y,0);
      vec3 col =vec3(0);
      float progress_stride = 1.5;
      drawIconF(col,screenP.xy,uv,vec2(0.,-0.0),5.,0.5);
      drawCircle(col,screenP.xy,vec2(-0.01,0.15),4.9);
      drawCircle(col,screenP.xy,vec2(0.01,0.15),0.11);
      drawLine(col,screenP.xy,uv,vec2(-0.5*progress_stride,-0.65),vec2(0.5*progress_stride,-0.65),0.7);
      drawLine(col,screenP.xy,uv,vec2(-0.5*progress_stride,-0.65),vec2((-0.5+fLimit)*progress_stride,-0.65),0.2);
      col = smoothstep(0.0,1.0,col);
      fragColor = vec4(col,1.);
   }
    void main(){
       mainImage(gl_FragColor,gl_FragCoord.xy);
    }
    `      
};

export {LoadShader};

