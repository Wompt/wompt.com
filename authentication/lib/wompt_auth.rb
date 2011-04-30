require 'sinatra/base'
require 'openid/store/filesystem'
require 'lib/models/user'
require 'lib/config'
require 'lib/referer_saver'
require 'hoptoad_notifier'

HoptoadNotifier.configure do |config|
  config.api_key = CONFIG[:hoptoad][:api_key]
end

Mongomatic.db = Mongo::Connection.new.db(CONFIG[:database])

ONE_TIME_TOKEN_COOKIE = CONFIG[:cookies][:one_time]
TOKEN_COOKIE = CONFIG[:cookies][:token]

class WomptAuth < Sinatra::Base
  use Rack::Session::Pool,
    :path => '/auth',
    :expire_after => 60, # In seconds
    :secret => 'C6xyESB0FdkabrhtBxOlPikZTS0jKnQRq1vMfluX'

  use HoptoadNotifier::Rack if CONFIG[:hoptoad] && CONFIG[:hoptoad][:report_errors]
  use RefererSaver
  
  use OmniAuth::Builder do
    if settings.environment == :production
      provider :github , '39af35ac1c5189438931' , 'eff1d530e71b571ca58f787a95c62900fa5623c6', :scope => nil
    else
      provider :github , '60ae284d5c81eceaebe1' , '2bac1bc17e414ad15eee27403c6cd900623ae9b4', :scope => nil
    end
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
    back_to = session && session.delete('back_to') || '/'
    haml :redirect, :locals => {:to => back_to}
  end
  
	get_or_post '/auth/failure' do
		haml :error, :locals => {:message => params[:message]}
	end
  
  def find_or_create_user auth
    info = auth['user_info']
    user = User.find_one('authentications' => {'provider' => auth['provider'], 'uid' => auth['uid']})
    
    if !user
      if (email = info['email']) && (email.length > 3) && (user = User.find_one('email' => email))
        user.add_authentication('provider' => auth['provider'], 'uid' => auth['uid'], 'info' => auth)
      else
        puts "Creating User"
        user = User.new('authentications' => [{'provider' => auth['provider'], 'uid' => auth['uid'], 'info' => auth}])
        user['email'] = info['email'] if info['email']
        if(name = (info['name'] || info['nickname']))
          user['name'] = name
        end
      end
    end
    
    user['one_time_token'] = generate_token
    if(auth_doc = user.get_authentication(auth['provider'], auth['uid']))
      auth_doc['info'] = auth
    end
    user.save!
    return user
  end
  
  get "/ok" do
    'OK'
  end
  
  def generate_token
    ActiveSupport::SecureRandom.base64(20)
  end
end
