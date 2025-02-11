// Imports:
import templates from "./templates.js";
import map from "./map.js";
import {saveToLocalStorage, validatePhoneNumber} from "./utils.js";

function getLoggedInUser() {
    return JSON.parse(localStorage.getItem("user_id"));
}

function redirectIfNotLoggedIn() {
    if (!getLoggedInUser()) {
        alert("עליך להתחבר כדי לגשת לעמוד זה.");
        window.location.href = "/login";  // הפניה לעמוד התחברות
    }
}

// בודק אם המשתמש לא מחובר ומבצע הפניה בהתאם
if (window.location.pathname === "/book-training" || window.location.pathname === "/my-training") {
    redirectIfNotLoggedIn();
}

async function fetchTrainingData() {
    try {
        const response = await fetch("/api/trainings");
        return await response.json();
    } catch (error) {
        console.error("Error fetching training data:", error);
        return [];
    }
}

async function fetchUserTrainingData() {
    try {
        const userId = getLoggedInUser();
        const response = await fetch("/api/trainings/" + userId);
        return await response.json();
    } catch (error) {
        console.error("Error fetching training data:", error);
        return [];
    }
}

async function addTraining(trainingId) {
    const userId = getLoggedInUser();
    const  response = await fetch("/api/trainings/" + userId, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            training_id: trainingId
        })
    })

    return await response.json();
}

async function cancelTraining(trainingId) {
    const userId = getLoggedInUser();
    const  response = await fetch("/api/trainings/" + userId, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            training_id: trainingId
        })
    })

    return await response.json();
}

async function signUp(user) {
    await fetch("/api/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user)
    })
}

async function login(credentials) {
    const  response = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials)
    })

    if (response.status <200 || response.status >= 300) {
        throw new Error("Login failed")
    }

    return await response.json();
}

document.querySelector("#logout-button")?.addEventListener("click", function() {
    localStorage.removeItem("user_id");  // מוחק את המשתמש מהזיכרון המקומי
    window.location.href = "/logout";  // מפנה לשרת שינקה את ה-Session
});


