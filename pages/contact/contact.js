export function initContact() {
    const form = document.getElementById("kontaktForm");
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const problem = document.getElementById("problem").value;
        const besked = document.getElementById("besked").value;
        const subject = encodeURIComponent(problem);
        const body = encodeURIComponent(besked);

        window.location.href = 'mailto:niko081b@stud.kea.dk?subject=' + subject + '&body=' + body;
    });
}