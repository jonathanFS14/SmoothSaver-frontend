import { API_URL } from "../../settings.js"
import {sanitizeStringWithTableRows, makeOptionsToken, handleHttpErrors} from "../../utils.js"

const URL = API_URL + "/salling"
let pageSize = 10;

let valgteVarer = []
let shoppingCart = {
  items: [],
  totalQuantity: 0
};

export function initFindSales(match) {
    document.getElementById("zip-form").addEventListener("submit", function (event) {
        event.preventDefault();
        initGetAllStoresByZip();
    });
    document.getElementById("cards-grid").onclick = (evt) => {
      evt.preventDefault();
      let storeId = evt.target.id;
      if(storeId === "cards-grid") {
        return;
      }
      initGetStoreById(storeId);
    }
    document.getElementById("open-ai-form").addEventListener("submit", function (evt) {
      evt.preventDefault();
      initGetResponseFromOpenAI();
    });
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
        shoppingCart = JSON.parse(savedCart);
        updateCartUI();
    }
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
  let zip = document.getElementById("zip").value;
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

async function initGetStoreById(storeId, page = 0) {
  try {
    const response = await fetch(`${URL}/id/${storeId}?page=${page}&size=${pageSize}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const json = await response.json();
    const ingredients = json.content.map(content => {
      const endTime = new Date(content.offer.endTime).toLocaleTimeString([], { day: '2-digit', month: '2-digit', year: "2-digit", hour: '2-digit', minute: '2-digit' });
      return`
          <tr>
            <td>${content.product.description}</td>
            <td>${content.offer.originalPrice}</td>
            <td>${content.offer.newPrice}</td>
            <td>${endTime}</td>
            <td><img style="height:150px;width:150px;" src="${content.product.image}" alt="billede" onerror="this.src='../../images/default-logo.png';"></td>
            <td><input type="checkbox" id="ingredient-input" value="${content.product.description}" onchange="handleCheckboxChange(event, '${content.product.description}')"></td>
            <td>
                <button type="button" class="add-to-cart-btn" data-description="${content.product.description}" data-quantity="1" data-store-id="${storeId}">Add to Cart</button>
            </td>
            </tr>
      `;
    });
    // Initialize and populate the table
    initializeTable();
    const tbody = document.getElementById("ingredients-body");
    tbody.innerHTML = ingredients.join("");
    attachAddToCartEventListeners();
    displayPagination(json.totalPages, page);
    setupPaginationEventListeners(storeId);
    document.getElementById("fetchmadplan").style.display = "block";
  } catch (error) {
    document.getElementById("error").innerHTML = error;
    console.error('Could not fetch the data: ', error);
  }
}

function displayPagination(totalPages, currentPage) {
  let paginationHtml = '';
  if (currentPage > 0) { // Previous Page
    paginationHtml += `<li class="page-item"><a class="page-link" data-page="${currentPage - 1}" href="#">Previous</a></li>`
  }
  // Display page numbers
  let startPage = Math.max(0, currentPage - 2);
  let endPage = Math.min(totalPages - 1, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      paginationHtml += `<li class="page-item active"><a class="page-link" href="#">${i + 1}</a></li>`
    } else {
      paginationHtml += `<li class="page-item"><a class="page-link" data-page="${i}" href="#">${i + 1}</a></li>`
    }
  }
  if (currentPage < totalPages - 1) { // Next Page
    paginationHtml += `<li class="page-item"><a class="page-link" data-page="${currentPage + 1}" href="#">Next</a></li>`
  }
  document.getElementById("pagination").innerHTML = paginationHtml;
}

function setupPaginationEventListeners(storeId) {
  const paginationElement = document.getElementById('pagination');
  paginationElement.removeEventListener('click', handlePaginationClick);

  function handlePaginationClick(event) {
      event.preventDefault();
      if (event.target.tagName === 'A') {
          const newPage = parseInt(event.target.getAttribute('data-page'));
          initGetStoreById(storeId, newPage); 
      }
  }
  paginationElement.addEventListener('click', handlePaginationClick);
}


async function initGetResponseFromOpenAI() {
  const answer = document.getElementById("chat-answer");
  const spinner = document.getElementById('spinner2');
  try {
    spinner.style.display = "block";
    let valgteVarerString = String(valgteVarer);
    let brugerValg = document.getElementById("user-input").value;
    //hakket-oksekød,tomater,mælk,bananer,mel,fløde,kartofler, to forskellige korte forslag 
    const aboutParam = encodeURIComponent(valgteVarerString + ", " + brugerValg + ", to korte forslag" );
    console.log(aboutParam);
    const apiUrl = `${API_URL}/openai/limited?about=${aboutParam}`;
    const response = await fetch(apiUrl).then(handleHttpErrors)
    const chatResponse = response.answer;
    answer.innerHTML = chatResponse;
    updateChatAnswer(response);
    brugerValg = "";
    valgteVarerString = "";
    valgteVarer = [];
  } catch (error) {
    document.getElementById("error").innerHTML = error;
    console.error('Could not fetch the data: ', error);
  } finally {
    spinner.style.display = "none";
  }
}

function updateChatAnswer(content) {
  const chatAnswerElement = document.getElementById('chat-answer');
  const contentString = String(content);
  if (contentString.trim().length > 0) {
     //chatAnswerElement.textContent = content;
     chatAnswerElement.classList.remove('-hidden');
     chatAnswerElement.style.display = 'block'; // Ensure the element is shown
  } else {
     chatAnswerElement.style.display = 'none'; // Hide the element
     chatAnswerElement.classList.add('-hidden');
  }
}

window.handleCheckboxChange = function(event, description) {
    if (event.target.checked) {
        // Add the description to the valgteVarer array if checked
        valgteVarer.push(description);
    } else {
        // Remove the description from the valgteVarer array if unchecked
        const index = valgteVarer.indexOf(description);
        if (index > -1) {
            valgteVarer.splice(index, 1);
        }
    }
}

// async function fetchCartContents(cartId) {
//   try {
//     const response = await fetch(`${URL}/cart/${cartId}`);
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     const cartItemsFromServer = await response.json();
//     shoppingCart.items = cartItemsFromServer;
//     shoppingCart.totalQuantity = cartItemsFromServer.reduce((total, item) => total + item.quantity, 0);
//     updateCartUI();
//     viewCartContents();
//   } catch (error) {
//     console.error("Error fetching cart contents:", error);
//   }
// }

// function updateShoppingCartWithFetchedItems(cartItems) {
//   shoppingCart.items = cartItems;
//   shoppingCart.totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
//   updateCartUI();
//   viewCartContents(); // If you want to display the contents immediately
// }

async function addToCart(itemDescription, quantity, storeId) {
  console.log("Adding to cart:", itemDescription, quantity, storeId);
  const data = {
      itemDescription: itemDescription,
      quantity: quantity,
      storeId: storeId
  };

  const options = makeOptionsToken("POST", data); // Implement makeOptionsToken for authentication

  try {
      const response = await fetch(`${URL}/addToCart`, options);
      console.log("Response from addToCart API:", await response.json());
      handleHttpErrors(response);
      updateShoppingCart(itemDescription, quantity, storeId);
  } catch (error) {
      console.error("Error adding item to cart:", error);
  }
}

function openShoppingCartModal() {
  viewCartContents();
  document.getElementById('shopping-cart-modal').style.display = 'block';
}

function closeShoppingCartModal() {
  document.getElementById('shopping-cart-modal').style.display = 'none';
}

function updateShoppingCart(itemDescription, quantity, storeId) {
  // Add item to the cart or update quantity if it already exists
  let existingItem = shoppingCart.items.find(item => item.description === itemDescription && item.storeId === storeId);
  if (existingItem) {
      existingItem.quantity += quantity;
  } else {
      shoppingCart.items.push({ description: itemDescription, quantity: quantity, storeId: storeId });
  }
  shoppingCart.totalQuantity += quantity;
  localStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
  updateCartUI();
}

function updateCartUI() {
  const cartItemCount = document.getElementById('cart-item-count');
  if (shoppingCart.totalQuantity > 0) {
      cartItemCount.textContent = shoppingCart.totalQuantity;
      cartItemCount.style.display = 'block'; // Show the count badge
  } else {
      cartItemCount.style.display = 'none'; // Hide the badge when count is 0
  }
}

async function removeFromCart(cartId, itemDescription, quantityToRemove) {
  const data = { itemDescription, quantityToRemove };

  const options = makeOptionsToken("DELETE", data); // Use your existing method for generating request options

  try {
      const response = await fetch(`${API_URL}/cart/${cartId}`, options);
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log("Item removed from cart");
  } catch (error) {
      console.error("Error removing item from cart:", error);
  }
}

function viewCartContents() {
  let cartContentsHtml = shoppingCart.items.map(item => `
      <div class="cart-item">
          <span>${item.description}</span>
          <span>Quantity: ${item.quantity}</span>
          <span>Store: ${item.storeName}</span>
          <button onclick="removeFromCart('${item.description}', ${item.quantity})">Remove</button>
      </div>
  `).join('');
  document.getElementById('shopping-cart-items').innerHTML = cartContentsHtml;
}

document.getElementById('shopping-cart').addEventListener('click', function(event) {
  event.preventDefault();
  //fetchCartContents();
  openShoppingCartModal();
});

document.getElementById('close-shopping-cart-modal').addEventListener('click', closeShoppingCartModal);

function attachAddToCartEventListeners() {
  const addToCartButtons = document.getElementsByClassName("add-to-cart-btn");
  console.log("Attaching event listeners to", addToCartButtons.length, "buttons");
  for (const btn of addToCartButtons) {
      btn.addEventListener("click", function(evt) {
          evt.stopPropagation();
          const itemDescription = evt.target.getAttribute("data-description");
          const quantity = parseInt(evt.target.getAttribute("data-quantity"), 10);
          const storeId = evt.target.getAttribute("data-store-id");
          addToCart(itemDescription, quantity, storeId);
      });
  }
}
