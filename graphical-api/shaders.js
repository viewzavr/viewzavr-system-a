// добавляет графический шейдер, который затем применяется ко всем объектам
// todo сделать выбор объектов применения (мб через системы ecs?)

export default function setup( mv ) {

//var shadersHolder = qmlEngine.rootObject; // todo

// mv.shaders = []
// mv.create_obj({},{});
var shaders = [];
var shadersHolder = mv.create_obj({},{});

mv.vis.addShader = function( parent, name ) {

  var shader = mv.create_qml( "Shader", qmlEngine.rootObject,function() {} );
  //mv.create_obj( obj, {parent: opts.parent, name: opts.type, label:"extras" } );

  // сцепка "все шейдеры сцены.."
  shaders.push( shader );
  shadersHolder.signal( "shaders" );

  var oremove = parent.remove;
  parent.remove = function() {
    var i = shaders.indexOf( shader );
    if (i >= 0) {
      shaders.splice( i,1 );
    }
    //mv.callCmd("shadersChanged");
    //mv.shadersChanged();
    shadersHolder.signal( "shaders" );
    oremove();
  }
  
  // отслеживать изменение параметров объекта, передавать в шейдер..
  shader.followParams = function( obj, ...paramnames) {
    paramnames.forEach( function(p) {
      console.log("shader tracking, setting p=",p,shader);
      QObject.createSimpleProperty("var",shader,p);
      var v = obj.getParam(p);
      console.log(">>>>>>> v=",v,"p=",p);
      shader[p] = v;
      
      obj.trackParam( p, function() {  // todo значит надо untrack params при удалении ошейдера или объекта..
        shader[p] = obj.getParam(p);
      });
    });
  }

  return shader;
}

///////////////////// создадим глобальную коллекцию..

// и здесь мы поняли что нам надо отслеживать что некий объект подписался на trackParam у другого
// и тогда он сможет отписываться. потихоньку пилим свой qml ))))

// плюс нам бы пригодилась мульти-схема. мы бы тогда эти шейдеры посадили бы в mv.root.shadersSpace
// и шейдер бы удалля себя из этого shaderSpace

var orig = mv.create_obj;
mv.create_obj = function( obj, opts ) {
  orig( obj, opts );
//  if (opts.label == "visual" && obj.shaderChanged) { // проверка что объект у нас визуализации и что у него есь шейдеры опция..
  if (obj.shaderChanged) { // проверка что объект у нас визуализации и что у него есь шейдеры опция..  
    obj.shader = shaders;

    var qq = function() {
      if (obj.commonShadersProhibited) return;
      obj.shader = shaders;
      obj.shaderChanged(); // это надо вызывать, там onChanged не срабатывает т.к. указатель на массив не меняется..
    }
    shadersHolder.track("shaders",qq);
    obj.Component.destruction.connect( function() {
      shadersHolder.untrack("shaders",qq);
    });
    //mv.unchain... ?
    //mv.shadersChanged.connect( obj, );
  }
  return obj;
};

}