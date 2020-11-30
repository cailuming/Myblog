var DepthShader = {
    vertexShader:
    `
      attribute vec3 aPos;
      attribute vec3 aNorm;
      attribute vec2 aTex;
      
      uniform mat4 matProj;
      uniform mat4 matLightView;
      uniform mat4 matModel;
      varying vec2 uv;
      varying vec3 norm;
      
      void main()	{
         gl_Position = vec4(aPos,  1.0)*matModel;
         gl_Position = gl_Position*matLightView;
         gl_Position = gl_Position*matProj;

         uv = aTex;
         norm = aNorm;
      }
    `, 

    vertexShader_I:
    `
      attribute vec3 aPos;
      attribute vec3 aNorm;
      attribute vec2 aTex;
      attribute mat4 aMatrix;

      uniform mat4 matProj;
      uniform mat4 matLightView;
      varying vec2 uv;
      varying vec3 norm;
      
      void main()	{
         gl_Position = vec4(aPos,  1.0)*aMatrix;
         gl_Position = gl_Position*matLightView;
         gl_Position = gl_Position*matProj;
         uv = aTex;
         norm = aNorm;
      }
    `, 

    pixelShader:
    `  precision highp float;
       precision highp int;
     
       void main(void) {
         gl_FragColor =vec4(1.0);
       }
    `
};

export {DepthShader};

