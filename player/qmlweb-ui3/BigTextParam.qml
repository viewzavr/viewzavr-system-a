Column {
  id: param
  
  property var text: ""
  property var hint: ""
  
  Text {
    text: param.text
  }
  
  Button {
    text: "Задать текст"
    width: 160
    onClicked: {
//      theText
      dlg.open()
    }
  }
  property var value: ""

                    SimpleDialog {
                        id: dlg
                        title: param.text || "&nbsp;"
                        width: co.width + 30
                        height: co.height + 33
                        z: 5002

                        Column {
                            id: co
                            width: 500
                            spacing: 8
                            y: 8
                            x: 10
    
                            Text {
                                text: param.hint || "Please insert text here"
                            }

                            TextEdit {
                                height: 200
                                width: parent.width
                                id: theText
                            }

                            Button {
                                text: "Enter"
                                //width: parent.width
                                width: 150
                                onClicked: {
                                    dlg.close();
                                    param.value = theText.text;
                                }
                            }
                        }
                            
                        onAfterOpen: theText.text = param.value;
                    }   
  
}