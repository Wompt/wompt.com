load 'deploy' if respond_to?(:namespace) # cap2 differentiator

set :application, "wompt"
set :user, "ubuntu"
set :host, "wompt.com"

set :scm, :git
set :repository, "git@github.com:abtinf/wompt.git"
set :git_enable_submodules, true
set :deploy_via, :remote_cache


role :app, host

set :use_sudo, true
set :admin_runner, 'ubuntu'
set :normalize_asset_timestamps, false
default_run_options[:pty] = true

task :production do
  set :deploy_to, "/home/ubuntu/www/#{application}"
  set :branch, "master"  
end

load 'config/tasks'
load 'config/config_files'
load 'config/deploy_tags'
