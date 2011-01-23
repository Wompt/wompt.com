class RefererSaver
  def initialize(app)
    @app=app
  end

  def call(env)
    session = env['rack.session']
    session['back_to'] = env['HTTP_REFERER'] if session && !session['back_to']
    @app.call(env)
  end
end