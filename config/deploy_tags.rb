namespace :deploy do
	namespace :tags do
		task :schedule_creation do
			after "deploy", "deploy:tags:create"
		end
		
		task :skip do
			set :skip_tag_creation, true
		end
		
		desc "Automatically create a git tag in the form 'deploy_yyyy_mm_dd_hh_mm'"
		task :create do
			if self[:skip_tag_creation]
				logger.info("skipping tag creation") 
			else
				tag_name = Time.now.strftime("deploy_%Y_%m_%d_%H_%M")
				
				system "git tag -a -m 'Deployed to #{deployment} using environment #{application_environment}' #{tag_name} #{real_revision}"
				
				system "git push origin #{tag_name}"
				if $? != 0
					raise "Pushing tag to origin failed"
				end
			end
		end
	end
end
