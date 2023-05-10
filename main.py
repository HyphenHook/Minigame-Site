from flask import Flask, render_template, url_for, request, redirect, session, flash, jsonify
from flask_bcrypt import Bcrypt
import uuid
from datetime import timedelta
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import exc, func, CheckConstraint
import random, math
from flask_ngrok import run_with_ngrok

app = Flask(__name__)
bcrypt = Bcrypt(app)
app.config['SECRET_KEY'] = 'bubbythebear'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes = 30)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.debug = True
db = SQLAlchemy(app)
run_with_ngrok(app)

# user database
class User(db.Model):
  __tablename__ = 'Users'
  id = db.Column(db.Integer, primary_key = True, autoincrement = True)
  username = db.Column(db.String(20), unique=True)
  password = db.Column(db.String(100), nullable = False)
  coins = db.Column(db.Integer, CheckConstraint('coins >= 0', name='check_coins_positive'), nullable = False)

  def __repr__(self):
    return str(self.id) + ": " + self.username + " has " + str(self.coins)

# stats is the user's stats
class Stats(db.Model):
  __tablename__ = "Stats"
  id = db.Column(db.Integer, primary_key=True, autoincrement = True)
  hang_win = db.Column(db.Integer, CheckConstraint('hang_win >= 0', name='check_hang_win_positive'), default = 0, nullable=False)
  tic_win = db.Column(db.Integer, CheckConstraint('tic_win >= 0', name='check_tic_win_positive'), default = 0, nullable=False)
  highest_mem = db.Column(db.Integer, CheckConstraint('highest_mem >= 0', name='check_highest_mem_positive'), default = 0, nullable=False)
  mem_played = db.Column(db.Integer, CheckConstraint('mem_played >= 0', name='check_mem_played_positive'), default = 0, nullable=False)
  hang_streak = db.Column(db.Integer, CheckConstraint('hang_streak >= 0', name='check_hang_streak_positive'), default = 0, nullable=False)
  tic_streak = db.Column(db.Integer, CheckConstraint('tic_streak >= 0', name='check_tic_streak_positive'), default = 0, nullable=False)
  highest_hang_streak = db.Column(db.Integer, CheckConstraint('highest_hang_streak >= 0', name='check_highest_hang_streak_positive'), default = 0, nullable=False)
  highest_tic_streak = db.Column(db.Integer, CheckConstraint('highest_tic_streak >= 0', name='check_highest_tic_streak_positive'), default = 0, nullable=False)
  games_played = db.Column(db.Integer, CheckConstraint('games_played >= 0', name='check_games_played_positive'), default = 0, nullable=False)
  games_won = db.Column(db.Integer, CheckConstraint('games_won >= 0', name='check_games_won_positive'), default = 0, nullable=False)
  user_id = db.Column(db.Integer, db.ForeignKey('Users.id'), unique=True)
  user = db.relationship('User', backref=db.backref('stats', lazy=True))

# words is the words used in hangman
class Words(db.Model):
  __tablename__ = "Wordlist"
  word = db.Column(db.String(50), nullable=False)
  category = db.Column(db.String(20), nullable=False)
  difficulty = db.Column(db.String(20), nullable=False)
  id = db.Column(db.Integer, primary_key = True, autoincrement = True)

with app.app_context():
  db.create_all()

# addWord creates a new instance of the Words class
def addWord(word, category, difficulty):
  newWord = Words(word = word, category = category, difficulty = difficulty)
  db.session.add(newWord)

# addWordList reads from the file and uses addWord to add each word in the file to the database
def addWordList():
  with open('./static/ext/hangmanwords.txt', 'r') as f:
    for line in f:
      # each word is separated by spaces
      text = line.strip().split()
      word = text[0]
      category = text[1]
      difficulty = text[2]
      addWord(word, category, difficulty)
  db.session.commit()

# add user to database
def addUser(username, password):
  newUser = User(username = username, password = password, coins=5)
  newStats = Stats(user = newUser)
  db.session.add(newUser)
  db.session.add(newStats)
  db.session.commit()

