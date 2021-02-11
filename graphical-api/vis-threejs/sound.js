// playSound3d API method
// todo: max counter of simultaneous play for some sounds? or just "now playing" counters for each url thus api user might decide..
// idea: use web audio api? (but what about scene rotation then?)
// done: cache sounds

export default function setup( vz ) {
  vz.vis.playSound3d = playSound3d;
}

var soundListener;
var soundGroup;
var bufferCache = {};

export function playSound3d( coords, fileurl, callback,finished_callback ) {

    if (!fileurl || fileurl.length == 0) return;

    if (!soundListener) {
      // create an AudioListener and add it to the camera
      const listener = new THREE.AudioListener();
      camera.add( listener );
      // seems camera listens.. ok...
      soundListener = listener;
    }
    if (!soundGroup) {
      soundGroup = new THREE.Group();
      scene.add( soundGroup );
    }

    // create the PositionalAudio object (passing in the listener)
    const sound = new THREE.PositionalAudio( soundListener );
    
    var item = new THREE.Group();
    item.position.x = coords[0];
    item.position.y = coords[1];
    item.position.z = coords[2];
    item.add( sound );
    soundGroup.add( item );
    
    sound.setCoords = function(coords) {
      item.position.x = coords[0];
      item.position.y = coords[1];
      item.position.z = coords[2];
    };
    
    function bufferReady(buffer) {
      sound.setBuffer( buffer );
      sound.setRefDistance( 20 );
      
      // todo... is there a global player object? with some options inside..
      if (callback) {
          callback( sound );
      }
      
      sound.play();
      
      //var orig_ended = sound.source.onEnded;
      //debugger;
      prepend( sound.source,"onended",function() {
        // console.log("removing sound from tree");
        //debugger;
        if (finished_callback)
            finished_callback( sound );
        this.orig();
        soundGroup.remove( item );
        item.remove();
        sound.remove();
      });
    }

/*    
    if (fileurl instanceof File) {
      fileurl = URL.createObjectURL( fileurl );
      console.log("fileurl created from File",fileurl );
    }
*/    
    
    if (bufferCache[fileurl]) {
      bufferReady( bufferCache[fileurl] );
    }
    else {
      // load a sound and set it as the PositionalAudio object's buffer
      const audioLoader = new THREE.AudioLoader();
      audioLoader.load( fileurl, function( buffer ) {
        bufferCache[fileurl] = buffer;
        bufferReady( bufferCache[fileurl] )
      });
    }
    
    return sound;

}

///////////// helper

var prepend = function ( obj, name, newfn ) {
    var origfn = obj[name] || function() {};
    obj[name] = function() {
      return newfn.apply( {orig:origfn}, arguments );
    }
}
