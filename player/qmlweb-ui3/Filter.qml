TextField {
      placeholderText: "фильтр по имени"
      id: tf
      width: 136

      property var filterfunc

      onTextChanged: {
        //console.log(text)
        var t = text;
        var f;

        if (t.length > 0)
          f = function(obj,arg) {
            return arg || obj.ns.name.match(t);
          }
        //console.log("setting ff",f)
        filterfunc = f;

        // транслит. но тут вопрос - если русские объекты будут то он не нужен
        // о, сделаем 2 фильтра
        // var translit = 
        // https://github.com/ai/convert-layout/blob/main/ru.json
        /* потом.. тут можно еще обратно, из анг в рус (когда рус объекты будут)

        var f2;
        if (t.length > 0) {
        var tr = {q:"й",w:"ц",e:"у",r:"к",t:"е",y:"н",u:"г",i:"ш",o:"щ",p:"з","[":"х","{":"Х","]":"ъ","}":"Ъ","|":"/","`":"ё","~":"Ё",a:"ф",s:"ы",d:"в",f:"а",g:"п",h:"р",j:"о",k:"л",l:"д",";":"ж",":":"Ж","'":"э","\"":"Э",z:"я",x:"ч",c:"с",v:"м",b:"и",n:"т",m:"ь",",":"б","<":"Б",".":"ю",">":"Ю","/":".","?":",","@":"\"","#":"№","$":";","^":":","&":"?"};
        // https://stackoverflow.com/questions/23013573/swap-key-with-value-json
        
        var t2 = t.split("").map( function(char) { return tr[char] } ).join("");
        if (t2 != t && t2.length > 0)
          f2 = function(obj,arg) {
            return arg || obj.ns.name.match(t2);
          }
          debugger;
        }

        // соединим пока так
        var finalf = f;

        if (f && f2) 
          finalf = function(obj,arg) { 
           var res = f(obj,arg); 
           if (!res) res = f2(obj,arg); 
           return res
          }

        shower.filterfunc = finalf;
        */

      }
      onAccepted: tf.text=""; // очистка по ентеру
      Button { // очистка по клику
        visible: tf.text && tf.text.length > 0
        anchors.left: parent.right+10
        text: "очистить"
        onClicked: tf.text="";
      }
      

}