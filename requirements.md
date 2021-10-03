# R-INTRO-TECH

Intro should describe which technology is desired for programmer to use to work with Viewzavr.
(Denis, 2021-02)

# R-PLAYER-FIRST

We should start with gui-first idea in mind. Apps/modules should not be the center of starting to create a new scene.
A new scene should be a gui-confugrable scene! This is crucual for starting for new people.
A point of start is a player. [Don't know is it a requirement or a response to it.]

# R-NO-DUPLICATE

Probably a player should not duplicate parameter values in a window hash which were not changed by user.
(e.g. load scene json -> no dup in hash).

# R-GUI-TREE
It seems necessary to may create child items for arbitrary elements in gui.
Example: add items to dialog, to sidebar, to row.
In that case, adding items to root element is same logic.
And in that latter case, a "add item" primary button is a special button
in addition to normal adding items gui to root element.

# R-LOAD-PACKAGE-ONCE
If package is already loaded by loadPackage, ongoing calls to same url should just return.
(no import, nor setup should be called).

# R-NEED-GUI-TITLE we need be able to differentiate user-screen titles on gui elements and actual parameter names
 => # R-PROVIDE-GUI-TITLE we need a way to specify title for gui element
   => # F-USE-PARAM-OPTIONS

# R-CHANGE-OBJ-NAME-GUI
Need a way to change object name in gui edit mode.
ideas,
1) direct button "rename",
2) edit in (xml, yaml) and allow rename from there?  F-XML-ID
3) allow to setup id in dump? F-DUMP-READ-ID



