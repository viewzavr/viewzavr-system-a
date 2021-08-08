// проблема - ошибка парсинга и сжирается текст. @idea решение - парсим сначала, если нет ошибок - съедаем,
// если есть - показываем и диалога не закрываем.

SimpleDialog {
  id: dlg
  title: "Object editor"
  z: 5002
  width: co.width + 30
  height: co.height + 33+10  

  Column {
      id: co
      width: 700; //param.desired_width
      spacing: 8
      y: 8
      x: 10

      Text {
          text: "Edit in XML"
      }

      TextEdit {
          height: 400; // param.desired_height
          width: parent.width
          id: theText
          //language: "xml"

          Component.onCompleted: {
            theText.dom.firstChild.style.whiteSpace = "nowrap"; // чтобы не было переносов строк
          }
      }

      Button {
          text: "Enter"
          //width: parent.width
          width: 150
          onClicked: {
              dlg.close();
              dlg.text = theText.text;
              dlg.edited( theText.text )
          }
      }
  }

  property var text: ""
  signal edited( string t );
      
  onAfterOpen: theText.text = dlg.text;

  ///////////////// возможно это не тут должно быть
  property var targetobj

  function perform( obj ) {
    dlg.targetobj = obj;
    dlg.text = obj.dumpToXml();
    dlg.open();
  }

  onEdited: {
    if (dlg.targetobj)
      dlg.targetobj.restoreFromXml( t );
  }

  ////////////////////////


}