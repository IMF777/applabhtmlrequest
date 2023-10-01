const axios = require("axios");
const express = require("express");
const fs = require("fs");

const app = express();

function createIdentifier(num){
  
  var char = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var id = "";
  
  for (var i=0; i<num; i++){
    id+=char[randomNumber(0,char.length-1)];
  }
  
  return id;
  
}



app.get("/request/*", function(req,res){
  var params = req.params[0].split("/");

  const dweet = params[0];
  const method = params[1];
  var url = "https:/";

  for (var i=2; i<params.length; i++){
    if (params[i][0] === ".") url += params[i];
    else url += "/"+params[i];
  }

  url = decodeURIComponent(url);

  //console.log({method, url, dweet})
  

  axios[method](url).then(function(response){
    var chunks = [];
    var dat;
    
    if (typeof response.data === "object"){
      dat = JSON.stringify(response.data);
    } else {
      dat = response.data;
    }


    
    var callback = function(){
  
      if (chunks.length > 10){
        sendDweet(dweet, false, "Response too long");
      } else  if (chunks.length === 1) {
        sendDweet(dweet, true, chunks[0]);
      } else {
        var ids = [];
        for (var i=0; i<chunks.length; i++){
          ids.push(createIdentifier());
        }
        
        chunks.forEach(function(chunk, i){
          sendDweet(ids[i], true, chunk);
          if (i === chunks.length - 1){
            sendDweet(dweet, "chunked", ids);
          }
        });
        
      }
      
    }

    

    var len = dat.length;
    
    if (len > 2000){
      for (var i=0; i<len; i+=2000){
        chunks.push(dat.substring(i,i+2000));
        
        if (i+2000 > len){
          callback();
        }
      }
    } else {
      chunks.push(dat);
      callback();
    }

    function sendDweet(id,success,tobesent){
      
      axios.post(`https://dweet.io/dweet/for/${id}?success=${success}&response=${encodeURIComponent(tobesent)}`)
        .then(function(){
        console.log("POSTED")
        res.status(200);
        
        /*if (id === dweet){
          fs.readFile("img/http.png", function(err,dat){
            res.write(dat);
            res.end();
          });
        }*/
          
      });
    }
    
  });

  
  
});

app.listen(3000)
