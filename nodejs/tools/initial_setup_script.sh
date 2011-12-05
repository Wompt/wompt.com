#!/bin/bash

#users that can ssh in
echo "[redacted]" > /home/ubuntu/.ssh/authorized_keys
echo "[redacted]" >> /home/ubuntu/.ssh/authorized_keys

#updates
sudo aptitude update -y
sudo aptitude safe-upgrade -y
sudo aptitude install build-essential -y
sudo aptitude install git-core -y
sudo aptitude install libssl-dev -y

#nodejs
git clone git://github.com/ry/node.git
git checkout -b current a01e09502e8921d08b9a
cd node
./configure
make
sudo make install
#todo fail if test isnt 100%
make test
cd ~

#npm
curl http://npmjs.org/install.sh | sudo sh

#MongoDB (see: http://www.mongodb.org/display/DOCS/Ubuntu+and+Debian+packages )
sudo apt-add-repository 'deb http://downloads.mongodb.org/distros/ubuntu 10.4 10gen'
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
sudo apt-get update
sudo apt-get install mongodb-stable

#github deploy key
# [redacted]

# For the support of our Sinatra Auth app
# Ruby
sudo apt-get install ruby-full build-essentials

# Rubygems
cd ~
wget http://rubyforge.org/frs/download.php/70696/rubygems-1.3.7.tgz
tar -zxvf rubygems-1.3.7.tgz
cd rubygems-1.3.7
sudo ruby setup.rb

# Capistrano
sudo gem install capistrano

# Bundler
sudo gem install bundler

# Some packages needed by some of the gems in our Auth app
sudo apt-get install libxslt-dev libxml2-dev

#todo add wompt to... upstart?
#todo nginx?
#todo ruby?
#todo ror?
#todo reserve and associate an elastic ip
