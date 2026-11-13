' Silent Windows Desktop Launcher (Zero Console Window)
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
winDir = fso.GetParentFolderName(WScript.ScriptFullName)
batPath = fso.BuildPath(winDir, "Launch-S2RFilm-Studio.bat")
WshShell.Run Chr(34) & batPath & Chr(34), 0, False
