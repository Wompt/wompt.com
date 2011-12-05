namespace :deploy do
	namespace :npm do
		after "deploy:update_code", "deploy:npm:create_symlinks"

		desc "Deploy and install missing npm dependencies on the server"
		task :default, :roles => :app do
			after 'deploy:update', 'deploy:npm:install'
			find_and_execute_task("deploy")
		end

		desc "Install missing npm dependencies on the server"
		task :install, :roles => :app do
			run "mkdir -p #{shared_path}/node_modules"
			run "cd #{current_path}/nodejs && npm install "
		end
		
		desc "Create the necessary symlinks for npm"
		task :create_symlinks do
			run "ln -nfs #{shared_path}/node_modules #{release_path}/nodejs/node_modules"
		end
	end
end
