import bcrypt

plain = "Password123!"
hashed = bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
print("Hashed:", hashed)

is_ok = bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
print("Match:", is_ok)
