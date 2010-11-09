=Wompt Readme=

==Installation==

* Install nodejs
** git clone https://github.com/ry/node.git
** cd node
** ./configure
** ./make
** ./make install
** Note that under ubuntu, configure fails with the current version in git. This is because configure and waf-light both have windows line endings instead of unix line endings.
* Install npm
** curl http://npmjs.org/install.sh | sudo sh
* Install node-static
** sudo npm install http://github.com/cloudhead/node-static/tarball/master
