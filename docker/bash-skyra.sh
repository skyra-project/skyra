#!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

# Display a message, wrapping lines at the terminal width.
message() {
	printf "$1 \n"
}

function removeAllContainers() {
	if [[ "$OSTYPE" == "linux-gnu" ]]; then
		docker ps -a -q | xargs --no-run-if-empty docker rm -fv
	elif [[ "$OSTYPE" == "darwin"* ]]; then
		docker ps -a -q | xargs -n1 docker rm -fv
	else
		fancylog "${RED}Unsupported operating system detected"
	fi
}

help() {
	message "\n${BLUE}Skyra Docker Control script${NC}

	${GREEN}Usage:${NC}\n
		./docker/docker.sh [COMMAND] [ARGS...]
		./docker/docker.sh -h | --help

	${YELLOW}Commands:${NC}\n
		build		Builds a Docker image so it is prepped for running
		start		Starts a Docker container in detached state
		stop		Stops a Docker container
		remove		Removes a single Docker container
		removeall	Removes all Docker containers
		push		Pushes a docker image to Dockerhub
		logs		Shows the logs of a Docker container
		tail		Tails the logs of a Docker container"
}

case $1 in
build) docker-compose -p skyra -f ${CURRENT_DIR}/docker-compose.yml -f ${CURRENT_DIR}/docker-build.yml build ${@:2:99} ;;
start) docker-compose -p skyra -f ${CURRENT_DIR}/docker-compose.yml up -d ${@:2:99} ;;
stop) docker-compose -p skyra -f ${CURRENT_DIR}/docker-compose.yml stop ${@:2:99} ;;
logs) docker-compose -p skyra -f ${CURRENT_DIR}/docker-compose.yml logs ${@:2:99} ;;
tail) docker-compose -p skyra -f ${CURRENT_DIR}/docker-compose.yml logs -f ${@:2:99} ;;
push) docker push ${@:2:99} ;;
remove) docker-compose -p skyra -f ${CURRENT_DIR}/docker-compose.yml rm -fv ${@:2:99} ;;
removeall) removeAllContainers ;;
*) help ;;
esac
