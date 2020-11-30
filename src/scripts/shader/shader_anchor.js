var AnchorShader = {
   uniforms:{}, 
   vertexShader:
    `
    attribute vec3 aPos;
    attribute vec3 aNorm;
    attribute vec2 aTex;

    uniform mat4 matProj;
    uniform mat4 matCamera;
    uniform mat4 matModel;

    varying highp vec2 tuv;
    varying highp vec3 tnorm;
    varying highp vec3 tpos;

    void main()	{
       gl_Position = vec4(aPos,  1.0)*matModel;
       gl_Position = gl_Position*matCamera;
       tpos = gl_Position.xyz;
       gl_Position = gl_Position*matProj;
       tuv =aTex;
       tnorm = (vec4(aNorm, 0)*matModel*matCamera).xyz;
    }
    `,  
   pixelShader: 
   `
      precision highp float;
      precision highp int;

      uniform vec2  iResolution;
      uniform vec3  camPos;
      uniform float iTime;
      uniform float fLimit;
      uniform sampler2D uTexture;
      varying highp vec2 tuv;
      varying highp vec3 tnorm;
      varying highp vec3 tpos;

      vec3 getColor(float t){
          float r = cos((t-0.25)*3.0);
          float g = cos((t-0.5)*3.0);
          float b = cos((t-0.75)*3.0);
          return vec3(r, g, b);     
      }
      void main(void) {
         
         vec3 n =  normalize(tnorm);
         vec3 ld = normalize(vec3(1, 1, -1));
         vec3 col  = vec3(1.0, 1.0, 1.0);
         vec3 v = normalize(camPos-tpos);
         float nl = clamp(dot(n, ld), 0.5, 1.0);
         float vl = clamp(dot(n, v), 0.4, 1.0);

         col=getColor(0.6+nl*vl);
         gl_FragColor =vec4(col*fLimit, 0.9);

      }
    `      
};

export {AnchorShader};

