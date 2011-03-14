namespace :deploy do
	namespace :symlinks do
		after "deploy:update_code", "deploy:symlinks:create"
		
		desc "Create the necessary symlinks for our application"
		task :create do
			run "ln -nfs #{shared_path} #{release_path}/shared"
		end
	end
end
