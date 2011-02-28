# Wompt Readme #

## Installation ##

### Install node.js ###
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
		npm install hoptoad-notifier
		
### Deploying ###

#### Start / Stop ####
We have run scripts in the capistrano shared directory called `wompt` and `wompt_auth`
These can both be run like this `wompt start` and `wompt_auth start`
We have monit setup to monitor both processes, so the easiest way is:
    # while logged into the server ...
		sudo monit restart wompt
		sudo monit stop wompt
		sudo monit start wompt
		
But starting and stoping can be done from your dev machine with
the following commands.  These can be executed from anywhere inside the app
root directory i.e. it works in /wompt/app just as well as in /wompt
		cap production deploy:restart

#### Pushing changes ####
You'll either need to SSH into the EC2 instance, or you'll need Capistrano (a ruby gem) locally for deploying.
The deploy command also creates a git tag `deploy_yyyy_mm_dd...` and pushes it to origin  (this can be skipped by adding the deploy:tags:skip option)
Locally: (within any subdirectory of the application)
		cap production [deploy:tags:skip] deploy
		# see a list of all commands
		cap -T

On Box:
		cd /ubuntu/www/wompt/current
		cap production deploy  #cap does sudo for you, no need for it here
