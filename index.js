import { API_URL } from "/settings.js"
import {sanitizeStringWithTableRows, makeOptionsToken, handleHttpErrors} from "/utils.js"

const URL = API_URL + "/salling"

document.getElementById("zip-form").addEventListener("submit", function (event) {
    event.preventDefault();
    initGetAllStoresByZip1();
});

async function initGetAllStoresByZip() {
    const zip = document.getElementById("zip").value;
    const options = makeOptionsToken("GET", null, false);
    try {
        console.log(URL + "/" + zip)

        const stores = await fetch(URL + "/" + zip, options) 
        .then(handleHttpErrors)
        .then(res => res.json())
        .catch(err => document.getElementById("error").innerText = err)
    const tableRows = stores.map(store => 
        `<tr>
            <td>${store.store.address.street}</td>
            <td>${store.store.brand}</td>
        </tr>`
    );

    const tableRowsAsStr = tableRows.join("");
    document.getElementById("tbl-body").innerHTML = sanitizeStringWithTableRows(tableRowsAsStr);
    } catch (err) {
       console.log(err);
    }
}

async function initGetAllStoresByZip1() {
    const zip = document.getElementById("zip").value;
    try {
        const response = await fetch(URL + "/" + zip);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        // Now that you have your data, you can process it
        processJSONData(json);
      } catch (error) {
        console.error('Could not fetch the data: ', error);
      }


}

function processJSONData(json) {
    // Assuming json is the JSON object you provided in your question
    json.forEach(storeData => {
      console.log('Store Name:', storeData.store.name);
      console.log('Store Address:', storeData.store.address);
      console.log('Clearance Offers:');
      
      storeData.clearances.forEach(clearance => {
        console.log(`- Product: ${clearance.product.description}`);
        console.log(`  EAN: ${clearance.product.ean}`);
        console.log(`  New Price: ${clearance.offer.newPrice} ${clearance.offer.currency}`);
        console.log(`  Discount: ${clearance.offer.percentDiscount}%`);
        // ... You can continue to log or process data as needed
      });
    });
  }

