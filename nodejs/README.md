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
		npm install express
		npm install jade
		
### Deploying ###

#### Start / Stop ####
We have an upstart script called "wompt"
so, all of these actions can done easily on the server
    # while logged into the server ...
		sudo start wompt
		sudo stop wompt
		
But starting and stoping can be done from your dev machine with
the following commands.  These can be executed from anywhere inside the app
root directory i.e. it works in /wompt/app just as well as in /wompt
		cap production deploy:restart

#### Pushing changes ####
You'll either need to SSH into the EC2 instance, or you'll need Capistrano (a ruby gem) locally for deploying.
Locally: (within any subdirectory of the application)
		cap production deploy
		# see a list of all commands
		cap -T

On Box:
		cd /ubuntu/www/wompt/current
		cap production deploy  #cap does sudo for you, no need for it here
