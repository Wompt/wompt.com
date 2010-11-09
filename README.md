# Wompt Readme #

## Installation ##

### Install node.js ###

Note that under ubuntu, configure fails with the current version in git.
This is because configure and waf-light both have windows line endings instead of unix line endings.
		git clone https://github.com/ry/node.git
		cd node
		./configure
		./make
		./make install
		
### Install npm ###
		curl http://npmjs.org/install.sh | sudo sh

### Install packages ###
		npm install http://github.com/cloudhead/node-static/tarball/master
		npm install socket.io
