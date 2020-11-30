var QuadShader = {
   uniforms:{},
   vertexShader:
    `
    attribute vec3 aPos;
    attribute vec2 aTex;
    uniform mat4 matModel;
    varying  vec2 tuv;
    void main()	{
       tuv = aTex;
       gl_Position = vec4( aPos,1.0 )*matModel;
       gl_Position.z=0.001;
    }
    `, 
   pixelShader: 
   `
   #define PI 3.1415926
   precision highp float;
   precision highp int;

   uniform vec2  iResolution;
   uniform vec3  camPos;
   uniform float iTime;
   uniform float fLimit;
   uniform sampler2D uTexture;
   uniform sampler2D uAudioSource;
   varying highp vec2 tuv;
   varying highp vec3 tnorm;
   varying highp vec3 tpos;

   void main()
   {
       vec4 col = texture2D(uTexture,tuv);
       gl_FragColor = col;
   }
    `      
};

export {QuadShader};

