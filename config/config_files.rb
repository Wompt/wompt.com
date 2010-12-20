namespace :deploy do
  desc "save the local version of the upstart script to the server"
  task :send_upstart_scripts, :roles => :app do
    Dir.glob('config/upstart/*.conf').each do |file|
      process_erb_file_and_upload file, :destination => "/etc/init/#{File.basename(file)}"
    end
  end
  
  desc "Create a symlinks in /etc/monit to the monit files in the deployed app"
  task "symlink_monit_config" do
    run "#{try_sudo :as => 'root'} ln -f -s #{current_path}/config/monit/* /etc/monit/"
  end

  desc "Process the monit config files and send them to the server"
  task :update_monit_config, :roles => :app do
    process_erb_file_and_upload('config/monit/wompt_auth')
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

after 'deploy', 'deploy:update_monit_config'
after 'deploy:setup', 'deploy:send_upstart_scripts'
after 'deploy:cold', 'deploy:symlink_monit_config'