# validateUsername checks if the username is less than 3 characters
def validateUsername(username):
  # if it is less than 3, an error message is set
  if(len(username) < 3): errmsg = "Username must be atleast 3 characters!"
  else: return (True, "")
  return (False, errmsg)
# validatePassword checks if the password is less than 8 characters
def validatePassword(password):
  # if it is less than 8, an error message is set
  if(len(password) < 8): errmsg = "Password must be atleast 8 characters!"
  else: return (True, "")
  return (False, errmsg)

# validateCredentials checks if both the username and password are valid
def validateCredentials(username, password):
  (result, errmsg) = validateUsername(username)
  if(not result): return (result, errmsg)
  (result, errmsg) = validatePassword(password)
  return (result, errmsg)

# getUser returns the first user that matches the id
def getUser(id):
  user = User.query.filter_by(id=id).first()
  return user

# loggedUser checks if the user is logged in
def loggedUser():
  # if user is logged in, it returns the user
  if "user" in session: return getUser(session["user"])
  return None

# home route
@app.route('/')
def home():
  return render_template("index.html", curr_user = loggedUser())

# hangman route
@app.route('/game/hangman', methods=['POST', 'GET'])
def game1():
  # checks if there is a logged in user, if not, they are redirected to the login page
  if(request.method == "POST"):
    if(not loggedUser()): return redirect(url_for('login'))
    # extracts the user's chosen difficulty and calculates the coins required
    difficulty = request.form['difficulty']
    pay = 0
    if(difficulty == "easy"): pay = 2
    elif(difficulty == "medium"): pay = 4
    else: pay = 6
    user = loggedUser()
    # if user does not have enough coins, an error message is flashed
    if(user.coins < 1):
      flash("Transaction Failed! You don't have the necessary coins to perform this action!")
      return render_template("hangman.html", curr_user = loggedUser(), errExist = True)
    user.coins -= 1
    user.stats[0].games_played += 1
    db.session.commit()
    session['pay'] = pay
    session['difficulty'] = difficulty
    session['category'] = request.form['category']
    session['session_id'] = str(uuid.uuid4())
    return redirect(url_for('game1_session', session_id=session['session_id']))
  return render_template("hangman.html", curr_user = loggedUser())

# hangman session room route if session id doesn't exit send them to 404
@app.route('/game/hangman/session/<session_id>')
def game1_session(session_id):
  if session.get('session_id') != session_id: return render_template('pagenotexist.html', curr_user = loggedUser())
  session['hangans'] = generateWord()
  return render_template("hangman_game.html", curr_user = loggedUser(), earning = session['pay'])

# generateWord gets a list of words from the database and chooses a random word from the list
def generateWord():
  if(not Words.query.first()): addWordList() #if db is empty fill it
  wordlist = Words.query.filter(Words.difficulty == session['difficulty']).filter(Words.category == session['category']).all()
  return random.choice(wordlist).word

# a route for when hangman game finish as win
@app.route('/game/hangman/win')
# game1_win checks if the user is logged in and the session_id is present if not send them to 404, and updates the coins and leaderboard respectfully
def game1_win():
  if(not loggedUser() or 'session_id' not in session): return render_template('pagenotexist.html', curr_user = loggedUser())
  user = loggedUser()
  user.coins += session['pay']
  user.stats[0].hang_win += 1
  user.stats[0].hang_streak += 1
  if(user.stats[0].hang_streak > user.stats[0].highest_hang_streak): user.stats[0].highest_hang_streak = user.stats[0].hang_streak
  user.stats[0].games_won += 1
  db.session.commit()
  if('difficulty' in session): session.pop('difficulty', None)
  if('category' in session): session.pop('category', None)
  if('session_id' in session): session.pop('session_id', None)
  if('pay' in session): session.pop('pay', None)
  return redirect(url_for('game1'))

