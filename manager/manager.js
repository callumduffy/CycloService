const http = require('http');
const git = require('nodegit');
const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const querystring = require('querystring');
var request = require('request');
const escomplex = require('escomplex');
const managerNode = express();
var esprima = require('esprima');


var fileArray =[];
var fileIndex = 0;
var complexities =[];
var workers = [];
var work_port_num = 3001;
var workerNum = 3;
var workersDone = 0;
managerNode.use(bodyParser.json());
managerNode.use(bodyParser.urlencoded({ extended: true }));

//set up array for initialising the workers
for(var i=0;i<workerNum;i++){
  //options for the workers
  var options = {
    hostname: 'localhost',
    port: work_port_num,
    path: '/init',
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain',
    }
  };
  workers.push(options);
  console.log('Ready to send to port: ' + work_port_num);
  work_port_num++;
}

//clone repo, and sort the repo into js files
//then send message to workers to tell them to start
managerNode.get('/repoURL', (req,res) => {
  console.log('Cloning the repo, please wait...');
  var url = req.body,repoURL;
  var repo = git.Clone(url, path.join(__dirname,'./repo-folder')).catch((error) =>{
    console.log('Repo already cloned or doesnt exist');
  }).then((repo) => {
    //get array of js files
    repoToArray(path.join(__dirname,'./repo-folder'), /\.js$/);
    console.log("Cloning done...ready to start calculating");

  //loop to send init messages to the workers to get them to ask for work
  for(var i=0; i<workers.length;i++){
    req = http.request(workers[i]);
    req.write(JSON.stringify({"String": "Hello" }));
    req.end();
    workers[i].path = '/work';
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
  res.send('Calculating results, please wait...');
});

//method for the manager to handle post requests from the worker
managerNode.post('/', (req,res) => {
  //get port of worker
  var portString = 'http://localhost:' + req.body.port + '/work';
  //in case the file didnt exist..
  if(req.body.status == 'invalid'){
      console.log('Error with file: ' + req.body.index);
      complexities.push({
        index: req.body.index,
        path: req.body.path,
        score: req.body.score,
        status: -1
      });
  }
  else{
    if(req.body.status== 'done'){
      console.log('Score for file: '+ req.body.score);
      complexities.push({
        index: req.body.index,
        path: req.body.path,
        score: req.body.score,
        status: 1
      });
    }

    if(fileIndex<fileArray.length){
      console.log('Worker ' + req.body.port + ' ready to receive work');
      fileIndex++;
      
      request.post(
        portString,
        { json: {
          index : fileIndex,
          path : fileArray[fileIndex],
          status : 200
      } },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body)
          }
      });

      console.log(fileIndex + ' sent to worker ' + req.body.port);
    }
    else{
      console.log('all files sent');
      request.post(
        portString,
        { json: {
          index : fileIndex,
          path : fileArray[fileIndex],
          status : 404
      } },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body)
          }
      });
      workersDone++;
      if(workersDone == 3){
        console.log('All compiled.');
        var total =0;
        for(var i=0;i<complexities.length;i++){
          if(complexities[i].status==1){
            total += complexities[i].score;
          }
        }
        var avg = total/complexities.length;
        console.log('Average complexity of repo = ' + avg);
      }
    }
  }
});

managerNode.listen(3000, (err) => {
	if(err){
		return console.log('Manager cannot listen on port 3000.');
	}
	console.log('Manager listening on port 3000');
});