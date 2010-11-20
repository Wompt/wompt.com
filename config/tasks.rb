namespace :deploy do
  desc "Start the server"
  task :start, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo :as => 'root'} start #{application}"
  end

  task :stop, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo :as => 'root'} stop #{application}"
  end

  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo :as => 'root'} restart #{application} || #{try_sudo :as => 'root'} start #{application}"
  end

  desc "save the local version of the upstart script to the server"
  task :send_upstart_script, :roles => :app do
    remote_tempfile = "/tmp/#{application}_upstart.conf"
    upstart_file = <<UPSTART
description "#{application}"

start on startup
stop on shutdown

script
    # Node needs HOME to be set
    export HOME="#{current_path}"
    
    exec sudo -u nodejs /usr/local/bin/node #{current_path}/server.js production 2>>/var/log/wompt.error.log >>/var/log/wompt.log
end script
UPSTART
    put upstart_file, remote_tempfile
    run "#{try_sudo :as => 'root'} mv #{remote_tempfile} /etc/init/#{application}.conf"
  end
  
  desc "Update git submodules for the cached copy (Cpaistrano 2.5.20 will do this automatically)"
  task "update_submodules_recursive" do
    run "cd #{shared_path}/cached-copy && git submodule update --init --recursive"
  end
  
  ## Disable some default tasks that don't apply to a NodeJS app
  task :migrate do
    puts "    not doing migrate because not a Rails application."
  end
  task :finalize_update do
    puts "    not doing finalize_update because not a Rails application."
  end
end

after 'deploy:setup', 'deploy:send_upstart_script'
