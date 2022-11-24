db.createUser(
  {
    user: process.env['MONGO_INITDB_ROOT_USERNAME'],
    pwd: process.env['MONGO_INITDB_ROOT_PASSWORD'],
    roles: [
      {
        role: "readWrite",
        db: "money"
      }
    ]
  }
);
db.createCollection("test"); //MongoDB creates the database when you first store data in that database
