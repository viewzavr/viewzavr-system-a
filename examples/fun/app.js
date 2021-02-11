// viewzavr app/module

// module may contain `setup` function, which may add records to a table of visual components, used by visual interface
export function setup( vz ) {
  vz.addItemType( "example-fun","Example: fun", function( opts ) {
    return create( vz, opts );
  } );
}

// place your app code in this function
export function create( vz, opts ) {
  opts.name ||= "demoscene";
  //var obj = vz.createObj( Object.assign({},opts,{type:"my-test-component-type-id",module_url: import.meta.url }) );
  var obj = vz.createObj( Object.assign({},opts,{type:"my-test-component-type-id" }) );

  var pts = vz.vis.addPoints( obj );
  pts.positions = [1,2,3, 1,2,5, 1,3,12];

  var lins = vz.vis.addLines( obj );
  lins.positions = [1,2,3, 1,2,5, 1,2,5, 1,3,12];
  
  obj.addCmd( "click", function() {
    obj.signalParam( "r" );
  });
  obj.addSlider("count",50,1,1000,1,function() {
    obj.signalParam( "r" );
  });
  var fun_id;
  obj.addSlider("r",10,0,100,1,function() {
    var acc = []; var r = obj.getParam("r");
    var n = obj.getParam("count") * 2;
    for (var i=0; i<n; i++) acc.push( r*(Math.random()-0.5),r*(Math.random()-0.5),r*(Math.random()-0.5) );
    fun_id = startFunProcess( pts.positions.slice(), acc, function(arr) {
      pts.positions = arr;
      lins.positions = arr;
    }, fun_id);
  } );


  return obj;
}

function interpArr( a1, a2, t ) {
  if (a1.length != a2.length) return a2;

  var r =  a1.map( function(v,index) {
    return v + (a2[index]-v)*t; 
  } )

  return r;
}

function startFunProcess( a1, a2, fn, oldtmr ) {
  if (oldtmr) clearInterval( oldtmr );
  var start = performance.now();
  var tmr = setInterval( function() {
    //t += 0.05;
    var t = (performance.now() - start)/1000.0;
    if (t >= 1)
      { clearInterval( tmr ); tmr = null; fn(a2); }
    else
      fn( interpArr( a1,a2,t ) );

  }, 1 );
  return tmr;
}
