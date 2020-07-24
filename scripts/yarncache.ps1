Function Step-Main {
    Param (
        [string]$Command = "default"
    )

    Process {
        switch ( $Command ) {
            clear {
                Remove-Item -Recurse -Force dist
				Remove-Item -Recurse -Force node_modules
				Remove-Item -Recurse -Force $(yarn cache dir)
            }
            default { Write-Host "Unrecognized command, please try again" -ForegroundColor Red }
        }
    }
}

Step-Main @args
