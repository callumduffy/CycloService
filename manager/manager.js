const http = require('http');
var express = require('express');
const managerNode = express();
const git = require('nodegit');
const path = require('path');
const fs = require('fs');

//plan is to clone repo, then get its head
  //we want to iterate by commit, sending a worker a commit each time
  //on receipt of a post, check if its a result or nah
  //and then send another commit if possible
  //when none left send ()

  //however not sure how to do this yet
  //so going to start by doing last commit, file by file.
  //should be a good start

var fileArray =[];
var fileIndex = 0;

console.log(fileArray.length);

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
  console.log('Cloning the repo, please wait...');
  var repo = git.Clone('https://github.com/callumduffy/http-s-proxy.git', path.join(__dirname,'./repo-folder')).catch((error) =>{
    console.log("error on clone");
  }).then((repo) => {
    //get array of js files
    console.log('pre-file loop');
    repoToArray(path.join(__dirname,'./repo-folder'), /\.js$/);
    console.log(fileArray.length);
  });

  //finds all js files in the repo that was cloned
  repoToArray = (repoPath, fileType) => {
    var files = fs.readdirSync(repoPath);
    for (var i = 0; i < files.length; i++) {
      var file = path.join(repoPath, files[i]);
      var fileOrDir = fs.lstatSync(file);
      if(fileOrDir.isDirectory()){
        repoToArray(file,fileType);
      }
      else if(fileType.test(file)){
        fileArray.push(file);
      }
    }
    console.log('Donex1.');
  }

  res.send('Hello');
});

//method for the manager to handle post requests from the worker
managerNode.post('/', (req,res) => {
  //first elem will be 0 if worker has never received work
  if(0 != 0){
    if(fileIndex = fileArray.length-1){
      res.send('()');
    }
    else{
      res.send('0');
      //res.sendFile(fileArray[fileIndex]);
      fileIndex++;
    }  }
  //if not 0, then it is a worker posting a response and requesting work
  else{
    if(fileIndex = fileArray.length-1){
      //store the commit details
      res.send('()');
    }
    else{
      //store deets
      res.sendFile(fileArray[fileIndex]);
      fileIndex++;
    }
  }
	console.log(req);
});

managerNode.listen(3000, (err) => {
	if(err){
		return console.log('Manager cannot listen on port 3000.');
	}
	console.log('Manager listening on port 3000');

	//small piece of cxode to start the server
	//will send an initial post to the worker to check its working

	// write data to request body
	// req.write('{"string": "Hello, World"}');
	// req.end();
});

// var req = http.request(options, function(res) {
//   console.log('Status: ' + res.statusCode);
//   console.log('Headers: ' + JSON.stringify(res.headers));
//   res.setEncoding('utf8');
//   res.on('data', function (body) {
//     console.log('Body: ' + body);
//   });
// });

// req.on('error', function(e) {
//   console.log('problem with request: ' + e.message);
// });