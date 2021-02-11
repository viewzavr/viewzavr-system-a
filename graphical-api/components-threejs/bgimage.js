// background scene image

// pluses: screenshot is made with backgound, mixes with additive color
// ideas: video background, image panning (duplicate by width, e.g X + flip(X), + forever shift right.. mb by scene time and / or timer)

export default function setup( mv ) {

function make( opts ) {
  var obj = mv.create_obj( {}, opts );

  var c = "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

  const loader = new THREE.TextureLoader();
  var bgTexture;
  
  obj.addFile("image",c,function(v) {
    bgTexture = loader.load(v);
    scene.background = bgTexture;  
  });
  
  //obj.addLabel( "reco","<a href='https://unsplash.com/' target='_blank'>See images in Unsplash</a>",function(){});
  obj.addCmd("Images at Unsplash.com",function() {
    window.open("https://unsplash.com/");
  });

  // thanks for the method: 
  // https://threejsfundamentals.org/threejs/lessons/threejs-backgrounds.html

  function fixtex() {
    if (!bgTexture) return;
    
    // Set the repeat and offset properties of the background texture
    // to keep the image's aspect correct.
    // Note the image may not have loaded yet.
    var canvas = threejs.renderer.domElement;
    const canvasAspect = canvas.clientWidth / canvas.clientHeight;
    const imageAspect = bgTexture.image ? bgTexture.image.width / bgTexture.image.height : 1;
    const aspect = imageAspect / canvasAspect;

    bgTexture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
    bgTexture.repeat.x = aspect > 1 ? 1 / aspect : 1;

    bgTexture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
    bgTexture.repeat.y = aspect > 1 ? 1 : aspect;
  }

  threejs.scene.addEventListener("render",fixtex );

  obj.chain("remove",function() {
    threejs.scene.removeEventListener("render",fixtex );  
    scene.background = null;
    this.orig();
  })

  return obj;
}

mv.addItemType( "bgimage","Background image",make, {label: "visual", guionce: true, title_ru: "Фоновая картинка"} );

}