define(function() { // Function for creating the table.


    // Gets the data form the data/combined.json file
    d3.json("/data/combined.json", function (error, data) {
        console.log("Coming in");
        if (error) throw error;
    });
});