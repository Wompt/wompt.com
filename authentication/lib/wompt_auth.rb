require 'sinatra/base'
require 'openid/store/filesystem'
require 'lib/models/user'
require 'lib/config'

Mongomatic.db = Mongo::Connection.new.db(CONFIG[:database])

ONE_TIME_TOKEN_COOKIE = 'wompt_auth_one_time_token'

class WomptAuth < Sinatra::Base
  use Rack::Session::Pool,
    :path => '/auth',
    :expire_after => 60, # In seconds
    :secret => 'C6xyESB0FdkabrhtBxOlPikZTS0jKnQRq1vMfluX'
  
  use OmniAuth::Builder do
    provider :facebook , '181725458505189' , '5afa28d747aabd3d1a6ce71d26933c14', :scope => 'email'
    provider :open_id, nil, :name => 'google', :identifier => 'https://www.google.com/accounts/o8/id', :scope => 'email'
  end
  
  def self.get_or_post(path, opts={}, &block)
    get(path, opts, &block)
    post(path, opts, &block)
  end

  get_or_post '/auth/:name/callback' do |name|
    auth = request.env['omniauth.auth']
    host = request.env['HTTP_HOST'].split(':')[0]
    user = find_or_create_user(auth)
    response.set_cookie(ONE_TIME_TOKEN_COOKIE, :value => user['one_time_token'], :path => '/')
    haml :redirect, :locals => {:to => "/"}
  end
  
  def find_or_create_user auth
    info = auth['user_info']
    user = User.find_one('authentications' => {'provider' => auth['provider'], 'uid' => auth['uid']})
    
    if !user
      if (email = info['email']) && (user = User.find_one('email' => email))
        user.add_authentication('provider' => auth['provider'], 'uid' => auth['uid'])
      else
        puts "Creating User"
        user = User.new('authentications' => [{'provider' => auth['provider'], 'uid' => auth['uid']}])
        user['email'] = info['email'] if info['email']
        user['name'] = info['name'] if info['name']
      end
    end
    
    user['one_time_token'] = generate_token
    user.save!
    return user
  end
  
  def generate_token
    ActiveSupport::SecureRandom.base64(20)
  end
end
