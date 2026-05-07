from flask import Flask, render_template, request, redirect, session
import mysql.connector
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = 'your_secret_key_here'  # For session management


def get_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'db'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )


@app.route('/')
def index():
    # Check if user is already logged in
    if 'username' in session:
        return redirect('/dashboard')
    return render_template('index.html')


@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            'SELECT * FROM users WHERE username = %s AND password = %s',
            (username, password)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user:
            session['username'] = username
            return redirect('/dashboard')
        else:
            return render_template('index.html', error='Invalid username or password')
    except mysql.connector.Error as err:
        return f"Error: {err}", 400


@app.route('/create.html')
def create_page():
    return render_template('create.html')


@app.route('/create', methods=['POST'])
def create_account():
    username = request.form.get('username')
    password = request.form.get('password')
    name = request.form.get('name')
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (username, password, name) VALUES (%s, %s, %s)',
            (username, password, name)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return redirect('/')  # Redirect to login page
    except mysql.connector.Error as err:
        return f"Error: {err}", 400


@app.route('/dashboard')
def dashboard():
    if 'username' not in session:
        return redirect('/')
    return render_template('dashboard.html', username=session['username'])


@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6767, debug=True)
