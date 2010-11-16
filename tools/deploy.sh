#!/bin/sh

git pull
git checkout master
git submodule update --recursive --init

sudo ln -s -f /home/ubuntu/wompt/scripts/node_upstart.conf /etc/init/wompt_nodejs.conf

sudo stop wompt_nodejs
sudo start wompt_nodejs
