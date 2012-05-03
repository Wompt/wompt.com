require "./config/defaults"
require "./config/#{settings.environment}"

puts "#Starting in #{settings.environment} mode with config:"
puts "##{CONFIG.inspect}"
