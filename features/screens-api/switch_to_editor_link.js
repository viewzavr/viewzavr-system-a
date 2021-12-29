export function setup( vz, m ) {
  vz.register_feature_set( {switch_to_editor_link,switch_to_editor_kbd} );
}

export function switch_to_editor_link( env ) {
   env.feature("screens-api");

      var a = document.createElement('a');
      var linkText = document.createTextNode("[editor]");
      a.appendChild(linkText);
      a.title = "goto editor";
      a.href = "#";
      var prev_screen;
      a.addEventListener("click",() => {
         //qmlEngine.rootObject.setActiveScreen( qmlEngine.rootObject.editor );
         //var cur = env.getParam( "active_screen");
         // env.setParam("active_screen",null,true);

         var cur = env.getParam( "active_screen");
         if (!cur && prev_screen) // текущий экран пуст, но есть значение предыдущего экрана
            env.setParam("active_screen",prev_screen,true); // вернуться в экран
         else
            env.setParam("active_screen",null,true);
         prev_screen = cur;

      });
      a.style.cssText = "position:absolute; right: 5px; bottom: 5px; z-index: 100000;"
      document.body.appendChild(a);
}

/* вот проблема. есть мясо - ссылка активирующая главный экран.
   и есть сухожилия - размещение этой ссылки в документе в корне на экране внизу (да и текст тоже).
   удобно конечно что это доступно вот так вот. но если хочется поменять размещение - получается
   все надо переписывать. хотя мясо можно было бы пере-использовать. как быть правильно?
   - параметризовать фичу?
   - экспортировать функцию мяса?
*/

export function switch_to_editor_kbd( env ) { 
 // фича ctrl+b - переход в редактор
 env.feature("screens-api");
 var prev_screen;
 document.addEventListener('keydown', function(e) {
    if ( e.ctrlKey && ( String.fromCharCode(e.which) === 'm' || String.fromCharCode(e.which) === 'M' ) ) {
       var cur = env.getParam( "active_screen");
       if (!cur && prev_screen) // текущий экран пуст, но есть значение предыдущего экрана
         env.setParam("active_screen",prev_screen,true); // вернуться в экран
      else
         env.setParam("active_screen",null,true);
      prev_screen = cur;
     };
 }); 
}


/*
export function switch_to_editor_kbd_direct( env ) { 
 // фича ctrl+b - переход в редактор
 env.feature("screens-api");
 
 document.addEventListener('keydown', function(e) {
    if ( e.ctrlKey && ( String.fromCharCode(e.which) === 'b' || String.fromCharCode(e.which) === 'B' ) ) {
         env.setParam("active_screen",null,true);
     };
 }); 
}
*/