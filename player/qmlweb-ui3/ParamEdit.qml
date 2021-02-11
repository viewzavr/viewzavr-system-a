// редактор параметров объекта
// вход -  obj - текущий объект, vzroot - корневой объект
// выход - визуальный образ параметров, их настройка

Column {
  id: ed
  spacing: 2 // кнопки иначе впритык
  
  // Text { text: "Параметры " + rep.model + " шт" }

  property var vzroot
  property var obj

  onObjChanged: {
    updateGui();
    
    // некий микро-ужас на тему получения обновлений при обновлении гуи
    // todo надо какой-то интерфейс на тему получения уведомлений..
    // а не через переопределение метода идти
    if (!obj) return;
    var cur = obj;
    if (!cur.guiTrackedQml) {
      cur.guiTrackedQml=true;
      cur.chain( "addGui", function(rec) {
        var res = this.orig(rec);
        if (cur == ed.obj) ed.updateGui();
        return res;
      });
    }
  }
  
/*  
  // перспективная следилка за изменением объекта
  Item {
    id: trackGuiChanged
    property var obj: ed.obj
    property var trackedObj
    
    onObjChanged: {    
      if (trackedObj) {
        trackedObj.unsubscribe( "addGui", updateGui );
        trackedObj = null;
      }
    
      if (obj) {
        obj.subscribe( "addGui", updateGui);
        trackedObj = obj;
      }
    }
  
    Component.onDestruction: {
      if (trackedObj) {
        trackedObj.unsubscribe( "addGui", updateGui );
        trackedObj = null;
      }
  }
*/  

  function updateGui() {
    rep.guis = [];
    if (obj) {
      rep.guis = Object.values( obj.guis )
    }
  }

  Repeater {
    id: rep
    property var guis: []
    model: guis.length
    
    Loader {
      timeoutMode: false
      property var gui: rep.guis[ index ]
      source: gui2type( gui )
      id: ldr
      visible: item.visible
      onInit: {
        var g = obj;
        gui2init( gui, g );
      }
    }
  }

  function gui2type( rec ) {
    return tablica[ rec.type ][0];
  }

  function gui2init( rec, g ) {
    g.text = rec.name;
    if (g.ahasher) g.ahasher.enabled = false;
    tablica[ rec.type ][1]( rec,g );
    trackVisible( rec, g );
  }
  
  ////////////////////////////////////////
  
  ////////////////////////////////////////
  
  // таблица тип-гуя-вьюзавр -> qml-тип и функция инициализации
  property var tablica: []
  
  function add( type, qmlfile, fn ) {
    tablica[ type ] = [qmlfile, fn ];
  }
  
  // rec - запись гуя, g - объект qml, fn - обработчик
  function trackParam( rec, g, fn ) {
      rec.obj.trackParam( rec.name,fn );
      g.Component.destruction.connect( function() { rec.obj.untrackParam( rec.name,fn ); });
  }
  
  // rec - запись гуя, g - объект qml
  function trackVisible( rec, g ) {
    // rec.obj.trackVisible ... ?
    // rec.obj.guivisible.track( rec.name, f );
    // obj.guivisible.set( "hit-sound",false );
    // g.Component.destruction.connect( function() { rec.obj.untrackParam( rec.name,fn ); });
    var f = function() {
      //debugger;
      g.visible = rec.visible;
      //qmlEngine.rootObject.refineSelf();
      //debugger;
      //ed.layoutChildren();
    }
    rec.events.addEventListener( "visible-changed",f );
    g.Component.destruction.connect( function() { rec.events.removeEventListener( "visible-changed",f ); });
    g.visible = rec.visible;
  }
  
  function init() {
    // rec - описание gui-объекта, g - qml-штука его визуальнога образа
    add( "slider", "Param", function( rec,g ) {
      g.min = rec.min || 0;
      g.max = rec.max || 100;
      g.step = rec.step || 1;
      g.value = rec.value;
      g.comboEnabled=false;
      g.textEnabled=true;
      if (rec.obj.getParamOption( rec.name,"sliding" )) g.enableSliding=true;
      // от слайдера к параметру
      g.valueChanged.connect( function( nv ) {
        rec.setValue( nv );
      });
      // от параметра к слайдеру
      trackParam( rec,g,function() {
        g.value = rec.obj.getParam( rec.name );
      });
      //g.aslider.width=140;
    });
    
    add( "combo", "Param", function( rec,g ) {
      g.values = rec.values;
      g.value = rec.value;
      g.aslider.visible = false;
      g.acombo.width = 173;
      g.acombo.parent.height = 32; // ugly hack. setting height of combo row
      g.valueChanged.connect( function( nv ) {
        rec.setValue( nv );
      });
      trackParam( rec,g,function() {
        g.value = rec.obj.getParam( rec.name );
      });
    });
    
    add( "checkbox", "CheckBoxParam", function( rec,g ) {
      g.value = rec.value ? 1 : 0;
      g.valueChanged.connect( function( nv ) {
        rec.setValue( nv > 0 ? true : false );
      });
      trackParam( rec,g,function() {
        g.value = rec.obj.getParam( rec.name ) ? 1 : 0;
      });
      g.width = 200; // иначе некрасиво и короткие имена переносяццо
    });

    add( "color", "ColorParam", function( rec,g ) {
      g.color = any2tri( rec.value ); // base.js of viewlang
      g.colorChanged.connect( function( nv ) {
        rec.setValue( nv );
      });
      trackParam( rec,g,function() {
        g.color = any2tri( rec.obj.getParam( rec.name ) );
      });      
    });
    
    add( "cmd", "Button", function( rec,g ) {
      g.clicked.connect( function() {
        rec.fn();
      });
      g.width = 200; // иначе некрасиво и короткие имена переносяццо
    });
    
    add( "text", "TextParam", function( rec,g ) {
      g.value = rec.value;
      g.valueChanged.connect( function( nv ) {
        rec.setValue( nv );
      });
      trackParam( rec,g,function() {
        g.value = rec.obj.getParam( rec.name );
      });
    });
    
    add( "label", "Text", function( rec,g ) {
      var v = rec.obj.getParam( rec.name );
      g.text = v;
      trackParam( rec,g,function() {
        var v = rec.obj.getParam( rec.name );
        g.text = v;
        //rec.name + " = " + v;
      });
    });
    
    add( "file", "GuiFile", function( rec,g ) {
      g.value = rec.value;
      g.multiple = rec.multiple;

      // need: show local files by default
      if (!rec.files || rec.files.length == 0) {
        if (rec.preferFiles)
          g.atabview.currentIndex = 1;
      }
      // need: show local files if local file selected
      if (rec.files && rec.files[0] instanceof File)
        g.atabview.currentIndex = 1;      
      
      g.valueChanged.connect( function( nv ) {
        //rec.setValue( g.files.length > 1 ? g.files : nv );
        rec.setValue( g.multiple ? g.files : nv );
      });
      
      trackParam( rec,g,function() {
        g.value = rec.obj.getParam( rec.name );
      });
    });
    
    add( "objref", "GuiObjRef", function( rec,g ) {
      g.crit_fn = rec.crit_fn;
      g.vzroot = ed.vzroot;
      g.setValue( rec.value );
      g.valueChanged.connect( function( nv ) {
        rec.setValue( nv );
      });
      trackParam( rec,g,function() {
        g.setValue( rec.obj.getParam( rec.name ) );
      });
    });

  }
  
  Component.onCompleted: init();

}