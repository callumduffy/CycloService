var http = require('http');
var express = require('express');
var managerNode = express();
var git = require('nodegit');

Git.Clone("https://github.com/callumduffy/chatProtocol", "repo-folder").then(function(repository) {
  //plan is to clone repo, then get its head
  //we want to iterate by commit, sending a worker a commit each time
  //on receipt of a post, check if its a result or nah
  //and then send another commit if possible
  //when none left send ()
});

var options = {
  hostname: 'localhost',
  port: 3002,
  path: '',
  method: 'POST',
  headers: {
      'Content-Type': 'application/json',
  }
};

//probably wont use but leaving for the minute
managerNode.get('/', (req,res) => {
	res.send("Hello");
});

//method for the manager to handle post requests from the worker
managerNode.post('/', (req,res) => {
	console.log(req);
});

managerNode.listen(3000, (err) => {
	if(err){
		return console.log("Manager cannot listen on port 3000.");
	}
	console.log("Manager listening on port 3000");

	//small piece of code to start the server
	//will send an initial post to the worker to check its working

	// write data to request body
	req.write('{"string": "Hello, World"}');
	req.end();
});

var req = http.request(options, function(res) {
  console.log('Status: ' + res.statusCode);
  console.log('Headers: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (body) {
    console.log('Body: ' + body);
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});