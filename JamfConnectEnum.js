// JamfConnectEnum.js
// Enumerates Jamf Connect configuration from managed and local preference plists
// on macOS endpoints. Extracts Azure AD / Entra ID client IDs, tenant IDs,
// Kerberos realm info, license details, post-auth scripts, and auth policy settings.
//
// Data Sources:
//   - /Library/Managed Preferences/com.jamf.connect.plist        (MDM-pushed menubar app config)
//   - /Library/Managed Preferences/com.jamf.connect.login.plist  (MDM-pushed login window config)
//   - /Library/Preferences/com.jamf.connect.plist                (local menubar app config)
//   - /Library/Preferences/com.jamf.connect.login.plist          (local login window config)
//   - /Library/Managed Preferences/<user>/complete.plist          (per-user MCX aggregate of all profiles)
//
// Usage:
//   osascript -l JavaScript -e "$(cat JamfConnectEnum.js)" -e "Jamf_Connect_Enum()"

function Jamf_Connect_Enum(){
	ObjC.import('Foundation');
	let fileManager = $.NSFileManager.defaultManager;

	// --- Utility functions ---

	// Check if a file exists at the given POSIX path
	function file_exists(path){
		return fileManager.fileExistsAtPath($(path));
	}

	// Read a plist file into a native JS object, returns null if missing or unreadable
	function read_plist(path){
		if(!file_exists(path)) return null;
		let dict = $.NSMutableDictionary.alloc.initWithContentsOfFile(path);
		if(dict.isNil()) return null;
		return ObjC.deepUnwrap(dict);
	}

	// MCX complete.plist wraps each key's value in { mcxdomain, source, value }.
	// This extracts a specific domain (e.g. "com.jamf.connect") and unwraps
	// each key to its actual value.
	function unwrap_mcx_domain(contents, domain){
		let d = contents[domain];
		if(!d) return null;
		let result = {};
		Object.keys(d).forEach(function(k){
			let entry = d[k];
			result[k] = (entry && typeof entry === 'object' && 'value' in entry) ? entry.value : entry;
		});
		return result;
	}

	// Return a subset of obj containing only the specified keys
	function pick(obj, keys){
		if(!obj) return {};
		let r = {};
		keys.forEach(function(k){ if(obj[k] != null) r[k] = obj[k]; });
		return r;
	}

	// Decode a base64-encoded string to UTF-8 text
	function b64decode(s){
		try {
			let data = $.NSData.alloc.initWithBase64EncodedStringOptions($(s), 0);
			return ObjC.unwrap($.NSString.alloc.initWithDataEncoding(data, $.NSUTF8StringEncoding));
		} catch(e){ return null; }
	}

	// Decode and parse the Jamf Connect license plist (stored as base64 XML in config).
	// Returns org name, email, product, edition, license key, dates, and seat count.
	function parseLicense(b64){
		try {
			let xml = b64decode(b64);
			if(!xml) return null;
			let nsstr = $.NSString.alloc.initWithUTF8String(xml);
			let data = nsstr.dataUsingEncoding($.NSUTF8StringEncoding);
			let fmt = Ref();
			let err = Ref();
			let plist = $.NSPropertyListSerialization.propertyListWithDataOptionsFormatError(data, 0, fmt, err);
			if(plist.isNil()) return null;
			let obj = ObjC.deepUnwrap(plist);
			return pick(obj, ["Name","Email","Product","Edition","LicenseKey","DateIssued","ExpirationDate","NumberOfClients","MajorVersion"]);
		} catch(e){ return null; }
	}

	// List contents of a directory, returns array of filenames
	function listDir(path){
		try {
			return ObjC.unwrap(
				fileManager.contentsOfDirectoryAtPathError($(path), null)
			).map(ObjC.unwrap);
		} catch(e){ return []; }
	}

	// Check if a path is a directory
	function isDirectory(path){
		let isDir = Ref();
		let exists = fileManager.fileExistsAtPathIsDirectory($(path), isDir);
		return exists && isDir[0];
	}

	// Shallow merge two objects; override keys win over base keys
	function merge(base, override){
		let r = {};
		if(base) Object.keys(base).forEach(function(k){ r[k] = base[k]; });
		if(override) Object.keys(override).forEach(function(k){ r[k] = override[k]; });
		return r;
	}

	// --- Data collection ---

	// Read managed (MDM-pushed) plists — these take priority over local
	let login   = read_plist("/Library/Managed Preferences/com.jamf.connect.login.plist") || {};
	let connect = read_plist("/Library/Managed Preferences/com.jamf.connect.plist") || {};

	// Merge with local plists as fallback (managed values override local)
	let mLogin   = merge(read_plist("/Library/Preferences/com.jamf.connect.login.plist") || {}, login);
	let mConnect = merge(read_plist("/Library/Preferences/com.jamf.connect.plist") || {}, connect);

	// Enumerate all user subdirectories under /Library/Managed Preferences/
	// Each subdirectory is a username with a complete.plist containing the
	// merged MCX profile for that user — works regardless of who runs the script.
	let perUser = {};
	let managedBase = "/Library/Managed Preferences";
	listDir(managedBase).forEach(function(item){
		let fullPath = managedBase + "/" + item;
		if(!isDirectory(fullPath)) return;
		let contents = read_plist(fullPath + "/complete.plist");
		if(!contents) return;
		let c = unwrap_mcx_domain(contents, "com.jamf.connect") || {};
		let l = unwrap_mcx_domain(contents, "com.jamf.connect.login") || {};
		perUser[item] = merge(l, c);
	});

	// --- Output formatting ---

	let out = [];
	let sep = "══════════════════════════════════════════════════════";

	out.push(sep);
	out.push("  JAMF CONNECT ENUMERATION");
	out.push(sep);

	// Section 1: Azure AD / Entra ID configuration
	// Client IDs, tenant IDs, OIDC/ROPG providers, and redirect URIs.
	// These can be used to authenticate to Azure AD as the registered app
	// or to craft OAuth phishing flows targeting the same tenant.
	out.push("\n┌─ AZURE / IDP CONFIGURATION ─────────────────────────");
	out.push("│  Use: Authenticate to Azure AD as this app or craft");
	out.push("│  phishing OAuth flows using these values.");
	out.push("├─────────────────────────────────────────────────────");
	let idpSettings = mConnect.IdPSettings || {};
	let idpKeys = ["OIDCClientID","OIDCROPGID","OIDCTenant","ROPGTenant","OIDCProvider","ROPGProvider","OIDCRedirectURI","ROPGRedirectURI"];
	let allIdp = merge(pick(mLogin, idpKeys), pick(idpSettings, ["Provider","TenantID","ROPGID","ChangePasswordURL","ResetPasswordURL"]));
	Object.keys(allIdp).forEach(function(k){ out.push("│  " + k + ": " + allIdp[k]); });
	out.push("└─────────────────────────────────────────────────────");

	// Section 2: Local admin escalation via OIDC claims
	// Jamf Connect can grant local admin based on an IdP token claim.
	// OIDCAdminAttribute is the claim name, OIDCAdmin is the required value.
	// If you can mint or modify tokens, include this claim to get admin.
	out.push("\n┌─ LOCAL ADMIN ESCALATION ────────────────────────────");
	out.push("│  Use: Control the IdP token — set this claim to");
	out.push("│  gain local admin on this Mac.");
	out.push("├─────────────────────────────────────────────────────");
	let adminAttr = mLogin["OIDCAdminAttribute"] || "N/A";
	let adminVal  = mLogin["OIDCAdmin"] || "N/A";
	out.push("│  Claim:  " + adminAttr);
	out.push("│  Value:  " + adminVal);
	out.push("│  → Token needs { \"" + adminAttr + "\": [\"" + adminVal + "\"] }");
	out.push("└─────────────────────────────────────────────────────");

	// Section 3: Kerberos / Active Directory realm configuration
	// Useful for identifying the AD domain for Kerberoasting,
	// ticket requests, or lateral movement.
	let kerb = mConnect.Kerberos || {};
	if(Object.keys(kerb).length){
		out.push("\n┌─ KERBEROS / ACTIVE DIRECTORY ───────────────────────");
		out.push("│  Use: Kerberoasting, ticket requests, lateral");
		out.push("│  movement via AD realm.");
		out.push("├─────────────────────────────────────────────────────");
		Object.keys(kerb).forEach(function(k){ out.push("│  " + k + ": " + kerb[k]); });
		out.push("└─────────────────────────────────────────────────────");
	}

	// Section 4: Jamf Connect license information
	// The license is stored as a base64-encoded plist. Decoding it reveals
	// the organization name, licensed seat count, and expiration date.
	let license = mConnect.LicenseFile ? parseLicense(mConnect.LicenseFile) : null;
	if(license){
		out.push("\n┌─ LICENSE / ORG INTEL ───────────────────────────────");
		out.push("│  Use: Org name, seat count, expiry for targeting");
		out.push("│  and social engineering.");
		out.push("├─────────────────────────────────────────────────────");
		Object.keys(license).forEach(function(k){ out.push("│  " + k + ": " + license[k]); });
		out.push("└─────────────────────────────────────────────────────");
	}

	// Section 5: Post-authentication script
	// ScriptPath runs after a successful OIDC login at the macOS login window.
	// If writable, it can be hijacked for persistence.
	let scriptPath = mLogin["ScriptPath"];
	if(scriptPath){
		out.push("\n┌─ POST-AUTH SCRIPT ──────────────────────────────────");
		out.push("│  Use: Hijack or modify for persistence. Runs");
		out.push("│  after successful OIDC login.");
		out.push("├─────────────────────────────────────────────────────");
		out.push("│  Path:   " + scriptPath);
		out.push("│  Exists: " + file_exists(scriptPath));
		if(file_exists(scriptPath)){
			try {
				let attrs = ObjC.deepUnwrap(fileManager.attributesOfItemAtPathError($(scriptPath), null));
				if(attrs){
					out.push("│  Owner:  " + (attrs.NSFileOwnerAccountName || "?") + ":" + (attrs.NSFileGroupOwnerAccountName || "?"));
					out.push("│  Perms:  0" + (attrs.NSFilePosixPermissions || 0).toString(8));
				}
			} catch(e){}
		}
		out.push("└─────────────────────────────────────────────────────");
	}

	// Section 6: Internal URLs found in configuration
	// Help portals, password reset endpoints, and OAuth redirect URIs.
	let urls = [];
	if(mLogin.HelpURL) urls.push("HelpURL:       " + mLogin.HelpURL);
	if(mConnect.UserHelp && mConnect.UserHelp.HelpType) urls.push("SupportPortal: " + mConnect.UserHelp.HelpType);
	if(idpSettings.ChangePasswordURL) urls.push("PasswordReset: " + idpSettings.ChangePasswordURL);
	if(mLogin.OIDCRedirectURI) urls.push("OIDCRedirect:  " + mLogin.OIDCRedirectURI);
	if(urls.length){
		out.push("\n┌─ INTERNAL URLS ─────────────────────────────────────");
		out.push("│  Use: Recon targets, phishing pretexts, redirect");
		out.push("│  URI abuse.");
		out.push("├─────────────────────────────────────────────────────");
		urls.forEach(function(u){ out.push("│  " + u); });
		out.push("└─────────────────────────────────────────────────────");
	}

	// Section 7: Accounts hidden from Jamf Connect user migration
	// MigrateUsersHide lists local accounts excluded from migration —
	// typically service accounts or admin accounts worth investigating.
	let hidden = mLogin["MigrateUsersHide"];
	if(hidden && hidden.length){
		out.push("\n┌─ HIDDEN / SERVICE ACCOUNTS ─────────────────────────");
		out.push("│  Use: Excluded from migration — likely service or");
		out.push("│  admin accounts worth targeting.");
		out.push("├─────────────────────────────────────────────────────");
		hidden.forEach(function(u){ out.push("│  " + u); });
		out.push("└─────────────────────────────────────────────────────");
	}

	// Section 8: Per-user MCX profile data
	// Each user directory under /Library/Managed Preferences/ contains a
	// complete.plist with the merged configuration profiles for that user.
	let userNames = Object.keys(perUser);
	if(userNames.length){
		out.push("\n┌─ PER-USER MCX PROFILES ─────────────────────────────");
		out.push("│  Users with managed Jamf Connect configuration.");
		out.push("├─────────────────────────────────────────────────────");
		userNames.forEach(function(u){
			out.push("│  ▸ " + u);
			let ud = perUser[u];
			let interesting = pick(ud, ["OIDCClientID","OIDCROPGID","OIDCTenant","ROPGTenant"]);
			Object.keys(interesting).forEach(function(k){ out.push("│    " + k + ": " + interesting[k]); });
			if(ud.IdPSettings){
				["Provider","TenantID","ROPGID"].forEach(function(k){
					if(ud.IdPSettings[k]) out.push("│    " + k + ": " + ud.IdPSettings[k]);
				});
			}
		});
		out.push("└─────────────────────────────────────────────────────");
	}

	// Section 9: Authentication policy settings
	// These control fallback behavior and can indicate bypass opportunities:
	//   LocalFallback: true = can auth with local password if IdP unreachable
	//   DenyLocal: true = blocks local-only accounts entirely
	//   EnableFDE: FileVault enabled at enrollment
	//   Migrate: local accounts migrated to IdP-linked accounts
	//   PassthroughAuth: Kerberos ticket obtained automatically at login
	//   AutoAuthenticate: menubar app auto-signs in silently
	out.push("\n┌─ AUTH POLICY NOTES ─────────────────────────────────");
	out.push("│  Use: Understand auth bypass and local login");
	out.push("│  opportunities.");
	out.push("├─────────────────────────────────────────────────────");
	[
		["LocalFallback",    mLogin.LocalFallback],
		["DenyLocal",        mLogin.DenyLocal],
		["EnableFDE",        mLogin.EnableFDE],
		["Migrate",          mLogin.Migrate],
		["PassthroughAuth",  mLogin.OIDCUsePassthroughAuth],
		["AutoAuthenticate", mConnect.SignIn ? mConnect.SignIn.AutoAuthenticate : null],
	].forEach(function(pair){
		out.push("│  " + pair[0] + ": " + (pair[1] != null ? pair[1] : "N/A"));
	});
	out.push("└─────────────────────────────────────────────────────");

	out.push("\n" + sep);
	return out.join("\n");
}
