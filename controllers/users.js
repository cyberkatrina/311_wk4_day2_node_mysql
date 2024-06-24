const mysql = require('mysql')
const pool = require('../sql/connection')
const { handleSQLError } = require('../sql/error')

const getAllUsers = (req, res) => {
  // SELECT ALL USERS

  pool.query("SELECT users.id, users.first_name, users.last_name, usersContact.user_id, usersContact.phone1, usersContact.phone2, usersContact.email, usersAddress.user_id, usersAddress.address, usersAddress.city, usersAddress.county, usersAddress.state, usersAddress.zip FROM users JOIN usersContact ON users.id = usersContact.user_id JOIN usersAddress ON users.id = usersAddress.user_id", (err, rows) => {
    if (err) return handleSQLError(res, err)
    return res.json(rows);
  })
}

const getUserById = (req, res) => {
  // SELECT USERS WHERE ID = <REQ PARAMS ID>
  let sql = "SELECT * FROM users WHERE ?? = ?"
  // WHAT GOES IN THE BRACKETS
  sql = mysql.format(sql, ["id", req.params.id])

  pool.query(sql, (err, rows) => {
    if (err) return handleSQLError(res, err)
    return res.json(rows);
  })
}

const createUser = (req, res) => {
  // INSERT INTO USERS FIRST AND LAST NAME
  let sql = "INSERT INTO users (??, ??) VALUES (?, ?)"
  
  // WHAT GOES IN THE BRACKETS
  sql = mysql.format(sql, ["first_name", "last_name", req.body.first_name, req.body.last_name])

  pool.query(sql, (err, results) => {
    if (err) return handleSQLError(res, err)
    return res.json({ newId: results.insertId });
  })

  let lastId = pool.query('SELECT LAST_INSERT_ID() AS lastId', function(err, rows) {
    if (err) throw err;
    console.log(res)

    // Use lastInsertId to insert into usersContact or usersAddress tables
    // Example: connection.query('INSERT INTO usersContact (user_id, phone1, phone2, email, ...) VALUES (?, ?, ?, ?, ...)', [lastInsertId, '123-456-7890', '987-654-3210', 'user1@example.com', ...], function(err, result) { ... });
  })

  let sql2 = "INSERT INTO usersContact (??, ??, ??, ??) VALUES (?, ?, ?, ?)"
  sql2 = mysql.format(sql, ["user_id", "phone1", "phone2", "email", lastId, req.body.phone1, req.body.phone2, req.body.email])
  pool.query(sql2, (err, results) => {
    if (err) return handleSQLError(res, err)
    return res.json({ newId: results.insertId });
  })

  let sql3 = "INSERT INTO usersAddress (??, ??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?, ?)"
  sql3 = mysql.format(sql, ["user_id", "address", "city", "county", "state", "zip", lastId, req.body.address, req.body.city, req.body.county, req.body.state, req.body.zip])
  pool.query(sql3, (err, results) => {
    if (err) return handleSQLError(res, err)
    return res.json({ newId: results.insertId });
  })
}

const updateUserById = (req, res) => {
  // UPDATE USERS AND SET FIRST AND LAST NAME WHERE ID = <REQ PARAMS ID>
  let sql = "UPDATE users SET ?? = ?, ?? = ? WHERE ?? = ?"
  // WHAT GOES IN THE BRACKETS
  console.log(req.body)
  sql = mysql.format(sql, ["first_name", req.body.first_name, "last_name", req.body.last_name, "id", req.params.id])

  pool.query(sql, (err, results) => {
    if (err) return handleSQLError(res, err)
    return res.status(204).json();
  })
}

const deleteUserByFirstName = (req, res) => {
  // DELETE FROM USERS WHERE FIRST NAME = <REQ PARAMS FIRST_NAME>
  let sql = "DELETE FROM users WHERE ?? = ?"
  // WHAT GOES IN THE BRACKETS
  sql = mysql.format(sql, ["first_name", req.params.first_name])

  pool.query(sql, (err, results) => {
    if (err) return handleSQLError(res, err)
    return res.json({ message: `Deleted ${results.affectedRows} user(s)` });
  })
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserByFirstName
}