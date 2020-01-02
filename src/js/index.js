import "bootstrap";

import "../scss/index.scss";

import { data } from "./data.js";

const wiki = $("#wiki");

const URL = "https://en.wikipedia.org/w/api.php";

const HISTORY = [];

var PARAMS = {
  action: "parse",
  format: "json"
};

function createUrl(page) {
  let url = URL + "?origin=*";
  let params = {
    ...PARAMS,
    page
  };
  Object.keys(params).forEach(function(key) {
    url += "&" + key + "=" + params[key];
  });
  return url;
}

function getWikiPage(page) {
  setLoading();
  fetch(createUrl(page))
    .then(function(response) {
      return response.json();
    })
    .then(function(response) {
      wiki.html(response.parse.text["*"]);
      bindWikiLinks();
    })
    .catch(function(error) {
      console.log(error);
    });
}

function bindWikiLinks() {
  let count = 0;
  $("#wiki a").each((_, link) => {
    if (link && link.href && link.href.includes("/wiki/")) {
      const href = link.href.split("/wiki/")[1];
      $(link).on("click", function(e) {
        e.preventDefault();
        onWikiLinkClick(href);
      });
    } else {
      $(link).on("click", function(e) {
        e.preventDefault();
      });
    }
  });
}

function onWikiLinkClick(link) {
  const pieces = link.split("/");
  const page = pieces[pieces.length - 1];
  HISTORY.push(page);
  localStorage.setItem("history", HISTORY);
  if (checkWinningCondition(page)) {
    localStorage.setItem("won", "1");
    showWinningPage();
  } else {
    getWikiPage(page);
  }
}

function showWinningPage() {
  window.location.href = "history.html";
}

function checkWinningCondition(page) {
  const winner = page === localStorage.getItem("finish");
  if (winner) {
    console.log("winner");
  } else {
    console.log("keep trying");
  }
  return winner;
}

function setLoading() {
  wiki.html('<div class="center" >Loading...</div>');
}

function onStart() {
  localStorage.setItem("history", "");
  const selectedValue = $("#numberPicker")[0].value;
  const selectedData = data[selectedValue - 1];
  localStorage.setItem("finish", selectedData.finish);
  getWikiPage(createUrl(selectedData.start));
  console.log(data[selectedValue]);
}

function onStop() {
  localStorage.setItem("history", "");
  window.location.reload();
}

function cleanPageTitle(title) {
  return title.split("_").join(" ");
}

$("#start").click(event => {
  event.preventDefault();
  onStart();
});

$("#stop").click(event => {
  onStop();
});

$("#numberPicker").change(function() {
  const val = $(this).val() - 1;
  $("#from").html(cleanPageTitle(data[val].start));
  $("#to").html(cleanPageTitle(data[val].finish));
});
$("#numberPicker").trigger("change");

if (window.location.href.includes("history")) {
  const wonDiv = $("#won");
  if (localStorage.getItem("won") === "1") {
    wonDiv.show();
    localStorage.setItem("won", "0");
  }
  const historyDiv = $("#history");
  const historyItems = localStorage.getItem("history").split(",");
  historyItems.forEach(item => {
    const currentContent = historyDiv.html();
    historyDiv.html(`${currentContent}<li>${cleanPageTitle(item)}</li>`);
  });
}
