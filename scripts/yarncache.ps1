Function Step-Main {
    Param (
        [string]$Command = "default"
    )

    Process {
        switch ( $Command ) {
            clear {
                Remove-Item -r -Force dist
				Remove-Item -r -Force node_modules
				Remove-Item -r -Force $(yarn cache dir)
            }
            default { Write-Host "Unrecognized command, please try again" -ForegroundColor Red }
        }
    }
}

Step-Main @args
