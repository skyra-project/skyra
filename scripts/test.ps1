using namespace System.Management.Automation

$SERVICES_PATH = "$($PSScriptRoot)\..\services"
$env:POSTGRES_DB = "skyra-dotnet-test"

function Step-Main {
	Param (
		[string] $Command = "all"
	)

	Process {
		switch ( $Command ) {
			all {
				RunTests "${SERVICES_PATH}"
			}
			integration {
				RunTests "${SERVICES_PATH}\Skyra.IntegrationTests"
			}
			unit {
				Invoke-Expression -Command "dotnet test ${SERVICES_PATH}\Skyra.UnitTests"
			}
			default { Write-Host "Unknown Command." -ForegroundColor Red }
		}
	}
}

function RunTests {

	Param(
		[string] $path
	)

	RunDependencies

	$job = & dotnet run -p $SERVICES_PATH\Skyra.Grpc -c Release &

	do {
		Write-Host "waiting..."
		Start-Sleep 3
	} until(($job | Receive-Job).JobStateInfo.State -ne [JobStateInfo]::Running && Test-NetConnection localhost -Port 8291 | Where-Object { $_.TcpTestSucceeded })

	if(($job | Receive-Job).JobStateInfo.State -ne [JobStateInfo]::Running) {
		Write-Host Grpc service quit unexpectedly. -ForegroundColor Red
		Write-Host $job.ChildJobs[0].Output -ForegroundColor Red

		$job | Stop-Job
		$job | Remove-Job

		exit
	}

	Invoke-Expression -Command "dotnet test $path"

	$job | Stop-Job
	$job | Remove-Job
}

function RunDependencies {
	Invoke-Expression -Command "docker rm -f postgres" | Out-Null
	Invoke-Expression -Command "docker container run --name postgres -d --expose 5432 -p 5432:5432 -it skyrabot/postgres:latest"
	Invoke-Expression -Command "dotnet new tool-manifest --force"
	Invoke-Expression -Command "dotnet tool install dotnet-ef"
	Invoke-Expression -Command "dotnet tool run dotnet-ef database update -p ${SERVICES_PATH}\Skyra.Database"
}

Step-Main @args
