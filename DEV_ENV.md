# Development Environment Configuration

## Shell Environment
- Primary shell: PowerShell
- Location: `C:\Program Files\PowerShell\7\pwsh.exe`

### PowerShell Command Adjustments
- Do not use pipe to `cat` (this is a bash convention)
- Use PowerShell native commands where possible
- For Git commands, use standard Git syntax (PowerShell handles these correctly)

### Common Command Translations
Bash -> PowerShell:
- `ls` -> `Get-ChildItem` (or `ls` works as an alias)
- `cat` -> `Get-Content`
- `echo` -> `Write-Output` (or `echo` works as an alias)
- `mkdir` -> `New-Item -ItemType Directory`
- `rm` -> `Remove-Item`
- `cp` -> `Copy-Item`
- `mv` -> `Move-Item`

### Git Commands in PowerShell
Git commands work the same in PowerShell as in other shells:
```powershell
git status
git add .
git commit -m "message"
git push
git pull
```

### Environment Variables
- Use `$env:VARIABLE_NAME` syntax in PowerShell
- Path separator is semicolon (;) not colon (:)

### Notes
- PowerShell is case-insensitive by default
- Use backslashes (\) for file paths, or forward slashes (/) work too
- Remember to handle spaces in paths with quotes
- PowerShell has different output formatting than bash 