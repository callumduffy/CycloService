# Restful Cyclomatic Complexity Web Service  
Made for Internet Applications modules in Trinity College Dublin.  
This service works by a manager node cloning a repository from github, it then invokes the following steps:  
- Count the number of .js files in the repository  
- Store all of their paths  
- Spawns worker nodes  
- Distributes files to worker nodes via work stealing  
- Worker nodes calculate cyclomatic complexity of each file they receive  
- Send it back to the manager  
- Manager then does statistics based off this data  
  
Currently have it working for one machine, All as different processes. Will be updated to allow it to work as a distributed system.  