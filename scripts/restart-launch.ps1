param(
    [Parameter(Mandatory = $true)]
    [string]$BatPath
)

$ErrorActionPreference = 'SilentlyContinue'

$projectDir = Split-Path -Parent $BatPath
$port = 3000
$projectDirNorm = $projectDir.TrimEnd('\')

function Stop-OldDevWindows {
    Get-CimInstance Win32_Process -Filter "Name='cmd.exe'" | ForEach-Object {
        $commandLine = $_.CommandLine
        if (-not $commandLine) { return }

        $inProject = $commandLine -like "*$projectDirNorm*"
        $isWorker = $inProject -and $commandLine -like '*restart.bat*' -and $commandLine -like '*_run_*'
        $isNpmDev = $inProject -and ($commandLine -like '*npm run dev*' -or $commandLine -like '*next dev*')

        if ($isWorker -or $isNpmDev) {
            Stop-Process -Id $_.ProcessId -Force
        }
    }

    if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
        Get-NetTCPConnection -LocalPort $port -State Listen | ForEach-Object {
            $processId = $_.OwningProcess
            $current = Get-CimInstance Win32_Process -Filter "ProcessId=$processId"

            while ($current) {
                Stop-Process -Id $current.ProcessId -Force
                if ($current.Name -eq 'cmd.exe') { break }
                if (-not $current.ParentProcessId) { break }
                $current = Get-CimInstance Win32_Process -Filter "ProcessId=$($current.ParentProcessId)"
            }
        }
    }
}

Stop-OldDevWindows
Start-Sleep -Milliseconds 500

$cmdArgs = @(
    '/k',
    "title Self Care - Dev Server & cd /d `"$projectDirNorm`" & call `"$BatPath`" _run_"
)

Start-Process -FilePath 'cmd.exe' -ArgumentList $cmdArgs -WorkingDirectory $projectDirNorm

function Close-LauncherWindow {
    $parentId = (Get-CimInstance Win32_Process -Filter "ProcessId=$PID").ParentProcessId
    if (-not $parentId) { return }

    $parent = Get-CimInstance Win32_Process -Filter "ProcessId=$parentId"
    if (-not $parent -or $parent.Name -ne 'cmd.exe') { return }

    $parentLine = $parent.CommandLine
    if (-not $parentLine) { return }
    if ($parentLine -like '*restart.bat*' -and $parentLine -notlike '*_run_*') {
        Stop-Process -Id $parentId -Force
    }
}

Close-LauncherWindow
