import { API_URL } from "/settings.js"
import {sanitizeStringWithTableRows, makeOptionsToken, handleHttpErrors} from "/utils.js"

const URL = API_URL + "/salling"

document.getElementById("zip-form").addEventListener("submit", function (event) {
    event.preventDefault();
    initGetAllStoresByZip();
});

function getStoreImage(storeName) {
  if(storeName.includes("Netto")) {
    return "/netto-logo.png";
  }
  else if(storeName.includes("føtex")){
    return "/foetex-logo.png";
  }
  else if(storeName.includes("Bilka")){
    return "/bilka-logo.png";
    }
  else return "default-logo.png";
}

async function initGetAllStoresByZip() {
  document.getElementById("error").innerHTML = "";
  document.getElementById("cards-grid").innerHTML = "";
  const zip = document.getElementById("zip").value;
  const spinner = document.getElementById('spinner');
  try {
    spinner.style.display = "block";
    const response = await fetch(URL + "/zip/" + zip);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const json = await response.json();
    if (json.length === 0) {
      document.getElementById("error").innerHTML = "Ingen butikker fundet, indtast et andet postnummer";
      }
    const tableRows = json.map(storeData => 
      `
      <div class="card" style="width: 18rem;">
      <img class="card-img-top" src="${getStoreImage(storeData.store.name)}" alt="">
      <div class="card-body">
        <h5 class="card-title">${storeData.store.name}</h5>
        <p class="card-text">${storeData.store.address.street}</p>
        <p class="card-text">åbningstid: ${storeData.store.hours[0].open}</p>
        <p class="card-text">butikken lukker: ${storeData.store.hours[0].close}</p>
        <a href="#" class="btn btn-primary">Gå til butikken</a>
      </div>
    </div>
      `
    );
    const tableRowsAsStr = tableRows.join("");
    document.getElementById("cards-grid").innerHTML = tableRowsAsStr;
  } catch (error) {
    document.getElementById("error").innerHTML = error;
    console.error('Could not fetch the data: ', error);
  }finally {
    spinner.style.display = "none";
  }
}




