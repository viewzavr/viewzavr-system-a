// caching of loaded assets..
// to work with cached items, we should always duplicate loaded scenes, even for 1st one
// because if 1st scene is disposed, no new clones will be possible to create from it.
// thus we save loaded scene as a untouchable original for forever


////////////////// feature

var cache = {};

// this set's up a gltf viewzavr obj with animation params
export default function setup( obj ) {

  obj.chain("doload",function( loader, src ) {
  
    var cachekey = src;
    
    if (!cache[cachekey]) {
      cache[cachekey] = this.orig( loader,src );
      // duplicate this too!!!! because of dispose that might be called on original!
      // doing duplicate, always, ok..
      // return cache[cachekey];
    }
    
    var p = new Promise( function(resolve,rej) {

        cache[cachekey].then( function(gltf) {
          var newgltf = cloneGltf( gltf );
          resolve( newgltf );
        });
      
      });
    return p;
    
    
  });

}


// https://gist.github.com/cdata/f2d7a6ccdec071839bc1954c32595e87
// thank you!
const cloneGltf = (gltf) => {
  const clone = {
    animations: gltf.animations,
    scene: gltf.scene.clone(true)
  };

  const skinnedMeshes = {};

  gltf.scene.traverse(node => {
    if (node.isSkinnedMesh) {
      skinnedMeshes[node.name] = node;
    }
  });

  const cloneBones = {};
  const cloneSkinnedMeshes = {};

  clone.scene.traverse(node => {
    if (node.isBone) {
      cloneBones[node.name] = node;
    }

    if (node.isSkinnedMesh) {
      cloneSkinnedMeshes[node.name] = node;
    }
  });

  for (let name in skinnedMeshes) {
    const skinnedMesh = skinnedMeshes[name];
    const skeleton = skinnedMesh.skeleton;
    const cloneSkinnedMesh = cloneSkinnedMeshes[name];

    const orderedCloneBones = [];

    for (let i = 0; i < skeleton.bones.length; ++i) {
      const cloneBone = cloneBones[skeleton.bones[i].name];
      orderedCloneBones.push(cloneBone);
    }

    cloneSkinnedMesh.bind(
        new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
        cloneSkinnedMesh.matrixWorld);
  }
  
  // update: cloning materials too - we need to manage them separately
  gltf.scene.traverse(node => {
    if (node.isMesh) {
     node.material = node.material.clone();
     // todo: arrays of materials?
     
    }
    // ok seems no need for points so on because gltf has only meshes..
  });

  return clone;
}

