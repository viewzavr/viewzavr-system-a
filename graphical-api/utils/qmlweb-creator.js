function create_component_from_url( source ) {
        // var context = qmlloader.$properties["source"].componentScope;
        var context = null;
        var engine = qmlEngine;

        // little HACK. lookup in loaded qmldirs
        //var sourceNoQ = source.split("?")[0];
        var sourceNoQ = source.split(".")[0]; // hack - по идее нам надо имя файла тут, но с учетом папки.. а мы берем просто до .
        var qdirInfo = engine.qmldirs[ sourceNoQ ];

        var sourceComponent = null;
        if (qdirInfo)
            sourceComponent = Qt.createComponent( "@" + qdirInfo.url, context );
        else
            sourceComponent = Qt.createComponent( source.indexOf(".") > 0 ? source : source + ".qml",context );  // e.g. if source contains 'dot', load as is; if not - add .qml to it.

        if (!sourceComponent) {
            //debugger;
            console.error("qmlweb-creator: failed to load component from source=",source );
            return undefined;
        }
        return sourceComponent;
}

function delete_qml_obj( obj ) {
  obj.$delete();
}

export function create_qml_obj( source, parent, init_func ) {
  var engine = qmlEngine;
  
  var sc = create_component_from_url( source );
  if (!sc) return undefined;
  if (!parent) parent = engine.rootObject;
  var it = sc.createObject( parent );
  if (!it) {
    console.error("qmlweb-creator: failed to create object for source=",source );
    return undefined;  
  }
  
  if (init_func)
    init_func.apply( it );
    
  //
  var oldState = engine.operationState;
  engine.operationState = QMLOperationState.Init;
  it.parent = parent;
  parent.childrenChanged();
  engine.operationState = oldState;
  
  //
  if (engine.operationState !== QMLOperationState.Init && engine.operationState !== QMLOperationState.Idle) {
    // We don't call those on first creation, as they will be called
    // by the regular creation-procedures at the right time.
    //console.log("@@@LOADER inits props");
    
    engine.$initializePropertyBindings();
    engine.callCompletedSignals();
  }
  
  it.remove = function() {
    //it.$delete();
    //debugger;
    delete_qml_obj( it );
  }
  
  return it;
}

export default function setup( mv ) {
  mv.create_qml = create_qml_obj;
  mv.delete_qml = delete_qml_obj;
}
