import { API_URL } from "../../settings.js"
import {sanitizeStringWithTableRows, makeOptionsToken, handleHttpErrors} from "../../utils.js"

const URL = API_URL + "/salling"



export function initFindSales(match) {
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
}

function getStoreImage(storeName) {
  if(storeName.includes("Netto")) {
    return "../../images/netto-logo.png";
  }
  else if(storeName.includes("føtex")){
    return "../../images/foetex-logo.png";
  }
  else if(storeName.includes("Bilka")){
    return "../../images/bilka-logo.png";
    }
  else return "../../images/default-logo.png";
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

  // Sorting function
function sortTable(table, column, asc) {
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  // Sort the rows
  rows.sort((a, b) => {
    const aValue = a.cells[column].textContent;
    const bValue = b.cells[column].textContent;
    return asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });

  // Append sorted rows back to the table
  rows.forEach(row => tbody.appendChild(row));
}

// Initialize table
function initializeTable() {
  const table = document.createElement("table");
  table.id = "ingredients";
  table.innerHTML = `
    <thead>
      <tr>
        <th data-sort="product">Produkt <span class="sort-icon"></span></th>
        <th data-sort="originalPrice">Original Pris <span class="sort-icon"></span></th>
        <th data-sort="newPrice">Tilbuds Pris <span class="sort-icon"></span></th>
        <th data-sort="endTime">Udløbs Dato <span class="sort-icon"></span></th>
        <th>Billede</th>
        <th> Vælg </th>
      </tr>
    </thead>
    <tbody id="ingredients-body">
    </tbody>
  `;

  // Sort direction (initially ascending)
  let sortDirection = 1;

  const headers = table.querySelectorAll("th[data-sort]");
  const sortIcons = table.querySelectorAll(".sort-icon");

  headers.forEach((header, index) => {
    header.addEventListener("click", () => {
      // Remove sort icons from all headers
      sortIcons.forEach(icon => icon.textContent = "");
      
      const column = Array.from(headers).indexOf(header);
      sortDirection *= -1;
      sortTable(table, column, sortDirection === 1);
      
      // Set the appropriate sort icon
      if (sortDirection === 1) {
        sortIcons[index].textContent = "▲"; // Up arrow
      } else {
        sortIcons[index].textContent = "▼"; // Down arrow
      }
    });
  });
  document.getElementById("ingredients").innerHTML = "";
  document.getElementById("ingredients").appendChild(table);
}

async function initGetStoreById(storeId) {
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
            <td>${clearance.product.description}</td>
            <td>${clearance.offer.originalPrice}</td>
            <td>${clearance.offer.newPrice}</td>
            <td>${endTime}</td>
            <td><img style="height:150px;width:150px;" src="${clearance.product.image}" alt="billede" onerror="this.src='default-logo.png';"></td>
            <td><input type="checkbox" id="ingredient-input" value="${clearance.product.description}"></td>
          </tr>
      `;
    });
    
    // Initialize and populate the table
    initializeTable();
    const tbody = document.getElementById("ingredients-body");
    tbody.innerHTML = ingredients.join("");
    document.getElementById("fetchmadplan").style.display = "block";
  } catch (error) {
    document.getElementById("error").innerHTML = error;
    console.error('Could not fetch the data: ', error);
  }
}

  async function initGetResponseFromOpenAI() {
    const answer = document.getElementById("chat-answer");
    const spinner = document.getElementById('spinner2');
    try {
      spinner.style.display = "block";
      
      
    } catch (error) {
          document.getElementById("error").innerHTML = error;
    console.error('Could not fetch the data: ', error);
    } finally {
      spinner.style.display = "none";
    }


  }