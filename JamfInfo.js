function Jamf_Info(){
	let output = {};
	let json = false
	let fileManager = $.NSFileManager.defaultManager;
	function file_exists(path){
	let fileManager = $.NSFileManager.defaultManager;
	return fileManager.fileExistsAtPath($(path));
}
	if(!file_exists("/Library/Preferences/com.jamfsoftware.jamf.plist")){
		if(json==false){
			return "**************************************\n" + "********** Jamf Information  **********\n" + "**************************************\n" + "Required file not found";
		}else{
			return JSON.stringify({"Plist_Contents": "Jamf_Information"});
		}
	}
	let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile("/Library/Preferences/com.jamfsoftware.jamf.plist");
	let contents = ObjC.deepUnwrap(dict);
	output['JAMF Software Server (JSS) Url'] = contents['jss_url'];
	output['Azure Active Directory Enabled'] = contents['microsoftCAEnabled'];
	output['Azure Tenant Domain Name'] = contents['microsoftCATenantDomainName'];
	output['Self Service App Path'] = contents['self_service_app_path'];
	output['SSL Verification'] = contents['verifySSLCert'];
	if(json==false){
		output = "********************************\n" + "***** Jamf Info *****\n" + "********************************\n" + JSON.stringify(output, null , 1);
	}else{
		output['Plist_Contents'] = "Jamf_Information";
		output = JSON.stringify(output, null, 1);
	}

	return output;
	}
