Column {
  id: param

  property var text: ""
  property var hint: ""

  property var desired_width: 500
  property var desired_height: 200

  Text {
    text: param.text
  }

  Button {
    text: "Редактировать"
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
                        height: co.height + 33+10
                        z: 5002

                        Column {
                            id: co
                            width: 700; //param.desired_width
                            spacing: 8
                            y: 8
                            x: 10
    
                            Text {
                                text: param.hint || "Please insert text here"
                            }

                            TextEdit {
                                height: 400; // param.desired_height
                                width: parent.width
                                id: theText
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
                                    param.value = theText.text;
                                }
                            }
                        }
                            
                        onAfterOpen: theText.text = param.value;
                    }   
  
}