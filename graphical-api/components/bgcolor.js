// background scene color

export default function setup( mv ) {

function make( opts ) {
  var obj = mv.create_obj( {}, opts );
  var s = qmlEngine.rootObject;
  
  var c = s.backgroundColor || [0.09, 0.09, 0.17] || [0,0.2,0];

  obj.addColor("color",c,function(v) {
    // console.log("setting new bg color",v);  
    s.backgroundColor=v;
  });

  return obj;
}

mv.addItemType( "bgcolor","Background color",make, {label: "visual", guionce: true, title_ru: "Цвет фона"} );

}