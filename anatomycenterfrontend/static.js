
var express = require('express');
var app = express();

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/dist/web'));
app.get("*", function(req, res) {
    res.sendFile(__dirname + '/dist/web/index.html');
});

app.listen(app.get('port'));
console.log("Static server started at", app.get("port"));
