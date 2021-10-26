export function setup( vz, m ) {
  vz.register_feature( "timers", timers );
}

export function timers( env ) {
    env.setInterval = function( func, time )
    {
        let t = setInterval( func, time );
        let f = function() { if (t) clearInterval(t); t=null; }
        env.on("remove",function() {
          f();
        })
        return f;
    }

    env.setTimeout = function( func, time )
    {
        let t = setTimeout( function() {
          t = null;
          func();
        }, time );
        let f = function() { if (t) clearTimeout(t); t=null; }
        env.on("remove",function() {
          f();
        })
        return f;
    }
}