const http = require('http');
const git = require('nodegit');
const path = require('path');
const fs = require('fs');
const express = require('express');
const managerNode = express();

var fileArray =[];
var fileIndex = 0;
var workers = [];
var work_port_num = 3001;
var workerNum = 3;

//set up array for initialising the workers
for(var i=0;i<workerNum;i++){
  //options for the workers
  var w1 = {
    hostname: 'localhost',
    port: work_port_num,
    path: '',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
  };
  workers.push(w1);
  work_port_num++;
  console.log('Worker created on port: ' + work_port_num);
}

//clone repo, and sort the repo into js files
//then send message to workers to tell them to start
managerNode.get('/', (req,res) => {
  console.log('Cloning the repo, please wait...');
  var repo = git.Clone('https://github.com/callumduffy/http-s-proxy.git', path.join(__dirname,'./repo-folder')).catch((error) =>{
    console.log('error on clone');
  }).then((repo) => {
    //get array of js files
    repoToArray(path.join(__dirname,'./repo-folder'), /\.js$/);
    console.log("Cloning done..proceeding to allow work stealing");

  //loop to send init messages to the workers to get them to ask for work
  for(var i=0; i<workers.length;i++){
    req = http.request(workers[i]);
    req.write(JSON.stringify({'String':fileArray[fileIndex]}));
    req.end();
  }
  });

  //finds all js files in the repo that was cloned
  repoToArray = (repoPath, fileType) => {
    var files = fs.readdirSync(repoPath);
    for (var i = 0; i < files.length; i++) {
      var file = path.join(repoPath, files[i]);
      var fileOrDir = fs.lstatSync(file);
      //check if a file or directory
      //if directory, recursion
      if(fileOrDir.isDirectory()){
        repoToArray(file,fileType);
      }
      else if(fileType.test(file)){
        fileArray.push(file);
      }
    }
  }
  res.send('Manager started');
});

//method for the manager to handle post requests from the worker
managerNode.post('/', (req,res) => {
	console.log('posted back baby');
});

managerNode.listen(3000, (err) => {
	if(err){
		return console.log('Manager cannot listen on port 3000.');
	}
	console.log('Manager listening on port 3000');

	//small piece of code to start the server
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