# Requirements

## R-STATE

Player should somehow save it's state.
A good idea is also to save player/scene state in a window url 
(for example hash part), when player is implemented as a browser app.

## R-EXTRAS
We should be able to employ additional functionality to scene.
A player should provide some model for this.

For example packages model, where package is a set of component types and maybe something else. 
If user attaches package to a scene, a components provided by it become available for user to add to scene.
User might select packages from library by checkboxes, or add by package url.

## R-EXTRAS-STATE

A player should somehow save extras configured by user.
If packages model is implemented and they are added from a list,
this list should be saved among with scene state.

## R-NO-MODULES-WORD

Do not name loadable extras as modules. Module is a semantical term appliable to many things.
Denis names those extras as `packages` - probably this is a good idea.

## R-EXTRAS-TABLE

Provide a table of extras so user may simply select which extras he wants to be loaded into project.
It implies an organization of such table and methods to load js modules using it. It will be simplified
when js will introduce relative modules (https://github.com/WICG/import-maps).
