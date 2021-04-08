// packets table abstraction
// this table holds a mapping: package-code -> package-record

export function setup( x ) {

  var packagesTable = {};
  // a table of records: { code, title, url, info, ... }
  
  x.addPackage = function(opts) {
    if (Array.isArray(opts)) {
      opts.forEach( function(rec) { x.addPackage(rec); } );
      return;
    }
    packagesTable[ opts.code ] = opts;
  }
  x.addPackagesTable = function(table) {
    Object.keys(table).forEach( function(key) {
      var record = Object.assign( {}, table[key], {code: key} );
      x.addPackage( record );
    });
  }

  x.getPackagesTable = function() { return packagesTable };
  
  x.getPackageByCode = function(code) {
    var t = x.getPackagesTable();
    return t[code];
  }
  
  x.loadPackageByCode = function(code) {
    if (Array.isArray(code))
    {
      var arr = code;
      var promises = [];
      for (var i=0; i<arr.length; i++) {
        try {
          promises.push( x.loadPackageByCode( arr[i] ) );
        } catch (err) {
          console.error("vr-player-v1: failed to import",arr[i],err );
        }
      }
      return Promise.allSettled( promises );
    }

    var m = x.getPackageByCode(code);
    if (!m) {
      console.error("loadPackageByCode: Package not found for code=",code);
      return;
    }
    var url = m.url;
    return x.loadPackage( url );
  }
  
  // feature: single API for all
  // btw we don't need array iteration then!
  var orig = x.loadPackage;
  x.loadPackage = function(url) {
    if (x.getPackageByCode(url))
      return x.loadPackageByCode(url);
    return orig( url );
  }
  
  // feature: track loaded packages
  
  var loadedPackagesTable = {};
  x.isPackageLoaded = function(code) {
    return !!loadedPackagesTable[code];
  }
  var orig1 = x.loadPackageByCode;
  x.loadPackageByCode = function(code) {
    var q = orig1(code);
    q.then( () => {
      loadedPackagesTable[code] = true;
    });
    return q;
  }

}