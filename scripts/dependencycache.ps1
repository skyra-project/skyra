Function Step-Main {
    Param (
		[string]$Command = "default",
		[string]$Manager = "yarn"
    )

    Get-Process {
        switch ( $Command ) {
            clear {
                Remove-Item -Recurse -Force dist
				Remove-Item -Recurse -Force node_modules
				switch ($Manager) {
					yarn {
						Remove-Item -Recurse -Force $(yarn cache dir)
					}
					npm {
						npm cache rm
					}
				}
            }
            default { Write-Host "Unrecognized command, please try again" -ForegroundColor Red }
        }
    }
}

Step-Main @args
