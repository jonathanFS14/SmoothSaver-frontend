import { API_URL } from "../../../settings.js"
const URL = API_URL + "/salling"
import {sanitizeStringWithTableRows, makeOptionsToken, handleHttpErrors} from "../../../utils.js"


document.getElementById("getAllStoresByZip").addEventListener("click", initGetAllStoresByZip)

async function initGetAllStoresByZip() {
    const zip = document.getElementById("zip").value;
    const options = makeOptionsToken("GET", null, false);
    const stores = await fetch(URL + "/" + zip, options).then(res => res.json())

    const tableRows = stores.map(store => 
        `<tr>
            <td>${store.store.address.street}</td>
            <td>${store.store.brand}</td>
        </tr>`
    )
    const tableRowsAsStr = tableRows.join("")
    document.getElementById("tbl-body").innerHTML = sanitizeStringWithTableRows(tableRowsAsStr);
}

