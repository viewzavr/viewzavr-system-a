export default function formatSrc(src) {
  // console.log("formatSrc src=",src);
  if (src.indexOf("https://github.com/") == 0) {
     // обработка случая, когда загружают qmldir прямо из корня репозитория с пропуском метки /master, вынесена в qmlweb в import.js::readQmlDir, т.к. надо там фиксить урли файлов
     src = src.replace("/blob/","/");
     src = src.replace("https://github.com/","https://raw.githubusercontent.com/");
  }
  src = src.replace("https://raw.githubusercontent.com",window.location.protocol+"//viewlang.ru/github");

  if (src.indexOf("https://gist.github.com/") == 0) {
     // добрый дядя gist помещает имя файла в хэш-часть урля...
     var filepart = src.split( "#file-" );
     if (filepart[1]) filepart[1] = filepart[1].replace("-",".");
     // таким образом преобразовали
     // https://gist.github.com/pavelvasev/d41aa7cedaf35d5d5fd1#file-apasha2-vl
     // https://gist.github.com/pavelvasev/d41aa7cedaf35d5d5fd1#file-apasha2.vl

     src = filepart.join("/raw/");
     // а теперь получили https://gist.github.com/pavelvasev/d41aa7cedaf35d5d5fd1/raw/apasha2.vl

     if (!src.match(/\/raw(\/*$|\/)/) ) src = src + "/raw";
     // проверим, есть ли уже вставка /raw/ в урль.
     // если на входе было только https://gist.github.com/pavelvasev/d41aa7cedaf35d5d5fd1
     // то теперь получили https://gist.github.com/pavelvasev/d41aa7cedaf35d5d5fd1/raw


     src = src.replace("https://gist.github.com/","https://gist.githubusercontent.com/");
     // и заменили на raw-версию с гиста:
     // https://gist.githubusercontent.com/pavelvasev/d41aa7cedaf35d5d5fd1/raw/apasha2.vl
     // https://gist.githubusercontent.com/pavelvasev/d41aa7cedaf35d5d5fd1/raw
  }
  src = src.replace("https://gist.githubusercontent.com","//viewlang.ru/gist");
  //console.log("formatSrc result=",src);
  return src;
}