# a route for when hangman game finish as lost
@app.route('/game/hangman/lose')
# game1_lose checks if the user is logged in and the session_id is present if not send them to 404, sets the user's current hangman streak to 0
def game1_lose():
  if(not loggedUser() or 'session_id' not in session): return render_template('pagenotexist.html', curr_user = loggedUser())
  if('difficulty' in session): session.pop('difficulty', None)
  if('category' in session): session.pop('category', None)
  if('session_id' in session): session.pop('session_id', None)
  if('pay' in session): session.pop('pay', None)
  user = loggedUser()
  user.stats[0].hang_streak = 0
  db.session.commit()
  return redirect(url_for('game1'))

# AJAX route for getting the hangman answer
@app.route('/game/hangman/answer')
def hangAnswer():
  if request.headers.get('X-Requested-With') == 'XMLHttpRequest': return jsonify({'answer': session['hangans']})
  return render_template("pagenotexist.html", curr_user = loggedUser())

# a route for tic tac toe
@app.route('/game/tictactoe', methods=['POST', 'GET'])
def game2():
  # checks if there is a logged in user, if not, they are redirected to the login page
  if(request.method == "POST"):
    if(not loggedUser()): return redirect(url_for('login'))
    # extracts the user's chosen difficulty and calculates the coins required
    difficulty = request.form['difficulty']
    pay = 0
    if(difficulty == "easy"): pay = 2
    elif(difficulty == "medium"): pay = 4
    else: pay = 6
    user = loggedUser()
    # if user does not have enough coins, an error message is flashed
    if(user.coins < 1):
      flash("Transaction Failed! You don't have the necessary coins to perform this action!")
      return render_template("tictactoe.html", curr_user = loggedUser(), errExist = True)
    user.coins -= 1
    user.stats[0].games_played += 1
    db.session.commit()
    session['pay'] = pay
    session['session2_id'] = str(uuid.uuid4())
    session['difficulty'] = difficulty
    return redirect(url_for('game2_session', session_id=session['session2_id']))
  return render_template("tictactoe.html", curr_user = loggedUser())

# a route for the tic tac toe session room
@app.route('/game/tictactoe/session/<session_id>')
def game2_session(session_id):
  if session.get('session2_id') != session_id: return render_template('pagenotexist.html', curr_user = loggedUser())
  user = loggedUser()
  return render_template("tictactoe_game.html", curr_user = loggedUser(), difficulty = session['difficulty'], winstreak = user.stats[0].tic_streak, pay = session['pay'])

# route for when game ends as win
@app.route('/game/tictactoe/win')
# game2_win checks if the user is logged in and the session_id is present if not send them to 404, and updates the coins and leaderboard respectfully
def game2_win():
  if(not loggedUser() or 'session2_id' not in session): return render_template('pagenotexist.html', curr_user = loggedUser())
  user = loggedUser()
  user.coins += session['pay']
  user.stats[0].tic_win += 1
  user.stats[0].tic_streak += 1
  if(user.stats[0].tic_streak > user.stats[0].highest_tic_streak): user.stats[0].highest_tic_streak = user.stats[0].tic_streak
  user.stats[0].games_won += 1
  db.session.commit()
  if('session2_id' in session): session.pop('session2_id', None)
  if('pay' in session): session.pop('pay', None)
  if('difficulty' in session): session.pop('difficulty', None)
  return redirect(url_for('game2'))

# route for when game ends as tie
@app.route('/game/tictactoe/tie')
# game2_tie checks if the user is logged in and the session_id is present if not send them to 404, sets the user's coins to half the amount, they would've gotten if they won
def game2_tie():
  if(not loggedUser() or 'session2_id' not in session): return render_template('pagenotexist.html', curr_user = loggedUser())
  user = loggedUser()
  user.coins += math.floor(session['pay'] / 2)
  db.session.commit()
  if('session2_id' in session): session.pop('session2_id', None)
  if('pay' in session): session.pop('pay', None)
  if('difficulty' in session): session.pop('difficulty', None)
  return redirect(url_for('game2'))

