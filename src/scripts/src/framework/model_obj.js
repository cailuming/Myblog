
class ObjectModel{
  
  load(data){
     var linelist = data.split('\n');
     this.vertexData=[];
     this.texData=[];
     this.normData=[];
     this.layout = [];
     this.vindexData=[];
     this.tindexData=[];
     this.nindexData=[];
     this.triangleNum=0;
     //  
     linelist.forEach(element => {
        var unitList = element.split(' ');
        if(unitList[0]=='v'){
           this.vertexData.push({v:[unitList[1],unitList[2],unitList[3]]});
        }else if(unitList[0]=='vt'){
           this.texData.push({t:[unitList[1],unitList[2]]});
        }else if(unitList[0]=='vn'){
           this.normData.push({n:[unitList[1],unitList[2],unitList[3]]})
        }else if(unitList[0]=='f'){
           var slice0 = unitList[1].split('/');
           var slice1 = unitList[2].split('/');
           var slice2 = unitList[3].split('/');
           
           this.vindexData.push(slice0[0]);
           this.vindexData.push(slice1[0]);
           this.vindexData.push(slice2[0]);

           this.tindexData.push(slice0[1]);
           this.tindexData.push(slice1[1]);
           this.tindexData.push(slice2[1]);

           this.nindexData.push(slice0[2]);
           this.nindexData.push(slice1[2]);
           this.nindexData.push(slice2[2]);

        }
     });

     for(var i=0;i<this.vindexData.length;i++){
        
         this.layout.push(this.vertexData[this.vindexData[i]-1].v[0]);
         this.layout.push(this.vertexData[this.vindexData[i]-1].v[1]);
         this.layout.push(this.vertexData[this.vindexData[i]-1].v[2]);
         
         this.layout.push(this.normData[this.nindexData[i]-1].n[0]);
         this.layout.push(this.normData[this.nindexData[i]-1].n[1]);
         this.layout.push(this.normData[this.nindexData[i]-1].n[2]);
         
         this.layout.push(this.texData[this.tindexData[i]-1].t[0]);
         this.layout.push(this.texData[this.tindexData[i]-1].t[1]);
         
     }
     
     this.triangleNum = this.vindexData.length;
     
     this.vertexData = null;
     this.normData   = null;
     this.texData    = null;
     this.vindexData = null;
     this.tindexData = null;
     this.nindexData = null;
  }

  loadDirectData(data){
     this.Gdata = data.split(' ');
     this.triangleNum = this.Gdata[0]/8;
     this.layout=this.Gdata[1].split(',');
     this.Gdata =null;
  }
  setData(data){
   this.layout = data;
   this.triangleNum =100;
  }

  clear(){

  }
};

export {ObjectModel}