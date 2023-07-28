const path = require('path');
const express = require('express');
const app = express();
const { DateTime } = require('luxon');
const PORT = 4444;
const request=require('request');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
let head;
app.use((req,res,next)=>{
    console.log("qwe");
    request.post(
        'http://20.244.56.144/train/auth',
        {
            json:
            {
                "companyName": "ictc",
                "clientID": "499a1694-22dc-47e0-b6ca-4057f03e79aa",
                "clientSecret": "YSWEHwHNXgmgWrer",
                "ownerName": "Tripti",
                "ownerEmail": "triptisingla306@gmail.com",
                "rollNo": "20820802720"
            }
        },
            function(error, response, body){
                console.log(response.body.token_type);
                console.log(response.body.access_token);

                head=response.body.token_type+" "+response.body.access_token;

                next();
            }
    )
})
const current_time = DateTime.local();

function isLeavingInNext12Hours(train) {
    const departureTime = current_time.set({
      hour: train.departureTime.Hours,
      minute: train.departureTime.Minutes,
      second: train.departureTime.Seconds,
    });
  
    const departureTimeWithDelay = departureTime.plus({ minute: train.delayedBy });
  
    return (
      current_time <= departureTime && departureTime < current_time.plus({ hours: 12 }) ||
      current_time <= departureTimeWithDelay && departureTimeWithDelay < current_time.plus({ hours: 12 })
    );
  }

app.get('/trains',(req,res)=>{
    const data=request.get(
        {
        url:'http://20.244.56.144/train/trains',
        headers: {
            
            
                "Authorization": head,
                
              
        }
        },
        function(error, response,body){
            if (error) {
                console.error("Error fetching data from API:", error);
                return res.status(500).send("Error fetching data from API");
              }
            // console.log(error);
            // console.log(response);
            // console.log(SON.stringify(body));
            // res.send(body);
            try {
                const trains = JSON.parse(response.body);
                console.log("Data =", trains);
        
                const next12HourTrains = trains.filter(train => isLeavingInNext12Hours(train));
                res.send(next12HourTrains);
              }
              catch (parseError) {
                console.error("Error parsing JSON response:", parseError);
                return res.status(500).send("Error parsing JSON response");
              }
            });
})
// app.get('/',(req,res)=>{
//     console.log("hii");
//     res.send("hii")
// })


app.listen(PORT, () => {
    console.log(`http://localhost:` + PORT);
})
