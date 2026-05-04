from flask import Flask, render_template
import mysql.connector

app = Flask(__name__, static_folder='static', template_folder='templates')

# Database configuration
def get_connection():
    return mysql.connector.connect(
        host='localhost',
        user='eivind',
        password='eivind123',
        database='IM_WIKI'
    )




@app.route('/')
def index():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users')
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return render_template('index.html', users=users)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6767, debug=True)
