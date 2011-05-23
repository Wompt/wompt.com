namespace :deploy do
	namespace :gems do
		desc "Deploy and install missing ruby gem dependencies on the server"
		task :default, :roles => :app do
			after 'deploy:update', 'deploy:gems:install'
			find_and_execute_task("deploy")
		end

		desc "Install missing ruby gem dependencies on the server"
		task :install, :roles => :app do
			run "cd #{current_path}/authentication && bundle install"
		end
	end
end
