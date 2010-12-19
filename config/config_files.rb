namespace :deploy do
  desc "save the local version of the upstart script to the server"
  task :send_upstart_script, :roles => :app do
    process_erb_file_and_upload "config/upstart/#{application}.conf", :destination => "/etc/init/#{application}.conf"
  end
  
  desc "Create a symlinks in /etc/monit to the monit files in the deployed app"
  task "symlink_monit_config" do
    run "#{try_sudo :as => 'root'} ln -f -s #{current_path}/config/monit/* /etc/monit/"
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

after 'deploy:setup', 'deploy:send_upstart_script'
after 'deploy:cold', 'deploy:symlink_monit_config'
