import QtQuick.Controls 1.2

// Вход:
// Выход:
// file, files
// - типа FileObject
// - строка - тогда это URL

// причем file = files[0]

Rectangle {
    /* Потоки данных
   - file, files - первичные входящие урль-имена файлов от внешних компонент

   далее FileSelect при filesChanged их меняет
   во втором таб-е можно кликнуть "Редактировать" и тогда..

*/
//    property var dataDialog: dlg2

    id: param
    property var tag: "left"
    //    border.color: "grey"
    color: "transparent"
    radius: 2

    property var text //: title
    property var title
    property var min:0
    property var max:10
    property var step:1

    property alias value: param.file

    property var file
    property var files

    onFilesChanged: if (file != files[0]) file = files[0];

    property var showChosenFile: true
    //property var showChosenFile: true

    property var guid: translit(text)

    // this is warkaround around some bug
    onTextChanged: icoltitle.text = text;

    onFileChanged: {
        if (file !== files[0]) {
           if (file instanceof FileList)
             files = file;
            else
             files = [file];
            //console.log("i reset fs.file to ",file );
            //fs.file = file;
        }
    }
    
    
    /*
    function setFile(file) {
      param.files = [file];
    }
    function setFiles(files) {
      param.files = files;
    }*/
    
    property var multiple: false
    
    property var enableSliding: true

    property var values

    onValuesChanged: {
        files = values;
    }

    signal changed(int newvalue, object event);

    //  onValueChanged: {
    //    slider.value = value;
    //    combo.currentIndex = Math.floor( (value - min) / step );
    //  }

    //spacing: 2
    //anchors.topMargin: 15

    //property var color //:"red"

    //title: text
    
    width: 250
    //  height: param.multiple ? 65 : 90
    //height: 100
    height: col.implicitHeight+5

    Column {
        id: col
        Text {
            id: icoltitle
            text: "Input file"
            //text: "Входные файлы"
        }
        spacing: 5

        TabView {
            width: 220
            //height: param.multiple ? 60 : 43
            height: (currentIndex == 0 ? ro1.height : col2.height)+20  //Math.max( tab1.height, tab2.height )
            //height: 150
            id: tabview


            ///////////////////////////////////////////////////////////////////
            Tab {
                title: "Address"
                anchors.fill: parent
                id: tab1
                
                Row {
                   id: ro1

                    Button {
                        width: 180
                        text: "Enter URL.."
                        onClicked: {
                            dialogFilesText.text = param.files && param.files.join ? param.files.join("\n") : param.file;
                            dlg.open();
                        }
                    }

                    
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
                                text: "Please insert file URL here"
                            }
                            
                            TextEdit {
                                height: 200
                                width: parent.width
                                id: dialogFilesText
                            }

                            Button {
                                text: "Enter"
                                //width: parent.width
                                width: 150
                                onClicked: {
                                    dlg.close();
                                    param.files = dialogFilesText.text.split("\n");
                                }
                            }
                        }

                        //onAfterOpen: dialogFilesText.text = txt.text;
                    }

                }

            }
            
            //////////////////////////////////////////
            Tab {
                title: "Local file"
                id: tab2
                height: col2.height
                
                Column {
                  id: col2

                FileSelect {
                    id: fs
                    multiple: param.multiple
                    onFilesChanged: {
                        param.files = fs.files;
                    }
                    transparent: true
                }
                /*
                Text {
                  text: "Указываются все файлы синема-базы,<br/>а не только data.csv"
                }
                */
                }

            }

        } //tabview
        
        Row {
        
        spacing: 2

        // R-FILE-GUI-NEED-RELOAD
        TextButton {
          y:0
          text: "[Reload]"
          onClicked: {
          
            var o = param.files;
            param.files = [];
            setTimeout( function() {
              param.files = o;
            }, 10 );
            
            // так они теряются.. файлы..
            //param.valueChanged();
          }
        }

        Text {
            visible: param.showChosenFile
            // visible: !param.multiple
            text: {
                if (!param.file)
                    return "-";
                if (param.files.length > 1)
                    return "Selected files:" + param.files.length;
                if (param.file.name)
                    return "Selected: " + param.file.name;

                if (param.file.split) {
                    var co = param.file.split("/");
                    return "Selected: <a target='_blank' href='" + param.file + "'>"+co[co.length-1]+"</a>"
                }

                return "Data entered";
            }
            //"Файл <a target='_blank' href='"+Qt.resolvedUrl(datafile)+"'>"+datafile+"</a>\n\n"
        }
        

        
        }

    }
    
    property alias ahasher: hasher
    property alias atabview: tabview

}