window.onload = async function () {

// Query Selectors:
    const head = document.querySelector(".head");
    const myTrainingsList = document.querySelector("#my-trainings");
    const bookTrainingForm = document.querySelector("#book-training");
    const bookTrainingFormList = document.querySelector("#book-training-list");
    const phoneNumInput = document.querySelector(".form-number-input");
    const loginForm = document.querySelector("#login");
    const signupForm = document.querySelector("#signup");
    const contactForm = document.querySelector("#contact");

// Init function to retrive data from local storage:
    const init = function () {
        if (bookTrainingFormList) {
            insertTrainingOptions("func");
        }
    };

// Insert header to page:
    if (head) head.innerHTML = templates.header;

// Clean phone number input:
    if (phoneNumInput) phoneNumInput.addEventListener("input", validatePhoneNumber);

// Insert user trainings to My-trainings page:
    if (myTrainingsList) {
        // Retrive data from local storage:
        init();

        const trainings = await fetchUserTrainingData();

        // Create markup:
        let htmlMarkup;
        if (trainings.length < 1)
            htmlMarkup = "<p>לא נמצאה היסטורית אימונים במערכת</p>";
        else
            htmlMarkup = trainings
                .map((training) =>
                    templates.trainingItem
                        .replaceAll("%TYPE%", map.trainingType[training.type])
                        .replaceAll("%DATE%", training.date)
                        .replaceAll("%HOUR%", training.hour)
                )
                .join("\n");

        // Insert markup to page:
        myTrainingsList.innerHTML = htmlMarkup;
    }

    /**
     * Insert training options to book-training page:
     * @param {Event} e
     */
    async function insertTrainingOptions(e) {
        // Retrive data from form:
        let type = {value: "all"};
        let day = {value: "all"};

        if (e !== "func") {
            type = bookTrainingForm.querySelector("[name=type]");
            day = bookTrainingForm.querySelector("[name=day]");
        }
        // Veriables:
        let htmlMarkup = ["<p>לא נמצאו תוצאות לחיפוש הזה</p>"];

        // Filter by day:
        const practices = await fetchTrainingData()

        let trainings = practices;
        if (day.value !== "all")
            trainings = practices.filter((practice) => practice.day == day.value);

        // Filter by type:
        if (
            Object.keys(map.trainingType).includes(type.value) &&
            type.value !== "all"
        )
            trainings = trainings.filter((practice) => practice.type === type.value);

        const userTrainings = await fetchUserTrainingData();

        // Create markup:
        htmlMarkup = trainings.map((training) => {
            let template = templates.trainingOption;
            if (userTrainings.some(userTraining => userTraining._id === training._id))
                template = templates.trainingOptionRegistered;

            // Return template after replacing placeholders:
            return template
                .replaceAll("%ID%", training._id)
                .replaceAll("%HOUR%", training.hour)
                .replaceAll("%TYPE%", map.trainingType[training.type])
                .replaceAll("%INSTRUCTOR%", training.instructor)
                .replaceAll("%CAPACITY%", training.capacity)
                .replaceAll("%AVAILABLE%", training.available)
                .replaceAll("%DAY%", map.days[training.day]);
        });

        // Insert markup to page:
        bookTrainingFormList.innerHTML = htmlMarkup.join("\n");
    }

    /**
     * Book or cancel training function for book-training page.
     * @param {Event} e
     */
    const bookCancelFunction = function (e) {
        // Check if the target is a book/cancel button:
        const opperation = e.target.name;
        if (!["book", "cancel"].includes(opperation)) return;

        // Book training and add to db:
        if (opperation === "book") {
            const id = e.target.dataset.id;
            addTraining(id);
            alert("ההזמנת בוצעה בהצלחה, נתראה באימון!");
        }
        // Cancel training and remove from db:
        if (opperation === "cancel") {
            if (confirm("האם אתה בטוח שתרצה לבטל את ההזמנה?")) {
                const id = e.target.dataset.id;
                cancelTraining(id);
                alert("ההזמנה בוטלה בהצלחה");
            }
        }

        // Update the training options page:
        insertTrainingOptions();
    };

// Book training page:
    if (bookTrainingForm) {
        // Retrive data from local storage:
        init();

        // Event listeners:
        bookTrainingForm.addEventListener("change", insertTrainingOptions);
        bookTrainingForm.addEventListener("click", bookCancelFunction);
    }

// Forms reactions:
    /**
     * Alert the user with a message and redirect to a URL.
     * @param {Event} e - The event object to prevent form defaults.
     * @param {string} msg - The message to display in the alert.
     * @param {string} url - The URL to redirect to after the alert.
     * @param {number} time - tims in seconeds to delay the redirection.
     */
    const alertAndRedirect = function (e, msg, url, time = 1.5) {
        e.preventDefault();
        alert(msg);
        setTimeout(() => {
            window.location.href = url;
        }, time * 1000);
    };
// Login form actions:
    if (loginForm)
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            try {
                const loginFormData = new FormData(loginForm);
                const response = await login(Object.fromEntries(loginFormData));
                saveToLocalStorage("user_id", response.id)
                alertAndRedirect(
                    e,
                    "ההתחברות בוצעה בהצלחה. הנך מועבר לדף הבית",
                    "/my-training"
                )
            } catch {
                alert("שגיאה בהתחברות, אחד הפרטים לא נכונים");
            }
        });
// Signup form actions:
    if (signupForm)
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            try {
                const userFormData = new FormData(signupForm);
                await signUp(Object.fromEntries(userFormData));
                alertAndRedirect(
                    e,
                    "ההרשמה בוצעה בהצלחה. הנך מועבר לדף התחברות",
                    "/login"
                );
            } catch {
                alert("שגיאה בהרשמה, אנא נסה שנית מאוחר יותר");
            }
        });
// Contact form actions:
    if (contactForm)
        contactForm.addEventListener("submit", (e) =>
            alertAndRedirect(
                e,
                "הטופס נשלח בהצלחה, הנך מועבר לדף הבית",
                "/"
            )
        );
}
