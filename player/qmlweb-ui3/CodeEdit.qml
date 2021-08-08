Rectangle {
  id:  item
  property var text: ""
  property var language: "xml"

  property var flask
  onFlaskChanged: {
    flask.updateCode( text )
    console.log("setted",text)
  }

  Component.onCompleted: {
    var path = "https://unpkg.com/codeflask/build/codeflask.min.js";
    la_require(path,function() {
      setup();
    })
  }

  onVisibleChanged: if (visible && !flask) setup();

  function setup() {
    debugger;
    item.flask = new CodeFlask( item.dom, { language: item.language, lineNumbers: true });
    item.flask.onUpdate(function(code) {
        item.text = code;
	});  
  }
}