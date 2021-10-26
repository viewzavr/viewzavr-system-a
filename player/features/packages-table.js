// packets table abstraction
// this table holds a mapping: package-code -> package-record

export function setup( x ) {

  var packagesTable = {};
  // a table of records: { code, title, url, info, ... }
  
  // opts = { code: codename, url: package-url }
  x.addPackage = function(opts,arg2) {
    if (Array.isArray(opts)) {
      opts.forEach( function(rec) { x.addPackage(rec); } );
      return;
    }
    if (typeof(opts) === "string") {
       opts = { code: opts, url: arg2 }
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
  x.loadPackage = function(url_or_code) {
    if (x.getPackageByCode(url_or_code))
      return x.loadPackageByCode(url_or_code);
    return orig( url_or_code );
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
  
  
  /* а зачем нам это? тем более тогда надо с массивами разбираться
     пусть пока в аргументах будет. см выше.
     
  // feature: track loaded packages by code or by url
  // actually it was developed for packages with codes
  // but as it now considers urls too, probably it is
  // better move to dedicated feature file
  var loadedPackagesTable = {};
  x.isPackageLoaded = function(path) {
    return !!loadedPackagesTable[path];
  }
  var orig1 = x.loadPackage;
  x.loadPackage = function(path) {
    var q = orig1(path);
    q.then( () => {
      loadedPackagesTable[path] = true;
    });
    return q;
  }
  */
}