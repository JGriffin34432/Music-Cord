var request = require('superagent');

const API_KEY = "GOOGLR API KEY HERE";
const WATCH_VIDEO_URL = "https://www.youtube.com/watch?v=";

exports.watchVideoUrl = WATCH_VIDEO_URL;

exports.search = function search(searchKeywords, callback) {
  var requestUrl = 'https://www.googleapis.com/youtube/v3/search' + '?part=snippet&q=' + escape(searchKeywords) + '&key=' + API_KEY;

  request(requestUrl, (error, response) => {
    if (!error && response.statusCode == 200) {

      var body = response.body;
      if (body.items.length == 0) {
        console.log("I Could Not Find Anything!");
        return;
      }
      for (var item of body.items) {
        if (item.id.kind == 'youtube#video') {
          callback(item.id.videoId, item.snippet.title);
          return;
        }
      }
    } else {
      console.log("Unexpected error!");
      return;
    }
  });

  return;

};