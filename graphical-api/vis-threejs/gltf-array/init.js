export default function setup( vz ) 
{

  vz.vis.addGltfArray = function( parent,name ) {

  var obj = vz.create_obj( {}, {parent:parent, name:name} );

  obj.models_obj = parent.vz.create_obj( {}, {parent:obj,name:"models"});
/*  
  obj.positions = [];
  obj.colors = [];
  obj.rotations = [];
  obj.sources = [];
*/  
  
  add_prop( obj,"colors",[],refreshDelayed );
  add_prop( obj,"positions",[],refreshDelayed );
  add_prop( obj,"rotations",[],refreshDelayed );
  add_prop( obj,"sources",[],refreshDelayed );
  
  //obj.animations_0=[];
  
  /*
  function addanim(i) {
    obj.addSlider( "animation_"+i,0,-1,100,1,function() {});
  }
  addanim(0);
  addanim(1);
  addanim(2);
  addanim(3);
  addanim(4);
  addanim(5);
  */

  var needRefresh = false;
  var refreshtmr;
  var refreshIfNeeded = function() {
    if (needRefresh) {
      needRefresh = false;
      // maybe that's why we dont need it in remove
      if (!obj.removed) refresh();
    }
    if (refreshtmr) {
      clearTimeout( refreshtmr );
      refreshtmr = undefined;
    }
    // maybe not a best idea to do it here right before rendering
    // because we have time before render tick..
    // threejs.scene.removeEventListener("render",refreshIfNeeded );
  }
  
  function refreshDelayed() {
    if (!needRefresh) {
      needRefresh = true;
      if (!refreshtmr)
        refreshtmr = setTimeout( refreshIfNeeded, 0);
      //threejs.scene.addEventListener("render",refreshIfNeeded );
    }
  }
  
  function refresh() {
      var count = Math.floor( obj.positions.length / 3 );
      // console.log("refreshing");

      var existing_co = obj.models_obj.ns.getChildren().length;
      if (existing_co != count) {
        if (existing_co > count) {
          var more = existing_co-count;
          while (more > 0) {
            var c = obj.models_obj.ns.getChildren()[ obj.models_obj.ns.getChildren().length-1 ];
            c.remove();
            more--;
          }
        }
        else
        {
          var need = count-existing_co;
          while (need > 0) {
            var nobj = parent.vz.vis.addGltf( obj.models_obj );
            need--;
          }
        }
      }
      
      var arr = [];
      //console.log("making models",count);
      
      var i3=0;
      for (var i=0; i<count; i++,i3+=3) {
        var nobj = obj.models_obj.ns.getChildren()[i];
        var path = obj.sources[i] || obj.source;
        
        nobj.setParam( "src",path );
        // todo optimize: if positions changes... if colors changed.. so on
        nobj.positions = [ obj.positions[i3], obj.positions[i3+1], obj.positions[i3+2] ];
        if (obj.colors && obj.colors.length > 0)
          nobj.colors= [ obj.colors[i3], obj.colors[i3+1], obj.colors[i3+2] ];
        if (obj.rotations && obj.rotations.length > 0)   
           nobj.rotations = [ obj.rotations[i3], obj.rotations[i3+1], obj.rotations[i3+2] ];
      
        
        // idea: instead of passing animations, pass any object param.............
        // thus we may create a player of any viewzavr objects (not only models but any!)
        // and setup any properties via this interface.... mmmm....
        function setanim(n) {
          n = n.toString();
          var data = obj["animations_"+n];
          if (data) {
          
            //debugger;
            nobj.setParam( "animation_"+n, data[i] );
          }
          // todo maybe add param
          //nobj.setParam( "animation_"+n, obj.getParam( "animation_"+n ) );
        }
        setanim(0);
        setanim(1);
        setanim(2);
        setanim(3);
        setanim(4);
        
      }

    }; // refresh
  
  return obj;
} // addGltfArray
  
} // setup

function torad( angl ) {
  return angl * Math.PI / 180.0;
}


function add_prop( obj, prop_name, initial_val, fn_on_set )
{
    var val = initial_val;
    Object.defineProperty(obj, prop_name, {
      get: function() { return val },
      set: function(v) {
        var prev_val = val;
        val = v;
        fn_on_set(val,prev_val);
      }
    });
}