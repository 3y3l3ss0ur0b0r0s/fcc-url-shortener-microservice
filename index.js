require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// add mongoose
const mongoose = require('mongoose');

// connect to mongo database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true});

// add dns module
const dns = require('node:dns');

// add body-parser
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
/*app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});*/

// create schema for shortened url
const Schema = mongoose.Schema; // just for easier coding/typing

const shortUrlSchema = new Schema({
  original_url: String,
  short_url: String
});

const ShortUrl = mongoose.model("ShortUrl", shortUrlSchema);

// create a number to be incremented for shorturls
var urlNumber = 0;

// configure the body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// post url and save to database
app.post("/api/shorturl", (req, res) => {
  const originalUrl = new URL(req.body.url);

  dns.lookup(originalUrl.hostname, (err, address, family) => {

    console.log("err: " + err);
    console.log("address: " + address);
    console.log("family: " + family);

    if(err == null) {
      console.log("It looks like " + originalUrl + " is a valid URL.");

      urlNumber = urlNumber + 1;

      console.log("Shortened URL urlNumber is: " + urlNumber);

      // create ShortUrl document
      var someShortUrl = new ShortUrl({
        original_url: originalUrl,
        short_url: urlNumber
      });

      // save the ShortURL document
      someShortUrl.save();
      console.log("someShortUrl: " + someShortUrl);
      
      // respond to request with JSON     
      res.json({
        original_url: originalUrl,
        short_url: urlNumber
      });
    } else {
      console.log("URL is invalid. :(");

      res.json({
        error: 'invalid url'
      });
    } // end if and else
  }); // end dns lookup
}); // end post

// app.get method
app.get("/api/shorturl/:urlNumber", async (req, res) => {
  ShortUrl.findOne({short_url: req.params.urlNumber})
    .then((url) => {
      console.log("URL found: " + url.original_url);
      res.redirect(url.original_url);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
