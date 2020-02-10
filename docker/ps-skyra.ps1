function Remove-All-Containers {
	docker container stop $(docker ps -aq)
	docker container rm $(docker ps -aq)
}

function Show-Help {
	Write-Host ""
	Write-Host "Skyra Docker Control Script" -ForegroundColor blue
	Write-Host "Control Skyra's Docker image with ease" -ForegroundColor cyan
	Write-Host ""
	Write-Host "Lavalink Setup" -ForegroundColor green
	Write-Host "
1. Download the latest .jar file from https://ci.fredboat.com/viewLog.html?buildId=lastSuccessful&buildTypeId=Lavalink_Build&tab=artifacts&guest=1
2. Drop this .jar file in the 'lavalink' folder
3. Duplicate the 'application.example.yml' file and rename it to 'application.yml
4. Set any password in the yaml file and also set the same password in src/config.ts in the root folder of this project"
	Write-Host ""
	Write-Host "Influxdb Setup" -ForegroundColor green
	Write-Host "
1. In the influxdb folder, duplicate the 'config.sample.toml' file and rename it to 'config.toml'"
	Write-Host ""
	Write-Host "Postgres Setup" -ForegroundColor green
	Write-Host "
1. In the postgres folder, duplicate the '.env.example' file and rename it to '.env'
2. Fill out any desired values or keep the defaults"
	Write-Host ""
	Write-Host "Usage" -ForegroundColor yellow
	Write-Host "
./docker/docker.sh [COMMAND] [ARGS...]
./docker/docker.sh -h | --help"
	Write-Host ""
	Write-Host "Commands" -ForegroundColor yellow
	Write-Host "
build		Builds a Docker image so it is prepped for running
start		Starts a Docker container in detached state
stop		Stops a Docker container
remove		Removes a single Docker container
removeall	Removes all Docker containers - For this command no service is required and it can be skipped by just hitting enter when prompted
push		Pushes a docker image to Dockerhub
logs		Shows the logs of a Docker container
tail		Tails the logs of a Docker container"

	Write-Host ""
	Write-Host "Report bugs and issues to:" -ForegroundColor yellow
	Write-Host "Skyra's GitHub, assigning favna and kyranet. https://github.com/skyra-project/skyra/issues/new
	"
}

function Step-Run {
	Param (
		[String]$command = $( Read-Host "What command do you want to run? If unsure type help" ),
		[string]$Service
	)

	Begin {
		if ($command -Ne "help" -And $command -Ne "h" -And $command -Ne "removeall" -And $service -Eq "") {
			$service = $( Read-Host "What Docker service do you want to control?" )
		}
	}

	Process {
		switch ( $command ) {
			build { docker-compose -p skyra -f "$($PSScriptRoot)\docker-compose.yml" -f "$($PSScriptRoot)\docker-build.yml" build $service }
			start { docker-compose -p skyra -f "$($PSScriptRoot)\docker-compose.yml" up -d $service }
			logs { docker-compose -p skyra -f "$($PSScriptRoot)\docker-compose.yml" logs $service }
			tail { docker-compose -p skyra -f "$($PSScriptRoot)\docker-compose.yml" logs -f $service }
			push { docker-compose -p skyra -f "$($PSScriptRoot)\docker-compose.yml" push $service }
			remove { docker-compose -p skyra -f "$($PSScriptRoot)\docker-compose.yml" rm -fv $service }
			removeall { Remove-All-Containers }
			default { Show-Help }
		}
	}
}

Step-Run
