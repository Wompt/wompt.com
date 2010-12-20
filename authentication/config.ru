require 'rubygems'
require 'bundler'
require 'ftools'

Bundler.require

File.makedirs('tmp')
File.open('tmp/wompt_auth.pid', 'w') { |f| f.write(Process.pid) }

require 'lib/wompt_auth'
run WomptAuth
