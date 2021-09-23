//Based on work by theevilbit
function TermPref(command) {
    ObjC.import('Foundation')
    ObjC.import("Cocoa")
    ObjC.import('stdlib')
    let currentApp = Application.currentApplication();
    currentApp.includeStandardAdditions = true;
    let userHome = $.getenv('HOME')
    var output = ""

    try {

        function listDirectory(strPath) {
            var fm = $.NSFileManager.defaultManager;
            return ObjC.unwrap(
                    fm.contentsOfDirectoryAtPathError($(strPath)
                        .stringByExpandingTildeInPath, null))
                .map(ObjC.unwrap);
        }

        function reloadTerminal() {
            let path = "/usr/bin/killall"
            let args = ["-hup", "Terminal"]
            var pipe = $.NSPipe.pipe;
            var file = pipe.fileHandleForReading;
            var task = $.NSTask.alloc.init;
            task.launchPath = path;
            task.arguments = args;
            task.standardOutput = pipe;
            task.standardError = pipe;
            task.launch;
        }

        var termPrefsPlist = userHome + "/Library/Preferences/com.apple.Terminal.plist"

        var plist = $.NSMutableDictionary.alloc.initWithContentsOfFile(termPrefsPlist)
        var unwrapTermPlist = ObjC.deepUnwrap(plist)

        unwrapTermPlist["Window Settings"]["Basic"]["CommandString"] = command

        unwrapTermPlist = $(unwrapTermPlist)
        unwrapTermPlist.writeToFileAtomically(termPrefsPlist, true)

        reloadTerminal()

        output += "Terminal Preferences Persistence installed. Successfully modified " + termPrefsPlist + " for Persistence"

    } catch (error) {
        output += error.toString()
    }
    return output

}
