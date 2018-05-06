// Whenever someone clicks a movie title, open review
$("#movies").on("click", "h3", function () {
    // Empty the reviews from the review section
    $("#reviews").empty();
    // Save the id from the p tag
    var movieID = $(this).attr("data-id");
    // Now make an ajax call for the movie
    $.ajax({
        method: "GET",
        url: "/movies/" + movieID
    })
        // With that done, add the review information to the page
        .done(function (data) {
            // The title of the movie
            $("#reviews").append("<h3>Enter a review for <br>" + data.headline + ":</h3><br/>");
            // An input to enter a new title
            $("#reviews").append("Title:<br/> <input id='titleinput' name='title' ><br/>");
            // A textarea to add a new review body
            $("#reviews").append("Comments:<br/> <textarea id='bodyinput' name='body'></textarea><br/>");
            // A button to submit a new review, with the id of the movie saved to it
            $("#reviews").append("<button data-id='" + data._id + "' id='savereview'>Save review</button>");

            // If there's a review in the movie
            if (data.review) {
                // Place the title of the review in the title input
                $("#titleinput").val(data.review.title);
                // Place the body of the review in the body textarea
                $("#bodyinput").val(data.review.body);
                // add a delete button
                $("#reviews").append("<button data-id='" + data.review._id + "' id='delreview'>Delete review</button>");
            }
        });
});

// When you click the savereview button
$(document).on("click", "#savereview", function () {
    // Grab the id associated with the movie from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the review, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/movies/" + thisId,
        data: {
            // Value taken from title input
            title: $("#titleinput").val(),
            // Value taken from review textarea
            body: $("#bodyinput").val()
        }
    })
        // With that done
        .done(function (data) {
            // Log the response
            console.log(data);
            // Empty the reviews section
            $("#reviews").empty();
        });

    // Also, remove the values entered in the input and textarea for review entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});


// When you click the delreview button
$("#reviews").on("click", "#delreview", function () {
    $("#reviews").empty();
    // Run a POST request to delete
    $.ajax({
        method: "POST",
        url: "/delreview/" + $(this).attr("data-id")
    })
        // With that done
        .done(function (data) {

        });
});

// When you click the delmovie button
$("#movies").on("click", "#delmovie", function () {
    console.log("delmovie button clicked");
    // Run a POST request to delete
    $.ajax({
        method: "POST",
        url: "/delmovie/" + $(this).attr("data-id")
    })
        // With that done
        .done(function (data) {
            $("#reviews").append(data);
            // Grab the movies as a json
            $.getJSON("/movies", function (data) {
                $("#movies").html("<h2>Saved Movies</h2><hr/>");
                // For each one
                for (var i = 0; i < data.length; i++) {
                    // Display the info 
                    $("#movies").append("<h3 data-id='" + data[i]._id + "'>" + data[i].headline + "</h3>");
                    $("#movies").append(data[i].link + "<br/>" + data[i].summary + "<br/>")
                    $("#movies").append("<button data-id='" + data[i]._id + "' id='delmovie'>Delete Movie</button><br/><hr>");
                }
            });
        });
});


// When you click the savemovie button
$("#movies").on("click", "#savemovie", function () {
    console.log("savemovie button clicked");
    // Run a POST request to make this movie saved
    $.ajax({
        method: "POST",
        url: "/savemovie/" + $(this).attr("data-id")
    })
        // With that done
        .done(function (data) {
            // Log the response
            $("#reviews").append(data);
        });

});