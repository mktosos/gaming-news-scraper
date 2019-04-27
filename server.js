// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
var mongoose = require("mongoose");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "gamescraperDB";
var collections = ["gamescraper"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});
// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
 // Making a request via axios for reddit's "webdev" board. We are sure to use old.reddit due to changes in HTML structure for the new reddit. The page's Response is passed as our promise argument.
 axios.get("https://old.reddit.com/r/videogames/").then(function(response) {
      // Load the html body from axios into cheerio
      var $ = cheerio.load(response.data);
      // For each element with a "title" class
      $(".title").each(function(i, element) {
        // Save the text and href of each link enclosed in the current element
        var title = $(element).children("a").text();
        var link = $(element).children("a").attr("href");
  
        // If this found element had both a title and a link
        if (title && link) {
          // Insert the data in the scrapedData db
          db.gamescraper.insert({
            title: title,
            link: link
          },
          function(err, inserted) {
            if (err) {
              // Log the error if one is encountered during the query
              console.log(err);
            }
            else {
              // Otherwise, log the inserted data
              console.log(inserted);
            }
          });
        }
      });
    });
  
    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");
  });



// // First, tell the console what server.js is doing
// console.log("\n***********************************\n" +
//             "Grabbing every thread name and link\n" +
//             "from reddit's videogame board:" +
//             "\n***********************************\n");

   

//     // Load the Response into cheerio and save it to a variable
//     // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
//     var $ = cheerio.load(response.data);

//     // An empty array to save the data that we'll scrape
//     var results = [];

//     // With cheerio, find each p-tag with the "title" class
//     // (i: iterator. element: the current element)
//     $("p.title").each(function(i, element) {

//         // Save the text of the element in a "title" variable
//         var title = $(element).text();

//         // In the currently selected element, look at its child elements (i.e., its a-tags),
//         // then save the values for any "href" attributes that the child elements may have
//         var link = $(element).children().attr("href");

//         // Save these results in an object that we'll push into the results array we defined earlier
//         results.push({
//         title: title,
//         link: link
//         });
//     });

    // Log the results once you've looped through each of the elements found with cheerio
    // console.log(results);
    


// Set the app to listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
  });
