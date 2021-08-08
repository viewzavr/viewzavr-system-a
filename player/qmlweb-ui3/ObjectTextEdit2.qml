// проблема - ошибка парсинга и сжирается текст. @idea решение - парсим сначала, если нет ошибок - съедаем,
// если есть - показываем и диалога не закрываем.

Item {
  property var dlg

  function init() {
    if (!dlg) {
      if (typeof(vzPlayer) !== "undefined")
        vzPlayer.vz.createFromXml( '<dlg><column id="col"><codeflask id="cf"/><btn id='commitbtn' text="commit"/></column></dlg>' )
        .then( function(res) {
          dlg = res;
          res.items.col.items.commitbtn.on("click",function)  
        } );
    }
  }

  property var targetobj

  function perform( obj ) {

    init();

    if (!dlg) return setTimeout( function() { perform(obj);},250 );

    debugger;

    dlg.items.col.items.cf.setParam("text",obj.dumpToXml())

    targetobj = obj;
    //dlg.text = obj.dumpToXml();
    dlg.showModal();
  }

  signal edited( string t;)

  onEdited: {
    if (targetobj)
      targetobj.restoreFromXml( t );
  }

}