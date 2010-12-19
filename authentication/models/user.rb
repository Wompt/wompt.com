class User < Mongomatic::Base
  def self.collection_name
    'users'
  end
  
  def add_authentication(hash)
    auths = (self['authentications'] ||= [])
    auths << hash
  end
end