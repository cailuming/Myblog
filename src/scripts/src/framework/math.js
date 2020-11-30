var math3D ={
    
   identityMatrix(m){
       m[0]=1; m[1]=0;  m[2]=0; m[3] =0;
       m[4]=0; m[5]=1;  m[6]=0; m[7]=0;
       m[8]=0; m[9]=0;  m[10]=1;m[11]=0;
       m[12]=0;m[13]=0; m[14]=0;m[15]=1;
   },
   cross(a,b){
     return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
   },

   normalize(inv){
      var len = this.len(inv);
      return [inv[0]/len,inv[1]/len,inv[2]/len];
   },

   dot(v1,v2){
      return v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2];
   },

   len(v){
      return Math.sqrt(this.dot(v,v));
   },

   sinc(x,k )
   {
     var a = Math.PI*((k*x-1.0))+0.00001;
     return  Math.sin(a)/a;
   },

   mul_Vector4_Matrix(out,v,m){
      out[0] = v[0]*m[0]+v[1]*m[1]+v[2]*m[2]+v[3]*m[3];
      out[1] = v[0]*m[4]+v[1]*m[5]+v[2]*m[6]+v[3]*m[7];
      out[2] = v[0]*m[8]+v[1]*m[9]+v[2]*m[10]+v[3]*m[11];
      out[3] = v[0]*m[12]+v[1]*m[13]+v[2]*m[14]+v[3]*m[15];
   },

   mul_Vector3_Matrix(out,v,m){
      out[0] = v[0]*m[0]+v[1]*m[1]+v[2]*m[2]
      out[1] = v[0]*m[4]+v[1]*m[5]+v[2]*m[6]
      out[2] = v[0]*m[8]+v[1]*m[9]+v[2]*m[10]
      out[3] = v[0]*m[12]+v[1]*m[13]+v[2]*m[14]
   },
    
   inverseMatrix(me) {
      // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
         var te =[];
         
         var n11 = me[ 0 ];var n21 = me[ 1 ]; var n31 = me[ 2 ]; var n41 = me[ 3 ];
         var n12 = me[ 4 ]; var n22 = me[ 5 ]; var n32 = me[ 6 ]; var n42 = me[ 7 ];
         var n13 = me[ 8 ]; var n23 = me[ 9 ]; var n33 = me[ 10 ]; var n43 = me[ 11 ];
         var n14 = me[ 12 ]; var n24 = me[ 13 ]; var n34 = me[ 14 ]; var n44 = me[ 15 ];

         var t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
         var t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
         var t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
         var t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

         var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

         if ( det === 0 ) {
            var msg = "THREE.Matrix4: .getInverse() can't invert matrix, determinant is 0";
            console.warn( msg );
            return;
         }

         var detInv = 1 / det;

         te[ 0 ] = t11 * detInv;
         te[ 1 ] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
         te[ 2 ] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
         te[ 3 ] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;

         te[ 4 ] = t12 * detInv;
         te[ 5 ] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
         te[ 6 ] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
         te[ 7 ] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;

         te[ 8 ] = t13 * detInv;
         te[ 9 ] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
         te[ 10 ] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
         te[ 11 ] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;

         te[ 12 ] = t14 * detInv;
         te[ 13 ] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
         te[ 14 ] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
         te[ 15 ] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;
         return te;
   },
   perspectiveMatrix(fov,aspect,near,far){
       var t = 1/Math.tan(fov/2);
       var nf = 1/(far-near);
       var x = t/aspect;
       var y = t;
       var a = (far+near)*nf;
       var d = 2*near*far*nf;
      
       return [
           x, 0, 0, 0,
           0, y, 0, 0,
           0, 0, a, -d,
           0, 0, 1, 0
       ]; 
   },

   OrthMatrix( left, right, top, bottom, near, far ) {
	
		var w = 1.0 / ( right - left );
		var h = 1.0 / ( top - bottom );
		var p = 1.0 / ( far - near );

		var x = ( right + left ) * w;
		var y = ( top + bottom ) * h;
		var z = ( far + near ) * p;

		return [
         2 * w,   0,    0,   -x,
         0,     2*h,    0,   -y,
         0,       0, -2*p,   -z,
         0,       0,    0,    1 
      ];
	},

   lookAtMatrix(eye,tar,up){
      var m = [];
      var look  = this.normalize([tar[0]-eye[0],tar[1]-eye[1],tar[2]-eye[2]]);
      var right = this.normalize(this.cross(up,look));
      up    = this.normalize(this.cross(look,right));

      m[0] = right[0]; m[1] = right[1]; m[2]  = right[2];m[3]  = -this.dot(eye,right);
      m[4] = up[0];    m[5] = up[1];    m[6]  = up[2];   m[7]  = -this.dot(eye,up);
      m[8] = look[0];  m[9] = look[1];  m[10] = look[2]; m[11] = -this.dot(eye,look);
      m[12] = 0;       m[13]= 0;        m[14] = 0;       m[15] = 1;

      return m;
   },

   rotateXMatrix(out,v){
      out[0]= 1;            out[1]= 0;            out[2]= 0;              out[3] = 0;
      out[4]= 0;            out[5]= Math.cos(v);  out[6]= -Math.sin(v);   out[7] = 0;
      out[8]= 0;            out[9]= Math.sin(v);  out[10]= Math.cos(v);   out[11] = 0;
      out[12]= 0;           out[13]= 0;           out[14]= 0;             out[15] = 1;
   },
   rotateYMatrix(out,v){
      out[0]= Math.cos(v);  out[1]= 0;            out[2]= -Math.sin(v); out[3] = 0;
      out[4]= 0;            out[5]= 1;            out[6]= 0;            out[7] = 0;
      out[8]= Math.sin(v);  out[9]= 0;            out[10]= Math.cos(v); out[11] = 0;
      out[12]= 0;           out[13]= 0;           out[14]= 0;           out[15] = 1;
   },
   rotateZMatrix(out,v){
      out[0]= Math.cos(v);    out[1]=-Math.sin(v);  out[2]= 0;            out[3] = 0;
      out[4]= Math.sin(v);    out[5]= Math.cos(v);  out[6]= 0;            out[7] = 0;
      out[8]= 0;              out[9]= 0;            out[10]= 1;           out[11] = 0;
      out[12]=0;              out[13]= 0;           out[14]= 0;           out[15] = 1;
   },
   //rotation matrix 
   rotateAxisMatrix(out,axi,v){
      let axis = normalize(axi);
      let sinv = Math.sin(v);
      let cosv = Math.cos(v);
      let one_minus_cosv = 1-cosv;

      out[0]= 1+one_minus_cosv*(axis.x*axis.x-1); 
      out[1]= axis.z*sinv+one_minus_cosv*axis.x*axis.y; 
      out[2]=-axis.y*sinv + one_minus_cosv*axis.x*axis.z; 
      out[3]= 0;

      out[4]= -axis.z*sinv+one_minus_cosv*axis.y*axis.x; 
      out[5]= 1+one_minus_cosv*(axis.y*axis.y-1); 
      out[6]= axis.x*sinv+one_minus_cosv*axis.y*axis.z; 
      out[7]= 0;

      out[8]= axis.y*sinv+one_minus_cosv*axis.z*axis.x; 
      out[9]= -axis.x*sinv+one_minus_cosv*axis.z*axis.y; 
      out[10]= 1+one_minus_cosv*(axis.z*axis.z-1); 
      out[11]= 1;
   },

   scaleMatrix(out,scale){

      out[0] =scale[0];  out[1] =  0;          out[2] =  0;        out[3] =  0;
      out[4] = 0;        out[5] =  scale[1];   out[6] =  0;        out[7] =  0;
      out[8] = 0;        out[9] =  0;          out[10]=  scale[2]; out[11]=  0;
      out[12]= 0;        out[13]=  0;          out[14]=  0;        out[15]=  1;
   },

   transMatrix(out,pos){
      out[0] =  1;out[1] =  0; out[2] =  0; out[3] =  pos[0];
      out[4] =  0;out[5] =  1; out[6] =  0; out[7] =  pos[1];
      out[8] =  0;out[9] =  0; out[10]=  1; out[11]=  pos[2];
      out[12]=  0;out[13]=  0; out[14]=  0; out[15]=  1;
   },

   //row_major_mul 
   mul_Matrix_Matrix(out,o1,o2){
      
       out[0] = o1[0]*o2[0]+o1[1]*o2[4]+o1[2]*o2[8] +o1[3]*o2[12];
       out[1] = o1[0]*o2[1]+o1[1]*o2[5]+o1[2]*o2[9] +o1[3]*o2[13];
       out[2] = o1[0]*o2[2]+o1[1]*o2[6]+o1[2]*o2[10]+o1[3]*o2[14];
       out[3] = o1[0]*o2[3]+o1[1]*o2[7]+o1[2]*o2[11]+o1[3]*o2[15];

       out[4] = o1[4]*o2[0]+o1[5]*o2[4]+o1[6]*o2[8] +o1[7]*o2[12];
       out[5] = o1[4]*o2[1]+o1[5]*o2[5]+o1[6]*o2[9] +o1[7]*o2[13];
       out[6] = o1[4]*o2[2]+o1[5]*o2[6]+o1[6]*o2[10]+o1[7]*o2[14];
       out[7] = o1[4]*o2[3]+o1[5]*o2[7]+o1[6]*o2[11]+o1[7]*o2[15];
       
       out[8] = o1[8]*o2[0]+o1[9]*o2[4]+o1[10]*o2[8] +o1[11]*o2[12];
       out[9] = o1[8]*o2[1]+o1[9]*o2[5]+o1[10]*o2[9] +o1[11]*o2[13];
       out[10] = o1[8]*o2[2]+o1[9]*o2[6]+o1[10]*o2[10]+o1[11]*o2[14];
       out[11] = o1[8]*o2[3]+o1[9]*o2[7]+o1[10]*o2[11]+o1[11]*o2[15];
       
       out[12] = o1[12]*o2[0]+o1[13]*o2[4]+o1[14]*o2[8]+o1[15]*o2[12];
       out[13] = o1[12]*o2[1]+o1[13]*o2[5]+o1[14]*o2[9]+o1[15]*o2[13];
       out[14] = o1[12]*o2[2]+o1[13]*o2[6]+o1[14]*o2[10]+o1[15]*o2[14];
       out[15] = o1[12]*o2[3]+o1[13]*o2[7]+o1[14]*o2[11]+o1[15]*o2[15];
   },



}; 
export {math3D}