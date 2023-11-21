
import "https://unpkg.com/navigo"  //Will create the global Navigo object used below
import "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js"

import {
  setActiveLink, renderHtml, loadHtml
} from "./utils.js"

import {initFindSales} from "./pages/FindSales/FindSales.js"

window.addEventListener("load", async () => {

  const templateFindSales = await loadHtml("./pages/FindSales/FindSales.html");
  const templateLandingPage = await loadHtml("./pages/landingPage/landingPage.html");

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
        }
      })
      .notFound(() => document.getElementById("content").innerHTML ="<h2> 404 - Page not found</h2>")
      .resolve()
});


window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
      + ' Column: ' + column + ' StackTrace: ' + errorObj);
}


document.getElementById("themeSwitch").addEventListener("click", () => {
  const getStoredTheme =  localStorage.getItem('theme').valueOf()

  if(getStoredTheme === "light") {  
    document.documentElement.setAttribute('data-bs-theme', 'dark')
    setStoredTheme("dark")
  } else if (getStoredTheme === "dark") {
    document.documentElement.setAttribute('data-bs-theme', 'light')
     setStoredTheme("light")
  }

  function setStoredTheme(theme) {
   localStorage.setItem('theme', theme)
  } 



  
})