import { API_URL } from "/settings.js"
import {sanitizeStringWithTableRows, makeOptionsToken, handleHttpErrors} from "/utils.js"

const URL = API_URL + "/salling"

document.getElementById("zip-form").addEventListener("submit", function (event) {
    event.preventDefault();
    initGetAllStoresByZip();
});

async function initGetAllStoresByZip() {
  document.getElementById("error").innerHTML = "";
  document.getElementById("tbl-body").innerHTML = "";
  const zip = document.getElementById("zip").value;
  try {
    const response = await fetch(URL + "/" + zip);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    const tableRows = json.map(storeData => 
      `<tr>
          <td>${storeData.store.name}</td>
          <td>${storeData.store.address.street}</td>
          <td>${storeData.store.brand}</td>
      </tr>`
    );
    const tableRowsAsStr = tableRows.join("");
    document.getElementById("tbl-body").innerHTML = tableRowsAsStr;
  } catch (error) {
    console.error('Could not fetch the data: ', error);
    document.getElementById("error").innerHTML = error;
  }
}



