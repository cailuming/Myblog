var ScreenShader = {
   uniforms:{},

   pixelShader: 
   `
      uniform vec2  iResolution;
      uniform vec3  camPos;
      uniform float iTime;
      uniform float fLimit;
      uniform vec3 diffuseColor;
      uniform vec3 specColor; 
      uniform float roughness;
      uniform float tex;
     
      uniform sampler2D uTexture;
      uniform sampler2D normTexture;
      uniform sampler2D roughTexture;
      uniform sampler2D aoTexture;
      uniform sampler2D uAudioSource;
      uniform sampler2D depthTexture;

      in vec2 tuv;
      in vec3 tnorm;
      in vec3 wpos;
      in vec3 lightp;
      in vec4 lvpos;
      out vec4 color;
      
      float getCameraZFromNDC( const in float ndcz, const in float near, const in float far ) {
        return  2.0*( near * far ) / ( far*(1.0-ndcz)+near*(1.0+ndcz));
      }

      float DepthToNdcZ( const in float depth) {
        return depth*2.0-1.0;
      }

      float shadow(){
        float ret =1.0;
        vec3 lightViewPos = lvpos.xyz/lvpos.w;  
        float limit = dot(normalize(lightp),vec3(0,1,0));
        if(limit<=0.1) return ret;
        vec3 lscnuv = (lightViewPos+1.0)*0.5;
        float depth = texture(depthTexture,lscnuv.xy).x;
        float retv = 0.0;
        for(int i=0;i<4;i++){
          for(int j=0;j<4;j++){
             retv= texture(depthTexture,lscnuv.xy+vec2(1.0*float(i)/iResolution.x,1.0*float(j)/iResolution.y)).x;
             if(lscnuv.z>=retv+0.0000025){
                ret+=0.5;
             }else{
                ret+=1.0;
             }
          }    
        }
      
        return ret/16.0;
      }
      void main(void) {
         float nl = 0.0;
         float stride =60.0;
         vec3 n = normalize(tnorm);
         vec3 l = normalize(lightp);
       
         vec3 v = normalize(-wpos);
         vec3 h = normalize(v+l);
         vec3 col = vec3(0.0,0.0,0.0);
         vec3 diffc = diffuseColor;
         vec3 specc = specColor;
         vec3 basec = texture(uTexture,tuv*stride).xyz;
         vec3 aoc = texture(aoTexture,tuv*stride).xyz;
         vec3 norm = texture(normTexture,tuv*stride).xyz;
         vec3 rf =  texture(roughTexture,tuv*stride).xyz;
         if(length(basec)<=0.0){
            basec=vec3(0.8,0.9,1.0);   
         }

         if(length(aoc)<=0.0){
            aoc=vec3(1.0);   
         }

         if(length(norm)>0.0){
            n =PerturbNormal(wpos, n, norm,tuv, true);
         }

         if(length(rf)<=0.0){
             rf.x = roughness;
         }

         vec3 rl = reflect(n,l);
         
         SurfaceReflectanceInfo sinfo;
         sinfo.roughness = length(rf.x);
         sinfo.reflectance0 = specc;
         sinfo.diffuseColor = diffc;
         
         BRDF(l,n,v,sinfo,diffc,specc,nl);
         col = (diffc+specc);
         col *= basec*aoc*nl*shadow();
        
         col = smoothstep(0.,1.,col);
        
         color =vec4(col*fLimit,1);

      }
    `      
};

export {MeshShader};

