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

## R-SEE-OBJECT-PARAMS-WHEN-ADDING

When adding new object, see it's params without additional user clicks.
This is from expereince.

## R-NEED-EVENTS-IN-PLAYER
We need to track events in player, for example when package is loaded.

## R-TRACK-LOADED-PACKAGES
do not call their setup twice

## R-FILE-GUI-NEED-RELOAD
Gui element for file-type parameter should have a "reload" command which may be triggered by user.

# R-LINKS-NO-DEFAULT-VALUE
When adding a link (in gui), it should not have a default target parameter value (it should be blank).
There were cases when adding a link - it have blank source param and some selected target param.
An obj started behaving with default value, which were not the case (program hanged).

