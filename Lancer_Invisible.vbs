Set WshShell = CreateObject("WScript.Shell")

' Lance le serveur en cachette
WshShell.Run "cmd /c cd server && node index.js", 0, false

' Attend 2 secondes
WScript.Sleep 2000

' Lance le client en cachette
WshShell.Run "cmd /c cd client && npm run dev", 0, false

