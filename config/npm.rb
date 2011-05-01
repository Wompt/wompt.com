namespace :deploy do
	namespace :npm do
		desc "Deploy and install missing npm dependencies on the server"
		task :default, :roles => :app do
			after 'deploy:update', 'deploy:npm:install'
			find_and_execute_task("deploy")
		end

		desc "Install missing npm dependencies on the server"
		task :install, :roles => :app do
			run "npm install #{current_path}/nodejs/deps"
		end
	end
end
