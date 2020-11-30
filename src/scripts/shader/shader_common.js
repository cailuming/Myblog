var CommonShader = {
 
   vertexShader_2d:
    `
    attribute vec3 aPos;
    attribute vec2 aTex;
    varying  vec2 ttex;
    void main()	{
       ttex = aTex;
       gl_Position = vec4( aPos,  1.0 );
    }
    `,  
    vertexShader_3d:
    `
    attribute vec3 aPos;
    attribute vec3 aNorm;
    attribute vec2 aTex;
    uniform vec3 lightpos;
    uniform mat4 matProj;
    uniform mat4 matCamera;
    uniform mat4 matModel;
    uniform mat4 matLightView;

    varying highp vec2 tuv;
    varying highp vec3 tnorm;
    varying highp vec3 wpos;
    varying highp vec4 lvpos;
    varying highp vec3 lightp;
    varying highp vec3 lightpp;
    void main()	{
       gl_Position = vec4(aPos,  1.0)*matModel;
       gl_Position = gl_Position*matCamera;
       wpos = gl_Position.xyz;

       gl_Position = gl_Position*matProj;
       
       tuv =aTex;

       lvpos = vec4(aPos,  1.0)*matModel*matLightView*matProj;
       lightp = (vec4(lightpos, 0.0)*matCamera).xyz;
       lightpp = lightpos;

       tnorm = (vec4(aNorm, 0)*matModel*matCamera).xyz;
    }
    `, 
    // glsl es 3.0
    vertexShader_3d_es:
    `#version 300 es
    in vec3 aPos;
    in vec3 aNorm;
    in vec2 aTex;

    uniform mat4 matProj;
    uniform mat4 matCamera;
    uniform mat4 matModel;
    uniform mat4 matLightView;
    uniform vec3 lightpos;
    
    out highp vec2 tuv;
    out highp vec3 tnorm;
    out highp vec3 wpos;
    out highp vec4 lvpos;
    out highp vec3 lightp;
    out highp vec3 lightpp;
    void main()	{
       gl_Position = vec4(aPos,  1.0)*matModel*matCamera;
       
       wpos = gl_Position.xyz;
       gl_Position = gl_Position*matProj;
       tuv =aTex;

       lvpos = vec4(aPos,  1.0)*matModel*matLightView*matProj;
       lightp = (vec4(lightpos, 0.0)*matCamera).xyz;
       lightpp = lightpos;

       tnorm = (vec4(aNorm, 0)*matModel*matCamera).xyz;
    }
    `,  
   vertexShader_3d_I:
     `#version 300 es
      in vec3 aPos;
      in vec3 aNorm;
      in vec2 aTex;
      in mat4 aMatrix;

      uniform mat4 matProj;
      uniform mat4 matCamera;
      uniform mat4 matLightView;
      uniform vec3 lightpos;

      out highp vec2 tuv;
      out highp vec3 tnorm;
      out highp vec3 wpos;
      out highp vec4 lvpos;
      out highp vec3 lightp;
      out highp vec3 lightpp;
      void main()	{
         gl_Position = vec4(aPos,  1.0)*aMatrix*matCamera;
         wpos = gl_Position.xyz;
        
         gl_Position= gl_Position*matProj;
         tuv =aTex;
         lvpos = vec4(aPos,  1.0)*aMatrix*matLightView*matProj;
         lightp = (vec4(lightpos, 0.0)*matCamera).xyz;
         lightpp = lightpos;
         tnorm = (vec4(aNorm, 0)*aMatrix*matCamera).xyz;
      }
   `, 

   vertexShader_3d_2I:
   `attribute vec3 aPos;
    attribute vec3 aNorm;
    attribute vec2 aTex;
    attribute mat4 aMatrix;

    uniform mat4 matProj;
    uniform mat4 matCamera;
    uniform mat4 matLightView;
    uniform vec3 lightpos;

    varying highp vec2 tuv;
    varying highp vec3 tnorm;
    varying highp vec3 wpos;
    varying highp vec4 lvpos;
    varying highp vec3 lightp;
    varying highp vec3 lightpp;
    void main()	{
       gl_Position = vec4(aPos,  1.0)*aMatrix*matCamera;
       wpos = gl_Position.xyz;
      
       gl_Position= gl_Position*matProj;
       tuv =aTex;
       lvpos = vec4(aPos,  1.0)*aMatrix*matLightView*matProj;
       lightp = (vec4(lightpos, 0.0)*matCamera).xyz;
       lightpp = lightpos;
       tnorm = (vec4(aNorm, 0)*aMatrix*matCamera).xyz;
    }
 `, 

   pbr_pixelShader:
   `#version 300 es
   precision highp float;
   precision highp int;
   #define PI 3.141592653589793
   struct AngularInfo
   {
       float NL;
       float NV;
       float NH;
       float LH;
       float VH;
   };

   struct SurfaceReflectanceInfo
   {
       float roughness;
       vec3 reflectance0;
       vec3 reflectance90;
       vec3 diffuseColor;
   };

   AngularInfo GetAngularInfo(vec3 ld, vec3 norm, vec3 view){
      vec3 n = normalize(norm);
      vec3 v = normalize(view);
      vec3 l = normalize(ld);
      vec3 h = normalize(l+v);

      AngularInfo info;
      info.NL = clamp(dot(n, l), 0.3, 1.0);
      info.NV = clamp(dot(n, v), 0.0, 1.0);
      info.NH = clamp(dot(n, h), 0.0, 1.0);
      info.LH = clamp(dot(l, h), 0.0, 1.0);
      info.VH = clamp(dot(v, h),  0.0,  1.0);

      return info;
   }

   vec3 LambertianDiffuse(vec3 cdiff)
   {
      return cdiff/PI;
   }

   vec3 F_Schlick( vec3 SpecularColor,  float LH )
   {
       //float Fc = pow( clamp(1.0 - LH, 0.0, 1.0), 5.0);					// 1 sub,  3 mul
       // Optimized variant (presented by Epic at SIGGRAPH '13)
       // https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf

       float Fc = exp2( ( -5.55473 * LH - 6.98316 ) * LH );
       return ( 1.0 - SpecularColor ) * Fc + SpecularColor;
   }

   float SmithGGX(float NL, float NV, float AlphaRoughness){
      float aa = AlphaRoughness*AlphaRoughness;
      float GGXV = NL *sqrt(max(NV*NV*(1.0-aa)+aa, 1e-7));
      float GGXL = NV *sqrt(max(NL*NL*(1.0-aa)+aa, 1e-7));
      return 0.5/(GGXV+GGXL);
  }
  
  float NormalDistribution_GGX(float NH, float AlphaRoughness){
      float aa= AlphaRoughness*AlphaRoughness;
      float f = NH*NH*(aa-1.0)+1.0;
      return aa/(PI*f*f);
  }

  // https://github.com/google/filament/blob/master/shaders/src/brdf.fs#L94
  float D_Charlie(float roughness,  float NoH) {
     // Estevez and Kulla 2017,  "Production Friendly Microfacet Sheen BRDF"
     float invAlpha  = 1.0 / roughness;
     float cos2h = NoH * NoH;
     float sin2h = max(1.0 - cos2h,  0.0078125); // 2^(-14/2),  so sin2h^2 > 0 in fp16
     return (2.0 + invAlpha) * pow(sin2h,  invAlpha * 0.5) / (2.0 * PI);
  }

 // https://github.com/google/filament/blob/master/shaders/src/brdf.fs#L136
 float V_Neubelt(float NoV,  float NoL) {
     // Neubelt and Pettineo 2013,  "Crafting a Next-gen Material Pipeline for The Order: 1886"
     return clamp(1.0 / (4.0 * (NoL + NoV - NoL * NoV)), 0.0, 1.0);
 }
  
  void BRDF(in vec3 pointToLight, 
            in vec3 norm, 
            in vec3 view, 
            in SurfaceReflectanceInfo sinfo, 
            out vec3 diffc, 
            out vec3 specc, 
            out float nl)
  {
      AngularInfo angularInfo = GetAngularInfo(pointToLight, norm, view);
      diffc = vec3(0.0, 0.0, 0.0);
      specc = vec3(0.0, 0.0, 0.0);
      nl    = angularInfo.NL;
  
      if(angularInfo.NL>0.0 || angularInfo.NV>0.0)
      {
          float roughness = sinfo.roughness *sinfo.roughness;
          float D = NormalDistribution_GGX(angularInfo.NH, roughness);
          float Vis = SmithGGX(angularInfo.NL, angularInfo.NV, roughness);
          vec3 F = F_Schlick(sinfo.reflectance0, angularInfo.LH);
          diffc = (1.0-F)*LambertianDiffuse(sinfo.diffuseColor);
          specc = F*Vis*D;
      }
  }

 vec3 PerturbNormal(in vec3 Position,  in vec3 Normal,  in vec3 TSNormal,  in vec2 UV,  bool HasUV)
 {
 // Retrieve the tangent space matrix
    vec3 pos_dx = dFdx(Position);
    vec3 pos_dy = dFdy(Position);

    float NormalLen = length(Normal);
    vec3 ng;
    if (NormalLen > 1e-5)
    {
        ng = Normal/NormalLen;
    }
    else
    {
        ng = -normalize(cross(pos_dx,  pos_dy));
    }

    if (HasUV)
    {
     vec2 tex_dx = dFdx(UV);
     vec2 tex_dy = dFdy(UV);
     vec3 t = (tex_dy.y * pos_dx - tex_dx.y * pos_dy) / (tex_dx.x * tex_dy.y - tex_dy.x * tex_dx.y);

     t = normalize(t - ng * dot(ng,  t));
     vec3 b = normalize(cross(t,  ng));
     mat3 tbn =mat3(t,  b,  ng);

     TSNormal = 2.0 * TSNormal - vec3(1.0,  1.0,  1.0);
     return normalize(tbn*TSNormal);
   }
   else
   {
     return ng;
   }
  }
   
   `, 
  
};

export {CommonShader};

