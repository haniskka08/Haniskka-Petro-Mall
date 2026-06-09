import psycopg2

try:
    conn = psycopg2.connect(dbname='postgres', user='postgres', password='170208', host='localhost')
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname")
    dbs = [row[0] for row in cur.fetchall()]
    print("Existing databases:", dbs)
    
    if 'petromall' not in dbs:
        cur.execute("CREATE DATABASE petromall")
        print("SUCCESS: Database 'petromall' created!")
    else:
        print("Database 'petromall' already exists — OK!")
    conn.close()
except Exception as e:
    print(f"ERROR: {e}")
