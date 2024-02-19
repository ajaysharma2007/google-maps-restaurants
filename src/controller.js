import axios from "axios";
import URI from "urijs";

const STATUS = {
  IN_PROG: 0,
  SUCC: 1,
  FAIL: 2
};


async function loadBiz(loc) {
  var url = URI("http://localhost:3002/yelp-query")
      .search({latitude: loc.lat,
               longitude: loc.lng,
               term:"food"})
      .toString();
  console.log("url", url)
  var resp = await  axios.get(url);
  if (resp.status === 200) {
    return {status: STATUS.SUCC,
            biz: resp.data.biz};
  } else {
    return {status: STATUS.FAIL};
  }
};



export {STATUS, loadBiz};
