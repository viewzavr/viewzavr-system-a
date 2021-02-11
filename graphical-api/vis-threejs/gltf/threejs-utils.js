// based on
// https://github.com/lume/lume/blob/a16fc59473e11ac53e7fa67e1d3cb7e060fe1d72/src/utils/three.ts

export function isRenderItem(obj) {
    return 'geometry' in obj && 'material' in obj
}

export function disposeMaterial(obj) {
    if (!isRenderItem(obj)) return

    // because obj.material can be a material or array of materials
    var materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const material of materials) {
        material.dispose()
    }
}

export function disposeObject(obj, removeFromParent = true, destroyGeometry = true, destroyMaterial = true) {
    if (!obj) return

    if (isRenderItem(obj)) {
        if (obj.geometry && destroyGeometry) obj.geometry.dispose()
        if (destroyMaterial) disposeMaterial(obj)
    }

    removeFromParent &&
        Promise.resolve().then(() => {
            // if we remove children in the same tick then we can't continue traversing,
            // so we defer to the next microtask
            obj.parent && obj.parent.remove(obj)
        })
}

export function disposeObjectTree(obj) {
    obj.traverse(node => {
        disposeObject(
            node
        )
    })
}


/////////////////////
export function setMaterialColor(obj, color, traverse = true) {
    if (obj.material) {
      var materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const material of materials) {
        material.color = color;
        //material[colorname] = color;
        material.needsUpdate = true;
      }
    }

    if (traverse)
      obj.traverse(node => {
        if (node !== obj) setMaterialColor(node, color, traverse);
      })

}

export function traverseMaterials(obj,fn) {
    if (obj.material) {
      var materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const material of materials) {
        fn( material );
        //material.color = color;
        //material[colorname] = color;
        //material.needsUpdate = true;
      }
    }

    obj.traverse(node => {
      if (node !== obj) traverseMaterials(node, fn);
    })

}

/////////////////////
export function setMaterialOpacity(obj, opacity, traverse = true) {
    if (obj.material) {
    var materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const material of materials) {
      if (opacity < 1) {
          material.transparent = true;
          material.opacity = opacity;
      }
      else
      {
          material.transparent = false;
      }

      material.needsUpdate = true;
    }
    }

    if (traverse)
      obj.traverse(node => {
        if (node !== obj) setMaterialOpacity(node, opacity, traverse)
      })

}