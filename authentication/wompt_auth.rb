require 'sinatra/base'
require 'openid/store/filesystem'

class OmniAuth::Strategies::OAuth2
  def full_host
    uri = URI.parse(request.url.gsub('|','%7C'))
    uri.path = ''
    uri.query = nil
    uri.to_s
  end
end

class WomptAuth < Sinatra::Base
  use OmniAuth::Builder do
    #provider :facebook , '181725458505189' , '5afa28d747aabd3d1a6ce71d26933c14', :scope => 'email'
    provider :open_id, nil, :name => 'google', :identifier => 'https://www.google.com/accounts/o8/id', :scope => 'email'
  end

  enable :sessions
  
  post '/auth/:name/callback' do |name|
    auth = request.env['omniauth.auth']
    
    "#{name} told us that you are legit:<br/> #{auth.inspect}" 
  end  
end