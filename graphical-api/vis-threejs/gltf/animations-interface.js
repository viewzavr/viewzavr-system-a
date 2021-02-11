////////////////// feature

// this set's up a gltf viewzavr obj with animation params
export default function setup( obj ) {
  obj.track("loaded",function() {
    add_animation_params( obj, obj.gltf.scene, obj.gltf.animations );
  });
}

////////////////// functions

export function add_animation_params( obj, threejs_obj, animations )
{
  var mixers=[];
  var actions=[];
  //var gltf = threejs_obj;
  
  function add_anim( i ) {
    var clip = animations[ i ];
    var mixer = new THREE.AnimationMixer( threejs_obj );
    var action = mixer.clipAction( clip );
    //var action = mixer.clipAction( clip  );
    
    //action.play(); // но это не то что вы подумали
    
    mixers.push( mixer );
    actions.push( actions );
    
    // obj.getParam("animation_"+i) ||
    obj.addSlider("animation_"+i,-1,-1,100,1,function(v) {
      //debugger;
      //action.time = v * clip.duration / 100.0;
      
      if (v >= 0)
        action.play(); 
      else 
        action.stop();
      
      if (v >= 0) {
        v = v % 100; // фича "анимация обрабатывается по модулю 100"
        seekAnimationTime( mixer, v * clip.duration / 100.0 );
      }
    });  
  }

  for (var i=0; i<animations.length; i++) {
    add_anim( i );
  }

}

// https://stackoverflow.com/a/57865303
function seekAnimationTime(animMixer, timeInSeconds){
    animMixer.time=0;
    for(var i=0;i<animMixer._actions.length;i++){
      animMixer._actions[i].time=0;
    }
    animMixer.update(timeInSeconds)
}