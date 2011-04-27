namespace :deploy do
  desc "save the local version of the run scripts to the server"
  task :send_run_scripts, :roles => :app do
    Dir.glob('config/run_scripts/*').each do |file|
      dest = "#{shared_path}/#{File.basename(file)}"
      process_erb_file_and_upload file, :destination => dest
      run "chmod a+x #{dest}"
    end
  end
  
  desc "Create symlinks in /etc/monit to the monit files in the deployed app"
  task "symlink_monit_config" do
    if deployment == 'production'
      run "#{try_sudo :as => 'root'} ln -f -s #{current_path}/config/monit/* /etc/monit/"
    else
      logger.info "Skipping monit config because this is not the live production app"
    end
  end

  desc "Process the monit config files and send them to the server"
  task :update_monit_config, :roles => :app do
    if deployment == 'production'
      process_erb_file_and_upload('config/monit/wompt')
      process_erb_file_and_upload('config/monit/wompt_auth')
      process_erb_file_and_upload('config/monit/mongodb')
    else
      logger.info "Skipping monit config because this is not the live production app"      
    end
  end
  
  def process_erb_file_and_upload filepath, opt={}
    remote_tempfile = "/tmp/#{File.basename(filepath)}"
    file = File.read(filepath)
    processed = ERB.new(file).result(binding)
    put processed, remote_tempfile
    dest = opt[:destination] || (current_path + "/" + filepath)
    run "#{try_sudo :as => 'root'} mv #{remote_tempfile} #{dest}" 
  end
end

after 'deploy:update', 'deploy:update_monit_config'
after 'deploy:update', 'deploy:send_run_scripts'
after 'deploy:cold', 'deploy:symlink_monit_config'
