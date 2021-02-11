// analog to InstancedMesh but duplicates substree instead of 1 mesh

// at the moment these things are global
/* 
import { BufferAttribute } from '../core/BufferAttribute.js';
import { Mesh } from './Mesh.js';
import { Matrix4 } from '../math/Matrix4.js';
*/

const _instanceLocalMatrix = new THREE.Matrix4();
const _instanceWorldMatrix = new THREE.Matrix4();

const _instanceIntersects = [];

const _mesh = new THREE.Mesh();
const _tempMatrix = new THREE.Matrix4();

// move out
const Scene = THREE.Scene;
const InstancedMesh = THREE.InstancedMesh;
const BufferAttribute = THREE.BufferAttribute;
const Matrix4 = THREE.Matrix4;

// todo: maybe this is InstancedObject (because it is not restircted to scene!)

function InstancedScene( source_object , count ) {

  Scene.call( this );
  this.frustumCulled = false;

  this.setCount( count );
  this.import( source_object );
}

InstancedScene.prototype = Object.assign( Object.create( Scene.prototype ), {

  constructor: InstancedScene,

  isInstancedScene: true,

/*
  // we should copy all instanceMatrix into our hierarchy
  onBeforeRender: function ( renderer, scene, camera ) {    
    return;
    //debugger;
    // if this work, we might perform this only once!
    var me = this;
    this.traverse( function(object) {
      if (object !== me && object.instanceMatrix) {
        object.instanceMatrix = me.instanceMatrix;
        if (me.instanceColor)
          object.instanceColor = me.instanceColor;
      }
    })
  },

  commit: function() {
    this.onBeforeRender();
  },
*/  

  // importint algorithm
  // source: Scene, single Mesh, or any other hierarchy
  // it copies source hierarchy, replacing any Mesh it met with InstancedMesh

  // place to think: we embed source as one of our children, which seems ok but
  // might break animations from gltf sources. check it!
  import: function ( source ) {

    var scene_instances_count = this.count;

    function import_objects( target,children,parentWorldMatrix ) {
      for ( let i = 0; i < children.length; i ++ ) {
        const child = children[ i ];
        var cloned_item;

        // todo: isSkinnedMesh => InstancedSkinnedMesh...
        if (child.isMesh) {
          cloned_item = new InstancedMesh( child.geometry, child.material, scene_instances_count );
          // init coloring
          // a little bit idiotic
          if (scene_instances_count > 0) {
            for (var j=0; j<scene_instances_count; j++)
              cloned_item.setColorAt( j, new THREE.Color());
          } 
          // thats why setCount will not work as expected..
          // what about own matrices?
        }
        else
          cloned_item = child.clone( false );

        cloned_item.updateMatrix();
        cloned_item.matrixWorld.multiplyMatrices( parentWorldMatrix, cloned_item.matrix );
        cloned_item.matrixWorldLocalHierarchy = cloned_item.matrixWorld;

        //console.log("cloned_item.matrixWorldLocalHierarchy=",cloned_item.matrixWorldLocalHierarchy)  

        cloned_item.matrixWorld = new Matrix4(); // this is identity
        cloned_item.matrix = new Matrix4();
        cloned_item.updateMatrix = function() {};
        // the idea is to supress normal matrix consideration inside threejs
        // and use local hierarchy matrix in setMatrix algorythm while computing
        // final matrix of instances
        // e.g. normal threejs computation of matrix is:
        // InstancedScene.matrix * ... local-hierarchi-matricies ... * instancedmesh.matrix(i)
        // and what we really need is:
        // InstancedScene.matrix * instancedmesh.matrix(i) * ... local-hierarchi-matricies ... 
        // todo: probably somehow consider animations..

        target.add( cloned_item );
        import_objects( cloned_item, child.children,cloned_item.matrixWorldLocalHierarchy );
      }
    }

    import_objects( this, [source], new Matrix4() );
  },

  // note: after this call, matrices and colors are lost and must be loaded again
  setCount: function( count ) {
    if (this.count != count) {
      this.instanceMatrix = new BufferAttribute( new Float32Array( count * 16 ), 16 );
      this.instanceColor = null;
      this.count = count;
    }
  },

  copy: function ( source, recursive ) {

    Scene.prototype.copy.call( this, source, recursive );

    this.instanceMatrix.copy( source.instanceMatrix );
    this.count = source.count;

    return this;

  },

  getColorAt: function ( index, color ) {

    color.fromArray( this.instanceColor.array, index * 3 );

  },

  getMatrixAt: function ( index, matrix ) {

    matrix.fromArray( this.instanceMatrix.array, index * 16 );

  },

  // todo
  // idea: raycast over bounding spheres of subscenes?
  raycast: function ( raycaster, intersects ) {

    const matrixWorld = this.matrixWorld;
    const raycastTimes = this.count;

    _mesh.geometry = this.geometry;
    _mesh.material = this.material;

    if ( _mesh.material === undefined ) return;

    for ( let instanceId = 0; instanceId < raycastTimes; instanceId ++ ) {

      // calculate the world matrix for each instance

      this.getMatrixAt( instanceId, _instanceLocalMatrix );

      _instanceWorldMatrix.multiplyMatrices( matrixWorld, _instanceLocalMatrix );

      // the mesh represents this single instance

      _mesh.matrixWorld = _instanceWorldMatrix;

      _mesh.raycast( raycaster, _instanceIntersects );

      // process the result of raycast

      for ( let i = 0, l = _instanceIntersects.length; i < l; i ++ ) {

        const intersect = _instanceIntersects[ i ];
        intersect.instanceId = instanceId;
        intersect.object = this;
        intersects.push( intersect );

      }

      _instanceIntersects.length = 0;

    }

  },

  setColorAt: function ( index, color ) {

    if ( this.instanceColor === null ) {

      this.instanceColor = new BufferAttribute( new Float32Array( this.count * 3 ), 3 );

      /*
      // just copy colors to owned hierarchy - seems no need to transform
      var me = this;
      const matrixWorld = this.matrixWorld;
      this.traverse( function(object) {
        if (object !== me && object.setColorAt) { // some way to check is it our "client"
          object.instanceColor = me.instanceColor;
        }
      });
      */

    } // if

      var me = this;
      this.traverse( function(object) {
        if (object !== me && object.setColorAt) { // some way to check is it our "client"
          object.setColorAt( index, color );
          object.instanceColor.needsUpdate = true; 
          //object.instanceColor = me.instanceColor;
        }
      });    

    color.toArray( this.instanceColor.array, index * 3 );
    this.instanceColor.needsUpdate = true; // they all will copy it... ehh..

  },

  setMatrixAt: function ( index, matrix ) {

    matrix.toArray( this.instanceMatrix.array, index * 16 );
    //console.log("set matrix at called",index,matrix)

    var me = this;
    const matrixWorld = this.matrixWorld;
    this.traverse( function(object) {
      if (object !== me && object.instanceMatrix) {
        _instanceWorldMatrix.copy( matrixWorld ); // instancedScene own matrix
        _instanceWorldMatrix.multiply( matrix ); // transformation of current instance
        _instanceWorldMatrix.multiply( object.matrixWorldLocalHierarchy ); // transformation of object in it's original hearchy
        //console.log("Traversed assigned",index,_instanceWorldMatrix);
        
        object.setMatrixAt( index,_instanceWorldMatrix );
        object.instanceMatrix.needsUpdate = true;
      }
    })

  },

  updateMorphTargets: function () {

  },

  dispose: function () {

    this.dispatchEvent( { type: 'dispose' } );

  }

} );

export { InstancedScene };