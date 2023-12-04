import { API_URL } from "../../settings.js"
import { makeOptionsToken, handleHttpErrors } from "../../utils.js"
import { logout } from "../../index.js"

const URLUser = `${API_URL}/user/profile`;
const deleteUserURL = `${API_URL}/user/`;

export async function initProfile() {
    const options = makeOptionsToken('GET', null, true);
    const roles = localStorage.getItem('roles').split(',');

    if (roles.includes('USER')) {
        try {
            const responseUser = await fetch(URLUser, options);
            if (!responseUser.ok) throw new Error("User Profile fetch failed");
            const userData = await responseUser.json();
            populateUserProfile(userData);

            displaySection('user-section');
            setupDeleteUserButton(userData.username);

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
}

function displaySection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

function setupDeleteUserButton(username) {
    const deleteUserBtn = document.getElementById('delete-user-btn');
    deleteUserBtn.addEventListener('click', async () => {
        const confirmDelete = confirm("Are you sure you want to delete your account?");
        if (confirmDelete) {
            const deleteOptions = makeOptionsToken('DELETE', null, true);
            try {
                const response = await fetch(`${deleteUserURL}${username}`, deleteOptions);
                if (!response.ok) throw new Error("Delete user request failed");
                alert("User deleted successfully");
                logout();
                window.location.href = '/'; 
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    });
}


