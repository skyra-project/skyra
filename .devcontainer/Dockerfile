ARG VARIANT=14
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:${VARIANT}

# Install typescript. eslint is installed by javascript image
ARG USERNAME=node
RUN sudo -u ${USERNAME} npm install -g typescript

ENV ZSH_CUSTOM=$HOME/.oh-my-zsh/custom

# Install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
	&& apt-get -y install --no-install-recommends \
	build-essential \
	curl \
	fonts-firacode \
	htop \
	libcairo2-dev \
	libgif-dev \
	libjpeg-dev \
	libpango1.0-dev \
	librsvg2-dev \
	neofetch \
	nano \
	tree \ 
	vim \
	wget \
	zsh

# Install Node 12 as additional version of node using nvm
ARG EXTRA_NODE_VERSION=12
RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
RUN sudo -u node npm install -g \
	all-contributors \
	commitizen \
	eslint \
	git-open \
	http-server \
	jest \
	lint-staged \
	node-gyp \
	pm2 \
	prettier \
	rimraf \
	rollup \
	standard-version \
	ts-node