# route for when game ends as lost
@app.route('/game/tictactoe/lose')
# game2_lose checks if the user is logged in and the session_id is present if not send them to 404, sets the user's current tictactoe streak to 0
def game2_lose():
  if(not loggedUser() or 'session2_id' not in session): return render_template('pagenotexist.html', curr_user = loggedUser())
  if('session2_id' in session): session.pop('session2_id', None)
  if('pay' in session): session.pop('pay', None)
  if('difficulty' in session): session.pop('difficulty', None)
  user = loggedUser()
  user.stats[0].tic_streak = 0
  db.session.commit()
  return redirect(url_for('game2'))

@app.route('/game/memorygame')
# game3 checks if the user is logged in and the highscore variable is set to the user's highscore in the memory game
def game3():
  user = loggedUser()
  highscore = 0
  if(user):
    highscore = user.stats[0].highest_mem
  return render_template("memorygame.html", curr_user = loggedUser(), highscore=highscore)

@app.route('/game/memorygame/start')
def game3_start():
  # AJAX route to check if user has enough coins, if user has enough, game proceeds
  if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
    user = loggedUser()
    proceed = True
    if(user.coins > 0):
      user.coins -= 1
      user.stats[0].mem_played += 1
      db.session.commit()
    else:
      session.pop('_flashes', None)
      proceed = not proceed
    return jsonify({'proceed': proceed})
  return render_template("pagenotexist.html", curr_user = loggedUser())

# Ajax route function for memory game
@app.route('/game/memorygame/finished', methods=['POST'])
def game3_finished():
  # AJAX route gets the user's information and updates user's coins
  if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
    data = request.get_json()
    user = loggedUser()
    user.coins += data['earnings']
    # updates their highest score if their current game's score is greater than their highest score
    if(user.stats[0].highest_mem < data['levels']):
      user.stats[0].highest_mem = data['levels']
    db.session.commit()
    return jsonify({'high': user.stats[0].highest_mem})
  return render_template("pagenotexist.html", curr_user = loggedUser())

# route for rolling dice page
@app.route('/rng/rolldice')
def rng1():
  return render_template("rolladice.html", curr_user = loggedUser())

# route for little gadge chooses page
@app.route('/rng/littlegadgechooses')
def rng2():
  return render_template("littlegadgechooses.html", curr_user = loggedUser())

# logout redirects the user to the home page when the user clicks on the logout button
@app.route('/auth/logout')
def logout():
  session.pop('user', None)
  return redirect(url_for('home'))
# route for login
@app.route('/auth/login', methods=['POST', 'GET'])
def login():
  # if user is logged in, redirects them to the home page
  if(loggedUser()): return redirect(url_for('home'))
  # gets the username, password and remember me checkbox data from the form
  if(request.method == "POST"):
    username = request.form['username']
    password = request.form['password']
    rmbMe = request.form.get('rmbMe')
    # tries to find user in the database with given username
    user = User.query.filter_by(username = username).first()
    session.pop('_flashes', None)
    # if user not found, flashes a message
    if(not user):
      flash("User does not exist!")
      return render_template('login.html', errExist=True)
    # if user implemented a wrong password, a message is flashed
    elif(len(password) <= 3 or not bcrypt.check_password_hash(user.password, password)):
      flash("Incorrect password!")
      return render_template('login.html', errExist=True)
      # if user is found, the user ID is added to the session and the user is redirected to the home page
    else:
      if rmbMe: session.permanent = True
      else: session.permanent = False
      session["user"] = user.id
      return redirect(url_for('home'))
  return render_template('login.html')

