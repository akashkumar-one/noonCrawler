"use strict";

var request = require("superagent");
const cheerio = require("cheerio");

let paths; //dictionary for all traversed path
let smallestWord;

/*
Here we are using reduce to find the smallest word
We are initializing  smallestWord with a very large string
*/
function getSmallestString(codes) {
  return codes.reduce(function (currentSmallestWord, code) {
    return currentSmallestWord < code ? currentSmallestWord : code;
  }, smallestWord);
}

/*
This function will fetch all the path(hash) available in link
The implementation is nearly identical to jQuery's
*/
function getPaths($) {
  return $(".link")
    .map(function (i, elem) {
      return $(this).attr("href");
    })
    .get();
}

/*
This function will fetch all the strings available on the page under h1 tag
The implementation is nearly identical to jQuery's
*/
function getCodes($) {
  return $(".codes h1")
    .map(function (i, elem) {
      return $(this).text();
    })
    .get();
}

/*
This function do GET request for any given URL + PATH
It returns the DOM string
*/
async function makeReq(url, result) {
  const response = await request.get(url);
  return response.text;
}

async function crawlPage(hash, rootUrl) {
  const response = await makeReq(`${rootUrl}${hash}`);
  const $ = cheerio.load(response); //This will create subset of core jQuery
  const codes = getCodes($);
  smallestWord = getSmallestString(codes);
  paths[hash] = true; // This will create a dictionary for all traversed path
  const childPaths = getPaths($);

  for (let i = 0; i < childPaths.length; i++) {
    if (!(paths[childPaths[i]])) {
      const wait = await crawlPage(childPaths[i], rootUrl);
    }
  }
}

module.exports = async function (url) {
  try {
    paths = {};
    smallestWord = "".padEnd("100", "largestStr"); //100 char long string to start
    const data = await crawlPage("", url);
    return smallestWord;
  } catch (error) {
    return error;
  }
};