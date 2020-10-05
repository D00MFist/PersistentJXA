function InjectCheck(Arg1) {

//Usage:
//InjectCheck("All") --for all apps in '/Applications'
//InjectCheck("/Applications/Firefox.app")  --for a specific Application Bundle

    var output = "";

    // Getting code signature information
    function codeSign(pathToapplication) {
        ObjC.import("Security");
        let staticCode = Ref();
        path = $.CFURLCreateFromFileSystemRepresentation($.kCFAllocatorDefault, pathToapplication, pathToapplication.length, true);
        $.SecStaticCodeCreateWithPath(path, 0, staticCode);
        let codeInfo = Ref();
        $.SecCodeCopySigningInformation(staticCode[0], 0x7F, codeInfo);
        ObjC.bindFunction('CFMakeCollectable', ['id', ['void *']]);
        codeInfo_c = $.CFMakeCollectable(codeInfo[0]);

        var signingInformationString = JSON.stringify(ObjC.deepUnwrap(codeInfo_c), null, 2);

        //Full Signing Information for Debugging
        //output += "----FullInfo----" + '\n' + signingInformationString)

        var signingInformation = ObjC.deepUnwrap(codeInfo_c)

        //Get Hardened Runtime
        let applicationName = signingInformation["info-plist"].CFBundleExecutable
         output += "************************************** " + applicationName + " ************************************** " + '\n'


        let hardenedRuntimeFlag = 10000
        let signingFlags = signingInformation.flags.toString(16)

        output += "The " + applicationName + " application has a Hardened Runtime Value of " + signingFlags + '\n'
        	if (signingFlags < hardenedRuntimeFlag) {
            output += "Hardened Runtime is not set for the " + applicationName + " application. Nice and easy injection option: use 'DYLD_INSERT_LIBRARIES'. (e.g.: DYLD_INSERT_LIBRARIES=/PATH_TO/evil.dylib /Applications/Calculator.app/Contents/MacOS/Calculator &) or Attempt injection with listtasks/libinject in Mythic Agent poseidon" + '\n'
        } else {
            output += "Hardened Runtime is set" + '\n'

            //Get Entitlements
            let entitlements = signingInformation["entitlements-dict"]

            //Set Problematic Entitlements
            let disableDylbkeyExists = entitlements["com.apple.security.cs.disable-library-validation"]
            let allowDylibkeyExsists = entitlements["com.apple.security.cs.allow-dyld-environment-variables"]
            let unsignMemkeyExists = entitlements["com.apple.security.cs.allow-unsigned-executable-memory"]
            let getTaskkeyExists = entitlements["com.apple.security.get-task-allow"]

            if (disableDylbkeyExists && allowDylibkeyExsists) {
                output += "The " + applicationName + " application contains the 'com.apple.security.cs.disable-library-validation (allows any dylib)' and 'com.apple.security.cs.allow-dyld-environment-variables' (allows DYLD_INSERT_LIBRARIES abuses) entitlements are present. Nice and easy injection option: use 'DYLD_INSERT_LIBRARIES'. (e.g.: DYLD_INSERT_LIBRARIES=/PATH_TO/evil.dylib /Applications/Calculator.app/Contents/MacOS/Calculator &" + '\n'
            }

            if (unsignMemkeyExists && allowDylibkeyExsists) {
                output += "The " + applicationName + " application contains the 'com.apple.security.cs.allow-unsigned-executable-memory' (allows shellcode injection) and 'com.apple.security.cs.allow-dyld-environment-variables' (allows DYLD_INSERT_LIBRARIES abuses) entitlements are present. Code injection is possible but requires some creativity that cannot be automated." + '\n'
            } else if (unsignMemkeyExists && disableDylbkeyExists) {
                output += "The " + applicationName + " application contains the 'com.apple.security.cs.allow-unsigned-executable-memory' (allows shellcode injection) and 'com.apple.security.cs.disable-library-validation' (allows library injection) entitlements. Code injection is possible but requires some creativity that cannot be automated. Look into dylib hijacks or proxying" + '\n'
            } else if (unsignMemkeyExists && allowDylibkeyExsists == false) {
                output += "The " + applicationName + " application contains the 'com.apple.security.cs.allow-unsigned-executable-memory' entitlement is present. Code injection is possible but requires some creativity that cannot be automated." + '\n'
            }

            if (getTaskkeyExists) {
                output += "The " + applicationName + " application contains the 'com.apple.security.get-task-allow' entitlements is present. Attempt injection with listtasks/libinject in Mythic Agent poseidon" + '\n'
            }

        }

        //Electron App Check
        let filePath = pathToapplication + "/Contents/Resources/app.asar"

        let asarExistscheck = $.NSFileManager.alloc.init.fileExistsAtPath(filePath)
        if (asarExistscheck == true) {
            output += "The " + applicationName + " application contains a app.asar and is likely an Electron app. Can abuse ELECTRON_RUN_AS_NODE environment variable for injection. e.g: create plist and use launchctl to load tamper plist. Example is https://blog.xpnsec.com/macos-injection-via-third-party-frameworks/" + '\n'
        } else {
            output += "No 'app.asar' file. Likely not an Electron app" + '\n'
        }

    }

    function listDirectory(strPath) {
        var fm = $.NSFileManager.defaultManager;
        return ObjC.unwrap(
                fm.contentsOfDirectoryAtPathError($(strPath)
                    .stringByExpandingTildeInPath, null))
            .map(ObjC.unwrap);
    }

if (Arg1 == "All") {

let enumerateFolderContents = listDirectory('/Applications')

function stoperror() {
    return true;
}
var installedApps = []
		for (var key in enumerateFolderContents) {
		    try {

		        codeSign("/Applications/" + enumerateFolderContents[key])
		    } catch (e) {
		        stoperror(e)
		    }

		}
} else {
	try {

		 codeSign(Arg1)
		    } catch (e) {
		        stoperror(e)
		    }

}
return output
}
