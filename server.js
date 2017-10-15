var express = require('express');
var app = express();
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "knowitall"
});

con.connect(function(err) {
	if (err) throw err;
	console.log("Sucessfully connected to the MySql Database");
});

app.use(express.static(__dirname + '/public'));
app.get('/questionList', function (req, res) {
	console.log("The server recieved the GET request");

	con.query("SELECT DISTINCT p.description, p.subTitle, p.title FROM poll "+
	  	" p, tag t, tagtopoll tp where tagStr='" + req.query.tagQuery +
	  	"' AND tp.tagID = tp.pollID", 
	  function (err, result, fields) {
	  	console.log("Server fetched the data from the db");
	    if (err) throw err;
	    res.json(result);
	});
});

app.listen(8080);
console.log("Server running on port 8080");