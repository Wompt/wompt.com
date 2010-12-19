require 'sinatra/base'
require 'openid/store/filesystem'
require 'models/user'

Mongomatic.db = Mongo::Connection.new.db("wompt_dev")

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
    user = find_or_create_user(auth)    
    "#{name} told us that you are legit:<br/> #{auth.inspect}<br/>#{user.inspect}" 
  end
  
  def find_or_create_user auth
    info = auth['user_info']
    if user = User.find_one('authentications' => {'provider' => auth['provider'], 'uid' => auth['uid']})
      puts "Found User by auth"
      return user
    elsif email = info['email'] && user = User.find_one('email' => email)
      puts "Found User by email"
      user.add_authentication('provider' => auth['provider'], 'uid' => auth['uid'])
      user.update!
      return user
    else
      puts "Creating User"
      user = User.new('authentications' => [{'provider' => auth['provider'], 'uid' => auth['uid']}])
      user['email'] = info['email'] if info['email']
      user['name'] = info['name'] if info['name']
      user.insert!
      return user
    end
  end
end