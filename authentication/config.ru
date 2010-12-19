require 'rubygems'
require 'bundler'

Bundler.require

Dir.mkdir('tmp')
File.open('tmp/wompt_auth.pid', 'w') { |f| f.write(Process.pid) }

require './wompt_auth'
run WomptAuth