# route for register
@app.route('/auth/register', methods=['POST', 'GET'])
def register():
  # if user is logged in, redirects them to the home page
  if(loggedUser()): return redirect(url_for('home'))
  if(request.method == "POST"):
    username = request.form['username']
    password = request.form['password']
    # validate the user's credentials
    (result, errmsg) = validateCredentials(username, password)
    # if invalid credentials, a message is flashed
    session.pop('_flashes', None)
    if not result:
      flash(errmsg)
      result = not result
      return render_template('register.html', errExist=result)
    # hash the user's password
    hashed = bcrypt.generate_password_hash(password).decode('utf-8')
    try:
      # add the user to the database
      addUser(username, hashed)
      return redirect(url_for('login'))
    except exc.IntegrityError:
      flash("Username already exists!")
      return render_template('register.html', errExist=True)
  return render_template('register.html')

# route for display profile
@app.route('/user/<int:id>/stats')
def id_stats(id):
  # gets user data from database using the user id provided
  user = User.query.filter_by(id=id).first()
  # if user does not exist, render the user not found page
  if(not user): return render_template('usernotfound.html', curr_user = loggedUser())
  # creates a dictionary with the user stats to be displayed on their profile page
  display = {
    "coins": user.coins,
    "username": user.username,
    "hang_win": user.stats[0].hang_win,
    "tic_win": user.stats[0].tic_win,
    "highest_mem": user.stats[0].highest_mem,
    "hang_streak": user.stats[0].highest_hang_streak,
    "tic_streak": user.stats[0].highest_tic_streak,
    "games_played": user.stats[0].games_played + user.stats[0].mem_played,
    "games_won": user.stats[0].games_won,
    "games_lost": user.stats[0].games_played - user.stats[0].games_won,
  }
  # calculates winrate and adds to dictionary to be displayed
  if(user.stats[0].games_played == 0):
    display["winrate"] = 0
  else:
    display["winrate"] = round((user.stats[0].games_won / user.stats[0].games_played) * 100, 2)
  return render_template('profile.html', curr_user = loggedUser(), display = display)

# getUsername takes the username and returns the user from the database
def getUsername(username):
  user = User.query.filter_by(username=username).first()
  return user

# route for searching
@app.route('/search', methods=['POST', 'GET'])
def search():
  if(request.method == "POST"):
    username = request.form['search']
    # search database for the user with the given username
    user = getUsername(username)
    session.pop('_flashes', None)
    # if user not found, flash a message
    if(not user):
      flash("User not found! Double check the letters!")
      return render_template('search.html', curr_user = loggedUser(), errExist=True)
    # if user is found, redirect to the user's stats
    else:
      return redirect(url_for('id_stats', id=user.id))
  return render_template('search.html', curr_user = loggedUser())
#route for leaderboard
@app.route('/game/stat/leaderboard')
def leaderboard():
  # query the database for stats and order them in top 25
  long_query = db.session.query(
    Stats,
    func.sum(Stats.mem_played + Stats.games_played).label('sum')
  ).group_by(Stats.id).order_by(func.sum(Stats.mem_played + Stats.games_played).desc()).limit(25).all()
  # create dictionary for each category
  display = {
    "coins": User.query.order_by(User.coins.desc()).limit(25).all(),
    "hang_streak": Stats.query.order_by(Stats.highest_hang_streak.desc()).limit(25).all(),
    "tic_streak": Stats.query.order_by(Stats.highest_tic_streak.desc()).limit(25).all(),
    "games_won": Stats.query.order_by(Stats.games_won.desc()).limit(25).all(),
    "games_played": long_query,
    "highest_mem": Stats.query.order_by(Stats.highest_mem.desc()).limit(25).all(),
    "tic_win": Stats.query.order_by(Stats.tic_win.desc()).limit(25).all(),
    "hang_win": Stats.query.order_by(Stats.hang_win.desc()).limit(25).all(),
  }
  return render_template('leaderboard.html', display=display, curr_user = loggedUser())

# if the server recieves a request for a URL that does not exist, the user is sent to the page not exist page
@app.errorhandler(404)
def not_found(error):
    return render_template('pagenotexist.html', curr_user = loggedUser())

if __name__ == "__main__":
  app.run()