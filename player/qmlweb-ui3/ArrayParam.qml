Column {
  id: param

  property var text: ""
  property var hint: ""
  property var text_columns_count: 1

  property var desired_width: 500
  property var desired_height: 200

  Text {
    text: param.text
  }

  Button {
    text: "Редактировать"
    width: 160
    onClicked: {
      //theText.text = arr2txt( text, text_columns_count )
      dlg.open()
    }
  }
  
  function arr2txt( arr,cols ) {
    var str = "";
    for (var i=0,j=1; i<arr.length; i++,j++) {
      str = str + arr[i].toString();
      if (j == cols) {
        str = str + "\n";
        j = 0;
      }
      else 
        str = str + " ";
    }
    return str;
  }
  
  function txt2arr( txt,cols ) {
//    var res0 = txt.split( /\s+/ );
    var res =  txt.split( /\s+/ ).map(parseFloat);
    if (res.length % cols != 0) res.length = res.length - (res.length % cols);
    // cut result length to match number of columns
    // e.g. for example set coords array length to be divisible by 3
//    console.log("txt2arr:",res,res0);
    return res;
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
                                text: param.hint || "Please insert array values here"
                            }

                            TextEdit {
                                height: 400; // param.desired_height
                                width: parent.width
                                id: theText

                                //css.whiteSpace: "nowrap";
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
                                    param.value = txt2arr( theText.text,param.text_columns_count ) ;
                                }
                            }
                        }
                            
                        onAfterOpen: theText.text = arr2txt( param.value, param.text_columns_count )
                    }   
  
}