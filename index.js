import "https://unpkg.com/navigo"  //Will create the global Navigo object used below
import "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js"

import {
  setActiveLink, renderHtml, loadHtml
} from "./utils.js"

import {initFindSales} from "./pages/FindSales/FindSales.js"

window.addEventListener("load", async () => {

  const templateFindSales = await loadHtml("./pages/FindSales/FindSales.html")

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
        "/": () => document.getElementById("content").innerHTML=`
            <h2>Home</h2>
            <p>Use the menu to navigate</p>     
           `,
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


//test