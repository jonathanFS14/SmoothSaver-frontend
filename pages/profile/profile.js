import { API_URL} from "../../settings.js"
import { makeOptions, handleHttpErrors, makeOptionsToken } from "../../utils.js"
const URLUser = `${API_URL}/user/profile`

export async function initProfile() {

    const options = makeOptionsToken('GET', null, true);
    const roles = localStorage.getItem('roles').split(',');

    if (roles.includes('USER')) {
        try {
            const responseUser = await fetch(URLUser, options);
            if (!responseUser.ok) throw new Error("User Profile fetch failed");
            const userData = await responseUser.json();
            populateUserProfile(userData);
            console.log("User data:", userData);

            displaySection('user-section');

        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    }
}


function populateUserProfile(data) {
    document.getElementById('user-profile-username').textContent = data.username;
    document.getElementById('user-profile-email').textContent = data.email;
    document.getElementById('user-profile-firstName').textContent = data.firstName;
    document.getElementById('user-profile-lastName').textContent = data.lastName;
    document.getElementById('user-profile-phoneNumber').textContent = data.phoneNumber;
    document.getElementById('user-profile-address').textContent = data.address;
    document.getElementById('user-profile-credit').textContent = data.credit;
}

function displaySection(sectionId) {
    ['user-section'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}
