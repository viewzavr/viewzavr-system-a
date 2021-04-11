# R-NO-PROMISES-ON-RESTORE - REJECTED

Currently as we implemented that object dump may contain references to external packages,
we have to load those packages before calling actual create code.
As package loading is async operation (for some reason of `import` call), we have
to chage createSyncFromDump to a promise-based function (which return promise which
resolves when object is actually created).

Maybe, and probably, it is better to split createSync call into 2 - load packages
in a whole subtree and then actual creation of that tree.

Hovewer there is a nuance - a created code, in turn, might want to load it's own
packages (in some sort of create function). So, to retain recursive nature,
seems we have to leave createSync as an async function...
