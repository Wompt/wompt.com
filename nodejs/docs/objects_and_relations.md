### Middleware
- Auth.one_time_token_middleware()
  - reads one time token cookie
  - looks up user
  - clears cookie and token
  - sets req.user
  - starts new session
- Auth.lookup_user_middleware()
  - if req.user isn't set looks user up by session token from cookie
- Auth.meta_user_middleware(me.meta_users)
  - looks up and sets req.meta_user by user_id, or session token (if anonymous)
  - creates and caches MetaUser if it can't be found

### MetaUser
- `clients`: ClientPool of all connected socket.io clients
- `doc`: Mongoose doc (DB document, will be null with anonymous users)
- `touched`: (last access time)
- `touch()`: updates touched property
- `id()`: returns unique string for this user (currently _id property of mongoDB document) or null if user is anonymous
- `readonly`: does this user have permission to send messages (false for anonymous users)
- `visible`: Should this user show up on the user list of each channel? (false for anonymous users)
- Also broadcasts a message to clients when one is added.
- `new_session()`: broadcasts a message announcing a new login session has been created on another device
- `end_session()`: broadcasts a message announcing that a session has ended (should also pass some session info like token or browser type or IP)

### MetaUserManager
 - maintains a cache of MetaUsers (expiration only happens when not accessed 
 - get and set methods (id can be either user ID, or session token (for anonymous users))

### Client - from socket.IO
- `user`: MetaUser for this client
- `meta_data`:
  - `channel`: reference to Channel object
  - `token`: session token generated on login.

### ClientConnectors
Temporary, expiring (10 seconds) holding place for one time user connector_ids that are used to associate socket.io Client objects with logged-in users

### Channel
 - `name`
 - `clients`: ClientPool of all connected socket.io clients
 - `messages`: MessageList

