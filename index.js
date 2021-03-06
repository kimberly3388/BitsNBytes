const http = require("http"); // Use https if your app will not be behind a proxy.
const bodyParser = require("body-parser");
const express = require("express");
const path = require('path');

const app = express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const frontendPath = __dirname + '/src/frontend';
app.use(express.static(frontendPath));
//app.use(express.static('public'))

app.listen(process.env.PORT || 8080, function () {
    console.log('Example app listening on port 8080!');
});

app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,    Content-Type, Accept");
    next();
});





app.get('/', (req, res, next) => {
    res.sendFile(path.join(frontendPath,'index.html'));
});








///////////////////////////////// db dao ////////////////////////////////
const sqlite3 = require('sqlite3').verbose();


// Retrieving All Rows
app.get('/api/getzivali', (req, res, next) => {
    // open db conn
    let db = new sqlite3.Database('./src/frontend/media/db.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error(err.message);
      }
      // console.log('Connected to the database.');
    });

    // get rows
    db.all("SELECT * FROM Zivali", [], (err, rows) => {
      if (err) {
        throw err;
      }
      // rows.forEach((row) => {
      //   console.log(row);
      // });
      res.send(JSON.stringify(rows, null, 2));
    });

    // close db conn
    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      // console.log('Close the database connection.');
    });
});

//work in progress...
//Retrieving Filtered Rows
app.get('/api/filterzivali', (req, res, next) => {
    var status = req.query.status;  // vsi izgubljeni najdeni
    var vrsta = req.query.vrsta;    // vsi pes macka drugo
    var barva = req.query.barva;    // crna bela ...
    var iskalnabeseda = req.query.iskalnabeseda; // text to search in every field

    console.log(status+" "+vrsta+" "+barva+" "+iskalnabeseda);

    // open db conn
    let db = new sqlite3.Database('./src/frontend/media/db.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        // console.log('Connected to the database.');
    });

    // get data
    //SELECT * FROM Zivali WHERE (Status = 0 AND Vrsta = "pes") AND (Barva = "bela" AND Opis = "vsebujeiskalnobesedo");

    // get rows
    if (!barva) barva = "";
    var color = "";
    console.log(color);
    let i = 0;
    barva.split(",").forEach((c) => {
        if (i === 0) {
            color += " and barva like '%"+c+"%'";
        }
        else {
            color += " or barva like '%"+c+"%'";
        }
        i++;
    })
    sqlStavek = "SELECT * FROM Zivali WHERE "+
         (status === "vsi" ? " 1=1" : " status = '"+status+"'")+
         (vrsta === "vsi"  ? " and 1=1" : " and vrsta = '"+vrsta+"'")+
         color+
         " and opis like '%"+iskalnabeseda+"%'"+
         " or ime like '%"+iskalnabeseda+"%'"+
         " or kontakt_mail like '%"+iskalnabeseda+"%'"+
         " or kontakt_tel like '%"+iskalnabeseda+"%'";
    // console.log(sqlStavek);
    db.all(sqlStavek, (err, rows) => {
        // console.log(rows)
        if (err) {
            throw err;
        }
        // rows.forEach((row) => {
        //   console.log(row);
        // });
        res.send(JSON.stringify(rows, null, 2));
    });

    // close db conn
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        // console.log('Close the database connection.');
    });

})



// inserting
app.post('/api/insertzival', (req, res) => {
    var opis = req.body.opis;
    // console.log(opis);
    var ime = req.body.ime;
    var vrsta = req.body.vrsta;
    var slika = req.body.slika;
    // console.log(slika);
    var barva = req.body.barva;
    var lokacija = req.body.lokacija;
    var datum = req.body.datum;
    var kontakt_mail = req.body.kontakt_mail;
    var kontakt_tel = req.body.kontakt_tel;
    var status = req.body.status;


    // open db conn
    let db = new sqlite3.Database('./src/frontend/media/db.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error(err.message);
      }
      // console.log('Connected to the database.');
    });

    // insert data
    let data = [ime, vrsta, slika, barva, lokacija, datum, kontakt_mail, kontakt_tel, opis, status]
    db.run(`INSERT INTO Zivali(ime, vrsta, slika, barva, lokacija, datum, kontakt_mail, kontakt_tel, opis, status) \
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, data,
        function(err) {
            if (err) {
              return console.log(err.message);
            }
            // get the last insert id
            console.log(`A row has been inserted with rowid ${this.lastID}`);

    });

    // close db/save to db
    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/index.html");
      // console.log('Close the database connection.');
    });

});


