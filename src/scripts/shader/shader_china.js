var ChinaShader = {
    uniforms:{}, 
    vertexShader:
     `
     attribute vec2 aPos;
     void main()	{
        
        gl_Position = vec4( aPos, 0.0,  1.0 );
     }
     `,  
    pixelShader: 
    `
        #define BIAS 1e-15
        #define PI 3.1415926
        
        mat2 rot2D(float a){
        float c=cos(a);
        float s=sin(a);
            return mat2(
                c, -s, 
                s, c
        );
        }
        float drawSquare(vec2 uv, vec2 c){
            uv-=c;
            uv.x*=0.6;
            float v =max(abs(uv.x), abs(uv.y));
            v=0.4/v;
            
            v=pow(v, 50.);
            return v;
        }
        
        float drawCircle(vec2 uv, vec2 c, float r){
            
            float arc =atan(uv.y-c.y, uv.x-c.x+BIAS);
            vec2 sq =vec2(r*cos(arc), r*sin(arc));
            float v =0.01/length(uv-sq-c);
            return v;
        } 
        
        vec2 drawLine(vec2 uv, vec2 p1, vec2 p2){
            vec2 pline = p2-p1;
            vec2 pu = uv-p1;
            vec2 v = pu -clamp(dot(pline, pu)/dot(pline, pline), 0., 1.)*pline;
            return v;
        }
        
        float drawTriangle(vec2 uv, vec2 ct, float r, float a){
        
            vec2 v1=drawLine(uv, vec2(ct.x, ct.y+r), vec2(ct.x-r, ct.y-r));
            vec2 v2=drawLine(uv, vec2(ct.x, ct.y+r), vec2(ct.x+r, ct.y-r));
            vec2 v3=drawLine(uv, vec2(ct.x-r, ct.y-r), vec2(ct.x+r, ct.y-r));
            vec2 nv1=normalize(v1);
            vec2 nv2=normalize(v2);
            vec2 nv3=normalize(v3);
            
            float abias =0.099;
            float v =min(length(v1)-a, min(length(v2)-a, length(v3)-a));
            if(dot(nv1, nv2)<=0.&&dot(nv2, nv3)<=0.){
            v=1.;
            };
            v=0.012/abs(v);
            v=pow(v, 2.);
            return v;
        }
        
        float draw5Stars(vec2 uv, vec2 ct, float r, float a){
            uv-=ct;
            uv*=rot2D(a);
            
            vec2 p1 =vec2(r*cos(PI*0.1), r*sin(PI*0.1));
            vec2 p2 =vec2(r*cos(PI*0.5), r*sin(PI*0.5));
            vec2 p3 =vec2(r*cos(PI*0.9), r*sin(PI*0.9));
            vec2 p4 =vec2(r*cos(PI*1.3), r*sin(PI*1.3));
            vec2 p5 =vec2(r*cos(PI*1.7), r*sin(PI*1.7));
        
            
            vec2 v1=drawLine(uv, p2, p4);
            vec2 v2=drawLine(uv, p2, p5);
            vec2 v3=drawLine(uv, p4, p1);
            vec2 v4=drawLine(uv, p1, p3);
            vec2 v5=drawLine(uv, p3, p5);
            
            vec2 nv1=normalize(v1);
            vec2 nv2=normalize(v2);
            vec2 nv3=normalize(v3);
            vec2 nv4=normalize(v4);
            vec2 nv5=normalize(v5);
            
            
            float v =min(length(v1), min(length(v2), min(length(v3), min(length(v4), length(v5)))));
            v=0.0019/v;
            v=pow(v, 4.);
            
            float ref= dot(nv1, nv2)*dot(nv2, nv3)*dot(nv3, nv4)*dot(nv4, nv5)*dot(nv5, nv1);
            
            if((dot(nv1, nv2)<=0.
            &&dot(nv1, nv3)<=0.)
            ||(dot(nv4, nv5)<=0.
            &&dot(nv3, nv4)<=0.)
            ||(dot(nv5, nv2)<=0.
                &&dot(nv1, nv2)<=0.)
                
            ){
            v=10.;
            }
            return v;    
        }  
        
        vec3 drawFlag(vec2 uv, vec2 ct){
            uv-=ct;
            uv.y+=0.02*sin(26.*(uv.x*uv.y)+iTime*3.); 
            uv.x+=0.19;
            vec2 c=vec2(-0.44, 0.16);
            vec2 suv =uv-c+vec2(-0.08, 0);
            float r=0.2;
            float arc =atan(suv.y, suv.x);
            float s=0.031;
            float o =PI*0.2;
            float v = drawSquare(uv, vec2(0, 0));   
            vec3 col =vec3(v, 0, 0);
            
            
            v= draw5Stars(uv, c, 0.11, 0.);
            v+= draw5Stars(suv, vec2(r*cos(o*1.5), r*sin(o*1.5)), s, -o*1.5);
            v+= draw5Stars(suv, vec2(r*cos(o*0.5), r*sin(o*0.5)), s, -o*0.9);
            v+= draw5Stars(suv, vec2(r*cos(-o*0.5), r*sin(-o*0.5)), s, o*0.3);
            v+= draw5Stars(suv, vec2(r*cos(-o*1.5), r*sin(-o*1.5)), s, o*1.);
            
            col+=vec3(v, v, 0);
            return col;
        }
        
        void mainImage( out vec4 fragColor,  in vec2 fragCoord )
        {
            vec2 uv = fragCoord.xy / iResolution.xy-vec2(0.5);
            float as = iResolution.x/iResolution.y;
            uv.x*=as;
          
            vec3 col = drawFlag(uv, vec2(0.15, 0.0));
            
            fragColor = vec4(col, 1.0);
        }
    `      
 };
 
 export {ChinaShader};
 
 
