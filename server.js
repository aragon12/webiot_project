
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const fs = require('fs');
const session = require("express-session")
var mysql = require('mysql');

app.set("view engine", "ejs");

app.use(urlencodedParser);
app.use(session({secret:"our secret", resave:true, saveUninitialized:true}))

//render homepage
app.get("/", (req, res) => {
    if(req.session.auth == true) {
        res.render('logged', {fname:req.session.fname, lname:req.session.lname})
    } else {
        res.render('home');
    }
});

//redirect to home
//if anyone come directly 
app.get("/quiz", (req, res) => {
 res.redirect('/');
});

function lg(req, res) {
    var email = req.body.email
    var passw = req.body.passw

    var con = mysql.createConnection({
        host: "192.168.145.131",
        user: "root",
        password: "",
        database: "mydb"
      });
      
      con.connect(function(err) {
        if (err) throw err;
        con.query("SELECT * FROM auth_table where email = \"" + email + "\"", function (err, result, fields) {
          if (err) throw err;
          if (result.length > 0) {
              console.log(result);
              result.forEach( (data) => {
                  if (data.pass == passw) {
                      res.write("Autheticated")
                      req.session.auth = true
                      req.session.fname = data.fname
                      req.session.lname = data.lname
                      res.end()
                  } else {
                    res.write("Password wrong")
                    res.end()
                  }
              })
        } else {
            res.write("Email does not exist")
            res.end()
        }
        });
      });


}
//process login
app.post('/login', lg);

app.get("/login", (req, res) => {
    res.redirect("/")
    })


function reg(req, res) {
    res.render("register")
}
//handle register 
app.get('/register', reg);

app.post('/register', (req, res)=> {

    var con = mysql.createConnection({
        host: "192.168.145.131",
        user: "root",
        password: "",
        database: "mydb"
      });

      var qry = "insert into auth_table (fname, lname, email, mobile, hobby, gender, pass) values('"+req.body.fname+"','"+req.body.lname+"','"+req.body.email+"','"+req.body.mobile+"','"+req.body.hobby+"','"+req.body.gender+"','"+req.body.pass+"')"

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        con.query(qry, function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
        });
      });
      res.write("Registered Successfully")
      res.end()
});

app.post('/logout', (req, res) => {
    req.session.auth = false
    res.redirect('/');

});

//404 error for invalid pages
app.use((req, res, next) => {
    res.status(404).write("<h1>404 Not found</h1>");
    res.end();
})

//start the server
app.listen(8080, () => {
  console.log("server started on port 8080");
});