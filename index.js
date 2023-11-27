
import "https://unpkg.com/navigo"  //Will create the global Navigo object used below
import "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js"
import { makeOptionsToken } from "./utils.js"

import {
  setActiveLink, renderHtml, loadHtml
} from "./utils.js"

import {initFindSales} from "./pages/FindSales/FindSales.js"
import { API_URL } from "./settings.js"

window.addEventListener("load", async () => {

   //If token existed, for example after a refresh, set UI accordingly
 const token = localStorage.getItem("token")
 toggleLoginStatus(token)
   
   if(localStorage.getItem('theme') === null ){
    setStoredTheme("dark")
   }
  const theme = localStorage.getItem('theme').valueOf()
  document.documentElement.setAttribute('data-bs-theme', theme)
  setStoredTheme(theme)
  document.getElementById("themeSwitch").checked = theme === "dark" ? true : false

  const templateFindSales = await loadHtml("./pages/FindSales/FindSales.html");
  const templateLandingPage = await loadHtml("./pages/landingPage/landingPage.html");

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await login();
    });
  } else {
    console.error("Login form not found!");
  }

  const router = new Navigo("/",{hash:true});
  window.router = router
  router
      .hooks({
        before(done, match) {
          setActiveLink("menu", match.url)
          done()
        }
      })
      .on({
        "/": () => {
          renderHtml(templateLandingPage, "content")
        },
        "/find-sales": (match) => {
          renderHtml(templateFindSales, "content")
          initFindSales(match)
        },
        "/logout": () => {
          renderHtml(templateLandingPage, "content")
          logout()
        },
        /*Profile
        "/profile": () => {
          renderHtml(templateProfile, "content")
          initProfile()
        }*/
      })
      .notFound(() => document.getElementById("content").innerHTML ="<h2> 404 - Page not found</h2>")
      .resolve()
});


window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
      + ' Column: ' + column + ' StackTrace: ' + errorObj);
}

function setStoredTheme(theme) {
  localStorage.setItem('theme', theme)
 } 

document.getElementById("themeSwitch").addEventListener("click", () => {
  const theme = document.documentElement.getAttribute('data-bs-theme')
  setStoredTheme(theme)
  const getStoredTheme =  localStorage.getItem('theme').valueOf()

  if(getStoredTheme === "light") {  
    document.documentElement.setAttribute('data-bs-theme', 'dark')
    setStoredTheme("dark")
  } else if (getStoredTheme === "dark") {
    document.documentElement.setAttribute('data-bs-theme', 'light')
     setStoredTheme("light")
  }
  
})

document.getElementById("shopping-cart").addEventListener("mouseover", () => {
 const logo = document.getElementById("cart-logo")
  logo.classList.add("fa-bounce")
})

document.getElementById("shopping-cart").addEventListener("mouseout", () => {
  const logo = document.getElementById("cart-logo")
  logo.classList.remove("fa-bounce")
})

//Login functionality

async function login() {
  try {
    const userNameInput = document.querySelector('input[name="username"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const loginFailDiv = document.getElementById("login-fail");

    if (!userNameInput || !passwordInput || !loginFailDiv) {
      console.error("Required elements not found!");
      return;
    }

    loginFailDiv.innerText = "";

    const loginRequest = {
      username: userNameInput.value,
      password: passwordInput.value,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginRequest),
    };

    const res = await fetch(API_URL+"/auth/login", options);
    if (!res.ok) {
      throw new Error("Login failed. Please check your credentials.");
    }

    const data = await res.json();
    storeLoginDetails(data);
    window.router.navigate("/");
  } catch (err) {
    const loginFailDiv = document.getElementById("login-fail");
    if (loginFailDiv) {
      loginFailDiv.innerText = err.message;
    } else {
      console.error("Login failure element not found!");
    }
  }
}

const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", login);

/**
* Store username, roles and token in localStorage, and update UI-status
* @param res - Response object with details provided by server for a succesful login
*/
async function storeLoginDetails(res) {
  localStorage.setItem("token", res.token)
  localStorage.setItem("user", res.username)
  localStorage.setItem("roles", res.roles)
  toggleLoginStatus(true)
}


async function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  localStorage.removeItem("roles")
  toggleLoginStatus(false)
  window.router.navigate("/")
}

async function toggleLoginStatus(loggedIn) {
  const loginContainer = document.getElementById("login-container");
  const logoutContainer = document.getElementById("logout-container");
  const profileContainer = document.getElementById("profile-container");
  
  if (loginContainer && logoutContainer && profileContainer) {
    loginContainer.style.display = loggedIn ? "none" : "block";
    logoutContainer.style.display = loggedIn ? "block" : "none";
    profileContainer.style.display = loggedIn ? "block" : "none";
    
    const adminListItems = document.querySelectorAll('.admin-only');
    const userRoutes = document.querySelector('.user-only');
    
    if (loggedIn && userRoutes) {
      let isAdmin = false;
      let isUser = false;
      
      if (localStorage.getItem('roles')) {
        isAdmin = localStorage.getItem('roles').includes('ADMIN');
        isUser = localStorage.getItem('roles').includes('USER');
      }
      
      for (let i = 0; i < adminListItems.length; i++) {
        adminListItems[i].style.display = isAdmin ? "block" : "none";
      }
  
      userRoutes.style.display = isUser ? 'block' : 'none';
    }
  } else {
    console.error("One or more container elements not found!");
  }
}