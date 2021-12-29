export function setup( vz, m ) {
  vz.register_feature( "screens-api", screens_api );
}

export function screens_api( env ) {

  var current = qmlEngine.rootObject.editor;

  env.addObjectRef("active_screen");
  env.setParamOption("active_screen","tree_func",() => env.getRoot() );
  // вообще идея конечно, а можно ли как-то стандартно в параметры записывать функции для чтения значения?
  // ну или, надо писать параметр active_screen:tree .... и линковать с нашим vzPlayer.params["scene"]

  env.onvalue( "active_screen",(v) => {
    console.log("screens-api: onvalue",v)

    if (current == v) return;
    
    if (current) {
      if (current.hasOwnProperty("visible"))
        current.visible = false;
      if (current.setParam)
        current.setParam("visible",false);
    }

    env.setParam("prev_screen",current);

    current = v || qmlEngine.rootObject.editor;

    if (current) {
      if (current.hasOwnProperty("visible"))
        current.visible = true;
      if (current.setParam)
        current.setParam("visible",true);
    }
  } );

  //env.setParam("active_screen");

  // странный хак
  /*
  env.trackParam("scene",(v) => {
    env.setParamOption("active_screen","tree",v );
  })
  env.setParamOption("active_screen","tree",env.getRoot() );
  */


  // env.special_objects.state.feature("param-mirror");
  // env.special_objects.state.addParamMirror( "active_screen_st","..->active_screen");
  // env.addParamMirror()

}
