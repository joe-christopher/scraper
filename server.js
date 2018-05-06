var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var mongojs = require("mongojs");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
// handlebars will handle our layout
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.Promise = Promise;

if (process.env.MONGODB_URI){
  mongoose.connect(process.env.MONGODB_URI)
}else{
  mongoose.connect("mongodb://localhost/scraper", {
      // useMongoClient: true
  })
}


// Routes

// show the main page if no route was requested
app.get("/", function (req, res) {
  db.movie
  .find({})
  .then(function(dbmovie) {
    if (dbmovie < 1) {
      res.render("scrape")
    } else {
      res.render("index", {data: dbmovie})
    }
  })
  .catch(function(error) {
    res.json(error);
  });
});


// // show list of movies
app.get("/movies", function (req, res) {
  db.movie
  .find({saved: true})
  .then(function(dbmovie) {
    res.json(dbmovie);
  })
  .catch(function(error) {
    res.json(error);
  });
});


// show saved movies
app.get("/saved", function (req, res) {
  db.movie
  .find({saved: true})
  .then(function(dbmovie) {
      res.render("saved", {data: dbmovie})
  })
  .catch(function(error) {
    res.json(error);
  });
});

// our user wants to get new movie listings, go scrape the site
app.get("/scrape", function (req, res) {
  // let's empty out the movies so we do not have any duplicates
  db.movie.remove().exec();
  // let's see what is happening in the baseball world today
  axios("https://www.amctheatres.com/movies").then(function (response) {
    var $ = cheerio.load(response.data);
    // go to the first parent
      $("div.MoviePostersGrid-text").each(function (i, element) {
      // create a new object to pass into the db
      var newmovie = {};
      // get the URL
      newmovie.link = 'https://www.amctheatres.com' + $(element).children('a').attr('href');
      // get the headline
      newmovie.headline = $(element).children('h3').text();
      // get the summary
      newmovie.summary = $(element).children('div').children('p').children("span:last-of-type").text();

      // insert the movie into the db
      db.movie.create(newmovie)
        .then(function (dbmovie) {
          res.json(dbmovie);
        })
        // handle any errors
        .catch(function (error) {
          res.json(error);
        });
    });
    // send them back to the index to see the new content
    res.redirect("/");
  });
});

// Route for grabbing a specific movie by id, populate it with it's review
app.get("/movies/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.movie
    .findOne({ _id: req.params.id })
    // ..and populate all of the reviews associated with it
    .populate("review")
    .then(function(dbmovie) {
      // If we were able to successfully find an movie with the given id, send it back to the client
      res.json(dbmovie);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an movie's associated review
app.post("/movies/:id", function(req, res) {
  // Create a new review and pass the req.body to the entry
  db.review
    .create(req.body)
    .then(function(dbreview) {
      // If a review was created successfully, find one movie with an `_id` equal to `req.params.id`. Update the movie to be associated with the new review
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.movie.findOneAndUpdate({ _id: req.params.id }, {review: dbreview._id}, { new: true });
    })
    .then(function(dbmovie) {
      // If we were able to successfully update an movie, send it back to the client
      res.json(dbmovie);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route to delete a review
app.post("/delreview/:id", function(req, res) {
  // remove it from the movie 
  db.review.findOneAndRemove({"_id": req.params.id})
  // db.movie.remove({review: req.params.id})
  .then(function(dbmovie) {
      console.log("delete review ", req.params.id );
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route to delete a movie
app.post("/delmovie/:id", function(req, res) {
  // remove it from the db
  db.movie.findOneAndRemove({"_id": req.params.id})
  // db.movie.remove({review: req.params.id})
  .then(function(dbmovie) {
    res.send("Movie has been deleted");
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for grabbing a specific movie by id, populate it with it's review
app.post("/savemovie/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.movie
  .update({ _id: req.params.id }, {$set: {saved:true}})
    .populate("review")
    .then(function(dbmovie) {
      res.send("Movie has been saved");
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// startup the server
app.listen(PORT, function () {
  console.log("app listening on PORT " + PORT);
});