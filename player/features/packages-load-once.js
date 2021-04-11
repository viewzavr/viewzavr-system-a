// R-LOAD-PACKAGE-ONCE

export function setup( x ) {
  // feature: track loaded packages including with urls
  var packagesStartedToLoad = {};

  var orig1 = x.loadPackage;
  x.loadPackage = function( path ) {
    // если это не строка - разбираемся отдельно, потом сюда же вернутся
    if (typeof(path) !== 'string')
      return orig1( path );

    if (packagesStartedToLoad[ path ])
      return Promise.resolve( true ); // todo - maybe loadPackage should return something useful in promise
    packagesStartedToLoad[ path ] = true;
    return orig1( path );
  }
}
