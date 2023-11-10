import { API_URL } from "/settings.js"
import {sanitizeStringWithTableRows, makeOptionsToken, handleHttpErrors} from "/utils.js"

const URL = API_URL + "/salling"

document.getElementById("zip-form").addEventListener("submit", function (event) {
    event.preventDefault();
    initGetAllStoresByZip();
});

document.getElementById("cards-grid").onclick = (evt) => {
  evt.preventDefault();
  const storeId = evt.target.id;
  if(storeId === "cards-grid") {
    return;
  }
  initGetStoreById(storeId);
}


document.getElementById("open-ai-form").addEventListener("submit", function (evt) {
  evt.preventDefault();
  initGetResponseFromOpenAI();
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
    const cards = json.map(storeData => {
      const openTime = new Date(storeData.store.hours[0].open + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const closeTime = new Date(storeData.store.hours[0].close + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `
        <div id="${storeData.store.id}" class="card" style="width: 18rem;">
        <img id="${storeData.store.id}" class="card-img-top" width="40px" length="40px" src="${getStoreImage(storeData.store.name)}" alt="">
        <div id="${storeData.store.id}" class="card-body">
        <h5 id="${storeData.store.id}" class="card-title">${storeData.store.name}</h5>
        <p id="${storeData.store.id}" class="card-text">${storeData.store.address.street}</p>
        <p id="${storeData.store.id}" class="card-text">åbningstid: ${openTime}</p>
        <p id="${storeData.store.id}" class="card-text">butikken lukker: ${closeTime}</p>
      </div>
    </div>
      `
  });
    const cardsAsStr = cards.join("");
    document.getElementById("cards-grid").innerHTML = cardsAsStr;
  } catch (error) {
    document.getElementById("error").innerHTML = error;
    console.error('Could not fetch the data: ', error);
  }finally {
    spinner.style.display = "none";
  }

}

  async function  initGetStoreById(storeId) {
    try {
      const response = await fetch(URL + "/id/" + storeId);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const json = await response.json();
      const ingredients = json.clearances.map(clearance => {
      const endTime = new Date(clearance.offer.endTime).toLocaleTimeString([], { day: '2-digit', month: '2-digit', year: "2-digit", hour: '2-digit', minute: '2-digit' });
        return`
            <tr>
            <td> produkt: ${clearance.product.description}</td>
            <td> original pris: ${clearance.offer.originalPrice}</td>
            <td> tilbuds pris: ${clearance.offer.newPrice}</td>
            <td> udløbs dato: ${endTime}</td>
            <td> <img  style="height:150px;width:150px;" src="${clearance.product.image}" alt="billede"> </td>
            <td>  <input type="checkbox" id="ingredient-input" value="${clearance.product.description}"></td>
            </tr>
            `
      }); 
     const ingredientssAsStr = ingredients.join("");
     document.getElementById("ingredients").innerHTML = ingredientssAsStr;
     document.getElementById("fetchmadplan").style.display = "block";
    } catch (error) {
      document.getElementById("error").innerHTML = error;
      console.error('Could not fetch the data: ', error);
    }finally {
     
    }
}

  async function initGetResponseFromOpenAI(){
    const answer = document.getElementById("chat-answer");
    try {
      
    } catch (error) {
      
    } finally {

    }


  }



