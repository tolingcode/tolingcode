@echo off
REM TolingCode Publish Script (Windows)
REM Usage: publish.bat <skill-path> <name> [version]

SET SKILL_PATH=%1
SET NAME=%2
SET VERSION=%3

IF "%VERSION%"=="" (
    REM Use today's date as version
    FOR /F "tokens=2-4 delims=/ " %%A IN ('date /T') DO (SET VERSION=%%C.%%B.%%A)
)

ECHO Publishing %NAME%@%VERSION%...

REM Create tarball (requires tar.exe on Windows 10+)
tar -czf %NAME%-%VERSION%.tar.gz -C %SKILL_PATH% .

ECHO Created: %NAME%-%VERSION%.tar.gz
ECHO.
ECHO Next steps:
ECHO   1. Upload to toling.me: scp %NAME%-%VERSION%.tar.gz user@toling.me:/var/www/toling.me/packages/skills/
ECHO   2. Update registry.json on server
ECHO.
ECHO Or use the API (when implemented):
ECHO   curl -X POST https://toling.me/api/registry/publish ^
ECHO     -F "type=skills" ^
ECHO     -F "name=%NAME%" ^
ECHO     -F "version=%VERSION%" ^
ECHO     -F "package=@%NAME%-%VERSION%.tar.gz"
