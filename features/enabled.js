export function setup( vz, m ) {
  vz.register_feature( "enabled", enabled );
}

export function enabled( env ) {
    env.addCheckbox( "enabled",true );
}