# Wompt.com Readme #

## Installation ##
### Node 0.6 ###
      git clone https://github.com/ry/node.git
      cd node
      git checkout v0.6.5
      ./configure
      make
      make install

### MongoDB ###
      wget http://fastdl.mongodb.org/linux/mongodb-linux-i686-2.0.4.tgz
      tar -xzf mongodb-linux-i686-2.0.4.tgz
      mv mongodb-linux-i686-2.0.4.tgz /someplace/in/your/path

### Wompt ###
      git clone git@github.com:Wompt/wompt.com.git
      cd wompt.com
      git submodule update --init

### Wompt authentication server ###
      cd wompt.com/authentication
      gem install bundler
      bundle

### Start in dev mode ###
#### MongoDB ####
      mongod
#### Wompt authentication server ####
      cd authentication
      bundle exec rackup
#### Wompt ####
      node nodejs/server.js

### Local Development ###
#### Offline mode ####
    node nodejs/server.js -offline
		
Running Wompt with the `-offline` flag tells wompt to rely on no external
dependencies.
 * Facebook JS isn't loaded
 * Facebook Like and Send buttons aren't included
 * Uses a local copy of jQuery (needs jQuery in `nodejs/public/external/')
 instead of google's CDN

		
### Deploying ###

#### Start / Stop ####
We have run scripts in the capistrano shared directory called `wompt` and `wompt_auth`
These can both be run like this `wompt start` and `wompt_auth start`
We have monit setup to monitor both processes, so the easiest way is:
    # while logged into the server ...
		sudo monit restart wompt
		sudo monit stop wompt
		sudo monit start wompt
		
You can also manually start wompt and wompt_auth using the scripts below:
		~/www/wompt/shared/wompt start|stop
		~/www/wompt/shared/wompt_auth start|stop
		
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

### Deployment Environment Configuration ###
#### Deployment Environment ####
This specifies the directory to deploy to, the name of the git branch, and which
application environment to use.  These settings are stored in `/config/deploy.rb`.

#### Application Environment ####
This specifies all the various settings for the application: db name, constants,
file locations, port numbers, ...  All of these are loaded from the files in
`/nodejs/environment` and `/authentication/config`.  Settings from the default
environment are deep-merged with the application environment specified in the
Deployment Environment config. 