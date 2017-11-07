import os.path

from db import db
from settings import SQLALCHEMY_DATABASE_URI

db.create_all()
