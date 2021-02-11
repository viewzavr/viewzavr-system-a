Button {
  property var vzroot
  property var special_objects

  text: "Сохранить.."
/*  
  anchors.right: parent.right
  anchors.top: parent.top
  anchors.margins: 5
*/  
//  property var tag: "bottom"
 property var tag: "top"

  onClicked: dlg.open();

  SimpleDialog {
    id: dlg
    title: "Сохранение и загрузка сцены"
    
    ParamEdit {
        obj: special_objects ? special_objects.import_export : undefined
    }
  }

}
