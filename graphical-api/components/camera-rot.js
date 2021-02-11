// camera rotation around axis

export default function setup(mv) {

var intervalDur=15;
var timer = null;

function make(opts) {
  var obj = mv.create_obj( {}, opts );
  
  var orbitControl = qmlEngine.rootObject.cameraControlC.sceneControl;
  
  var sl1 = obj.addSlider("teta-angle",0,-1,360,0.01,function(value) {
    orbitControl.manualTheta = value < 0 || value == null || isNaN(value) ? undefined : 2*Math.PI * value / 360.0;
    orbitControl.update();
    if (!timer) {
      orbitControl.manualTheta = undefined;
      orbitControl.update();
    }
  });
  
  // синхронизирует процесс таймера и потребность на него, что определяется ненулевым значением value
  function aval( value ) {
      if (value != 0) {
      orbitControl.update();
      if (!timer)
        timer = setInterval( function() {
          var dt = aps.value;
          var newangle = ((sl1.value + dt)%360 + 360)%360;
          sl1.setValue( newangle );
        }, intervalDur );
    }
    else
    {
      if (timer) clearInterval( timer );
      timer=null;
      orbitControl.manualTheta = undefined;
      orbitControl.update();
    }
  }
  
  
  var aps = obj.addSlider("auto-rotate",0,-0.1,+0.1,0.01,function(value) {
    aval( value );
  });
  
  obj.addCmd( "stop",function() {
    // вот мы тут капитально видимо что надо чтобы setParam и addSlider были бы одного уровня вещи
    // TODO
    aps.setValue( 0 );
    aval( 0 );
  });
  
  var oremove = obj.remove;
  //obj.remove = mv.chain( obj.remove, function() {
  obj.remove = function() {
    aval( 0 );
    if (oremove) oremove();
  }

  return obj; // ну то есть я пока не понял, хочу я вообще что-то возвращать или нет
}

mv.addItemType( "cameraZ","Camera rotate",make, {
  label:"extra",
  guionce:true,
  title_ru: "Поворот камеры"
} );

}