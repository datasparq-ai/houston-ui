import axios from "axios";
import dummyData from './../components/App/dummyData'

// const API_URL = "";
const API_URL = document.location.host === "localhost:3000" ? "http://localhost:5000" : "";
const API_PREFIX = "/api/v1";

// const log = console.log;
const log = () => "";

function parse_houston_error(err) {
    log(err);
    if (err.response) {
        return err.response.status + ': ' + err.response.data.error + '. ' + err.response.data.message;
    } else {
        log("Sorry, couldn't access the server, please check your connection or try again in a minute.");
        return err;
    }
}

export default {

    get: function (path, key, callback, demo=false) {

        log("GET " + path);

        if (demo) {
          log("Demo mode: returning dummy data");
          if (key !== "demo") {
            return {
              data: {
                message: "key not found"
              },
              status: 404
            }
          }
          return (
            async () => {
              const response = {data: dummyData[path], status: 200};
              log("<-- " + path, response);
              return await callback(response, null)
            }
          )();
        }

        let config = {
          headers: {
            'Content-Type': 'application/json',
            'x-access-key': key,
          }
        };

        return axios.get(API_URL + API_PREFIX + path, config)
            .then(function (response) {
                log("<-- " + path, response);
                return callback(response, null);
            }).catch(error => callback(null, parse_houston_error(error)));

    },
    post: function (path, key, data, callback) {
        let config = {
          headers: {
            'Content-Type': 'application/json',
            'x-access-key': key,
          }
        };

        axios.post(API_URL + API_PREFIX + path, data, config)
            .then(function (response) {
                callback(response, null);
            }).catch(error => callback(null, parse_houston_error(error)));

    },
    put: function (path, key, data, callback) {
        let config = {
          headers: {
            'Content-Type': 'application/json',
            'x-access-key': key,
          }
        };

        axios.put(API_URL + API_PREFIX + path, data, config)
            .then(function (response) {
                callback(response, null);
            }).catch(error => callback(null, parse_houston_error(error)));

    },
    delete: function (path, key, callback, demo) {
      if (demo) {
        return (
          async () => {
            const response = {status: 200};
            return await callback(response, null)
          }
        )();
      }
      let config = {
        headers: {
          'Content-Type': 'application/json',
          'x-access-key': key,
        }
      };
      return axios.delete(API_URL + API_PREFIX + path, config)
          .then(function (response) {
              log('axios.delete response: ' + response);
              callback(response, null);
          }).catch(error => callback(null, parse_houston_error(error)));
    }
};
