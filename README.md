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
		npm install express
		npm install mongoose
		
### Deploying ###

#### Start / Stop ####
We have an upstart script called "wompt"
so, all of these actions can done easily
		sudo start wompt
		sudo stop wompt

#### Pushing changes ####
You'll either need to SSH into the EC2 instance, or you'll need Capistrano (a ruby gem) locally for deploying.
Locally:
		cap production deploy
		# see a list of commands
		cap -T

On Box:
		cd /ubuntu/www/wompt/current
		cap production deploy
