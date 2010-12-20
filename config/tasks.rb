namespace :deploy do
  set :apps, [application, 'wompt_auth']
  
  desc "Start the server"
  task :start, :roles => :app, :except => { :no_release => true } do
    apps.each do |app_name|
      run "#{try_sudo :as => 'root'} start #{app_name}"
    end
  end

  task :stop, :roles => :app, :except => { :no_release => true } do
    apps.each do |app_name|
      run "#{try_sudo :as => 'root'} stop #{app_name}"
    end
  end

  task :restart, :roles => :app, :except => { :no_release => true } do
    apps.each do |app_name|
      run "#{try_sudo :as => 'root'} restart #{app_name} || #{try_sudo :as => 'root'} start #{app_name}"
    end
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
