class User < Mongomatic::Base
  def self.collection_name
    'users'
  end
  
  def add_authentication(hash)
    auths = (self['authentications'] ||= [])
    auths << hash
  end
  
  def add_authentication_from_authinfo(auth)
    self.add_authentication(
      'provider' => auth['provider'],
      'uid' => auth['uid'],
      'info' => auth)
  end
  
  def save!
    self.is_new? ? insert! : update!
  end
  
  def get_authentication(provider, uid)
    (self['authentications'] || []).find do |auth|
      auth && (auth['provider'] == provider) && (!uid || auth['uid'] == uid)
    end
  end
end