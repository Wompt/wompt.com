namespace :deploy do
	after "deploy", "deploy:create_tag"
	
	desc "Automatically create a git tag in the form 'deploy_yyyy_mm_dd_hh_mm'"
	task :create_tag do
		logger.info("skipping tag creation") && break if skip_tag
		
		tag_name = Time.now.strftime("deploy_%Y_%m_%d_%H_%M")
		
		system "git tag -a -m 'tagging current code for deployment to staging' #{tag_name}"
		
		system "git push origin #{tag_name}"
		if $? != 0
			raise "Pushing tag to origin failed"
		end
	end
end
