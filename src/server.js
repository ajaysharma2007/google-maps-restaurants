const keys = require("./constants");

const express = require('express')
const rateLimit = require("express-rate-limit");

const cors = require('cors')
const URI = require('urijs')
const axios = require("axios")
const logger = require("./utils/logging")
const morgan = require("morgan")
const app = express()
const port = 3002

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 15
});

app.use(cors());
app.use(limiter);
app.use(morgan("tiny"))

app.get('/yelp-query', logger, async (req, res) => {
  var url = URI("https://api.yelp.com/v3/businesses/search")
      .search(req.query)
      .toString();
  var cfg = {headers: {Authorization: "Bearer " + keys.YELP_API_KEY}}
  axios.get(url, cfg)
    .then(function(response) {
      // console.log("NEWS", response.data)
      res.json({biz: response.data.businesses,
                cnt: response.data.total,
                region: response.data.center})
    })
    .catch(function (error) {
      console.log("Error", error);
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
