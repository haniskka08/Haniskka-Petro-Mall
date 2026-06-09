import psycopg2

try:
    conn = psycopg2.connect(dbname='Petromall', user='postgres', password='170208', host='localhost')
    cur = conn.cursor()
    cur.execute("SELECT id, full_name, email, is_active FROM dealers")
    rows = cur.fetchall()
    print("Dealers in Petromall:")
    for r in rows:
        print(r)
    conn.close()
except Exception as e:
    print("Error:", e)
