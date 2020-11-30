var CanvasShader = {
   uniforms:{}, 
   vertexShader:
    `
    attribute vec2 aPos;
    attribute vec2 aTex;
    varying  vec2 ttex;
    void main()	{
       ttex = aTex;
       gl_Position = vec4( aPos, 0.0,  1.0 );
    }
    `,  
   pixelShader: 
   `
    precision highp float;
    precision highp int;
    #define PI 3.1415926
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

    float getCameraZFromNDC( const in float ndcz,  const in float near,  const in float far ) {
       return  2.0*( near * far ) / ( far*(1.0-ndcz)+near*(1.0+ndcz));
    }

    vec3 getCameraPosFromNDC( const in vec2 spos, float zw) {
      float as = iResolution.x/iResolution.y;
      return vec3(spos.x*as*tan(PI/8.0)*zw, spos.y*tan(PI/8.0)*zw, zw);
    }

    float DepthToNdcZ( const in float depth) {
      return depth*2.0-1.0;
    }

    float NdcZToDepth( const in float ndcz) {
      return (ndcz+1.0)*0.5;
    }

    float gaussianPdf(in float x,  in float sigma) { 
      return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma; 
    } 
    void blur(inout vec4 col){
         float kernal[10];
         float tweight = 0.0;
         for(int i=-5;i<5;i++){
              kernal[5+i] = gaussianPdf(float(i), 17.0);
         }

         for(int i=0;i<10;i++){
           for(int j=0;j<10;j++){
              col.xyz+= texture2D(uTexture, ttex+vec2(float(j)/iResolution.x, float(i)/iResolution.y)).xyz*kernal[i]*kernal[j];
              tweight+=kernal[i]*kernal[j];
            }
         }
    }

    void processShadow(inout vec4 col){
      vec3 cp = vec3(matView[3][0], matView[3][1], matView[3][2]);
      vec3 cd = vec3(matView[0][2], matView[1][2], matView[2][2]);
      
      float depth = texture2D(uDepthBuffer, ttex).x;
      if(depth>=0.9999) return;
      float dw = getCameraZFromNDC(DepthToNdcZ(depth), 0.1, 1000.0);
      vec3 cpos = getCameraPosFromNDC(ttex*2.0-1.0, dw);
      vec3 wpos =(vec4(cpos, 1.0)*matViewInv).xyz;
      
      vec4 lpos = vec4(wpos, 1.0)*matLightView;
      vec4 lprojpos = lpos*matProj; lprojpos.xyz /=lprojpos.w;
      vec3 lscnuv = (lprojpos.xyz+1.0)*0.5;
 
      float ds =0.0;
      for(float i=0.0;i<4.0;i++){
        for(float j=0.0;j<4.0;j++){
          ds+= texture2D(uLightDepthBuffer, clamp(lscnuv.xy+vec2(i*0.001, j*0.001), 0.0, 1.0)).x; 
        }
      }
      
      float dl = getCameraZFromNDC(DepthToNdcZ(ds/16.0), 0.1, 1000.0);
     
      if(lpos.z>dl+0.09){
          float dis = smoothstep(0.0, 2.0, abs(lpos.z-dl));
          float softness_probability = 1.0 / (1.0 + dis * dis ); // Chebeyshevs inequality
          softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ),  0.0,  1.0 ); // 0.3 reduces light bleed
          softness_probability = clamp( max( 0.0009,  softness_probability ),  0.0,  1.0 );
          col.xyz *=softness_probability;//(pow(dis, 4.5)+1.0);
      }
      
       
    }
    void main(){
      vec4 col = vec4(0); 
      
      col = FxaaPixelShader(
		    ttex, 
		    vec4(0.0), 
		    uTexture, 
		    uTexture, 
		    uTexture, 
		    1.0/iResolution, 
		    vec4(0.0), 
		    vec4(0.0), 
		    vec4(0.0), 
		    0.75, 
		    0.166, 
		    0.0823, 
		    0.0, 
		    0.0, 
		    0.0, 
		    vec4(0.0));
      // float depth = texture2D(uDepthBuffer, ttex).x;
       
      // float dw = getCameraZFromNDC(DepthToNdcZ(depth), 0.1, 1000.0);
      // vec3 fogc = mix(vec3(0.5, 0.5, 0.5), vec3(0.0, 0.4, 1.2), 1.0-exp(-1.0*ttex.y*ttex.y));
      // col.xyz = mix(col.xyz, fogc, 1.0-exp(-dw*dw*0.00002));
      
      gl_FragColor = col;
      gl_FragColor.a = texture2D(uTexture,  ttex).a;
    }
   `      
};

export {CanvasShader};

