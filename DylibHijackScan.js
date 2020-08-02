function DylibHijackScan () {
ObjC.import('Foundation')
ObjC.import('stdlib')
gather = "lsof | tr -s ' ' | cut -d' ' -f9 | sed '/^$/d' | grep '^\/'| sort | uniq"

var app = Application.currentApplication();
app.includeStandardAdditions = true;
var output = ""

try{


function executeBackground(binPath,arg1,arg2){
	var path = binPath 
	var args = [arg1,arg2]
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

  
var commandOutput = app.doShellScript(gather);
var fixedOutput = commandOutput.replace(/\r/gi, "\n");
var splitOutput = fixedOutput.split("\n")
var lsofArray = []
for (var key in splitOutput){
     lsofArray.push(splitOutput[key])
    }
    
var fileType = []
for (var key in lsofArray) {
		 var fileCommand = executeBackground("/usr/bin/file", "",lsofArray[key])
     fileType += fileCommand + "\n";
}
var fixedFileOutput = fileType.replace(/\r/gi, "\n");
var splitFileOutput = fixedFileOutput.split("\n")


var fileArray = []
for (var key in splitFileOutput){
     fileArray.push(splitFileOutput[key])
}

var MachoBinAndType = []
for (key in fileArray){
     if (fileArray[key].indexOf("Mach-O") !== -1) {
     MachoBinAndType.push(fileArray[key])
}
}

var MachoBinFound = []
for (key in MachoBinAndType){
    MachoBinFound.push(MachoBinAndType[key].split(":")[0]);
}

var MachoBinSort = []
for (key in MachoBinFound){
    MachoBinSort.push(MachoBinFound[key].split(" ")[0]);
}

var arrayUnique = function (arr){
    return arr.filter(function(item, index){
        return arr.indexOf(item) >= index;
     });
};

var MachoBinFoundUnique = arrayUnique(MachoBinSort);
output += "Dylib Hijack Results" + "\n"

for (var key in MachoBinFoundUnique) {
	var otoolCommandRPATH = executeBackground("/usr/bin/otool","-l", MachoBinFoundUnique[key])
    
    var binaryPath = MachoBinFoundUnique[key];
    
    if (otoolCommandRPATH.indexOf("LC_LOAD_DYLIB") !== -1){
    
    var otoolCommandRPATHgrep = app.doShellScript("otool -l" + " " + MachoBinFoundUnique[key] + " " + "| grep @rpath | tr -s ' ' | cut -d ' ' -f3")
    
var fixedOutputrpath = otoolCommandRPATHgrep.replace(/\r/gi, "\n");
var splitOutputrpath = fixedOutputrpath.split("\n")

     var otoolCommandLC_RPATH = app.doShellScript("otool -l" + " " + MachoBinFoundUnique[key] + " " + "| grep LC_RPATH -A 3 | grep path | tr -s ' ' | cut -d ' ' -f3")
    
    var fixedOutputLC_RPATH = otoolCommandLC_RPATH.replace(/\r/gi, "\n");
    var splitOutputLC_RPATH = fixedOutputLC_RPATH.split("\n")
    }
var rpathArray = []
for (var key in splitOutputrpath){
     rpathArray.push(splitOutputrpath[key])
     }
    
    var lcrpathArray = []
for (var key in splitOutputLC_RPATH){
             lcrpathArray.push(splitOutputLC_RPATH[key])
        }
    
}
    for (key in lcrpathArray){
    section1 = lcrpathArray[key]
     for (key in rpathArray){
         section2 = rpathArray[key]
         if (section1.indexOf("@executable_path") !== -1) {
            var rpathDylib = binaryPath.split('/').slice(0, -1).join('/') + section1.split("@executable_path")[1] + section2.split("@rpath")[1]
            rpathDylibExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPath(rpathDylib)
                 if (rpathDylibExistsCheck == false) {

    output += "The binary: " + " " + binaryPath + "\n" + "\n"
        output += "Contains the following rpath Dylib which does not exist! : " + rpathDylib + "\n" + "\n"
                 }
} 

     }
         if (section1.indexOf("@loader_path") !== -1){
            var rpathDylibload = binaryPath.split('/').slice(0, -1).join('/') + section1.split("@loader_path")[1] + section2.split("@rpath")[1]

            rpathDylibloadExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPath(rpathDylibload)
                 if (rpathDylibloadExistsCheck == false) {
           output += "The binary: " + " " + binaryPath + "\n" + "\n"
           output += "Contains the following rpath Dylib which does not exist! : " + rpathDylibload + "\n" + "\n"
    
         }
} 
            }

for (var key in MachoBinFoundUnique) {
	var otoolCommand = executeBackground("/usr/bin/otool","-l", MachoBinFoundUnique[key])
   
    if (otoolCommand.indexOf("LC_LOAD_WEAK_DYLIB") !== -1) {
    var weakDylib = otoolCommand.split("LC_LOAD_WEAK_DYLIB")[1].split("name")[1].split("(offset")[0].split(" ")[1]
    weakDylibExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPath(weakDylib);
        if (weakDylibExistsCheck == false) {
      
            output += "The binary: " + " " + MachoBinFoundUnique[key] + " " + "\n" + "\n" + "Contains the following Weak Dylib which does not exist !: " + weakDylib + "\n" + "\n"
             }
}
}
  
}catch(error){
       output += error.toString()
		}
return output
}
