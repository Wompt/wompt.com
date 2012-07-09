require 'sinatra/base'
require 'openid/store/filesystem'
require './lib/models/user'
require './lib/config'
require './lib/referer_saver'
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
    provider :twitter , 'P5TqY6I9EmvxNLQVjNZJGw' , 'msMp5fnQ5QvbfzRcAdVOvDyAYiROnm9C9g8grR0doQQ'
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
    return haml :error, :locals => {:message => user} if user.is_a? String
    
    response.set_cookie(ONE_TIME_TOKEN_COOKIE, :value => user['one_time_token'], :path => '/')
    back_to = session && session.delete('back_to') || '/'
    haml :redirect, :locals => {:to => back_to}
  end
  
	get_or_post '/auth/failure' do
		haml :error, :locals => {:message => params[:message]}
	end
  
  def find_or_create_user auth
    info = auth['user_info']
    create_session = true
    user = User.find_one('authentications.provider' => auth['provider'], 'authentications.uid' => auth['uid'])
    if(token_user = get_user_from_token)
      puts "Found a signed in user: #{token_user}"
      if(token_user && user)
        return "The #{auth['provider']} account is already associated with another Wompt account, please sign out and try again"
      end
      user = token_user
      user.add_authentication_from_authinfo(auth)
      # User is already logged in, no need for new sessions
      create_session = false
    end
    
    if !user
      if (email = info['email']) && (email.length > 3) && (user = User.find_one('email' => email))
        user.add_authentication_from_authinfo(auth)
      else
        user = User.new('authentications' => [{'provider' => auth['provider'], 'uid' => auth['uid'], 'info' => convert_unserializable_objects(auth)}])
        user['email'] = info['email'] if info['email']
        if(name = (info['name'] || info['nickname']))
          user['name'] = name
        end
      end
    end
    
    user['one_time_token'] = generate_token if create_session
    
    if(auth_doc = user.get_authentication(auth['provider'], auth['uid']))
      auth_doc['info'] = convert_unserializable_objects(auth)
    end
    user.save!
    return user
  end
  
  def get_user_from_token()
    user = (token = request.cookies[TOKEN_COOKIE]) &&
    !token.blank? &&
    User.find_one('sessions.token' => token)
    if(token && !user) # a token that doesn't belong to a user should be deleted
      response.delete_cookie TOKEN_COOKIE
    end
    user
  end
  
  def convert_unserializable_objects obj
    return obj if obj.nil?
    
    if(obj.is_a? Array)
      obj.map do |item|
        convert_unserializable_objects(item)
      end
    elsif obj.is_a? Hash
      obj.inject({}) do |memo, pair|
        memo[pair[0]] = convert_unserializable_objects(pair[1])
        memo
      end
    elsif obj.is_a? Numeric
      obj
    else
      obj.to_s
    end
  end
  
  get "/ok" do
    'OK'
  end
  
  def generate_token
    ActiveSupport::SecureRandom.base64(20)
  end
end
