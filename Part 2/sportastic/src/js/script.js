// Imports:
import templates from "./templates.js";
import db from "./db.js";
import map from "./map.js";
import { saveToLocalStorage, validatePhoneNumber } from "./utils.js";

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
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) db.user = user;
  if (bookTrainingFormList) insertTrainingOptions("func");
};

// Insert header to page:
if (head) head.innerHTML = templates.header;

// Clean phone number input:
if (phoneNumInput) phoneNumInput.addEventListener("input", validatePhoneNumber);

// Insert user trainings to My-trainings page:
if (myTrainingsList) {
  // Retrive data from local storage:
  init();

  // Filter data:
  const trainings = db.practices.filter((practice) =>
    db.user.trainings.includes(practice.id)
  );

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
function insertTrainingOptions(e) {
  // Retrive data from form:
  let type = { value: "all" };
  let day = { value: "all" };

  if (e !== "func") {
    type = bookTrainingForm.querySelector("[name=type]");
    day = bookTrainingForm.querySelector("[name=day]");
  }
  // Veriables:
  let htmlMarkup = ["<p>לא נמצאו תוצאות לחיפוש הזה</p>"];

  // Filter by day:
  let tarinings = db.practices;
  if (day.value !== "all")
    tarinings = db.practices.filter((practice) => practice.day == day.value);

  // Filter by type:
  if (
    Object.keys(map.trainingType).includes(type.value) &&
    type.value !== "all"
  )
    tarinings = tarinings.filter((practice) => practice.type === type.value);

  // Create markup:
  htmlMarkup = tarinings.map((training) => {
    let template = templates.trainingOption;
    if (db.user.trainings.includes(training.id))
      template = templates.trainingOptionRegistered;

    // Return template after replacing placeholders:
    return template
      .replaceAll("%ID%", training.id)
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
    db.user.trainings.push(+id);
    alert("ההזמנת בוצעה בהצלחה, נתראה באימון!");
  }
  // Cancel training and remove from db:
  if (opperation === "cancel") {
    if (confirm("האם אתה בטוח שתרצה לבטל את ההזמנה?")) {
      const id = e.target.dataset.id;
      db.user.trainings = db.user.trainings.filter(
        (training) => training != id
      );
      alert("ההזמנה בוטלה בהצלחה");
    }
  }

  // Save data to local storage:
  saveToLocalStorage("user", db.user);

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
  loginForm.addEventListener("submit", (e) =>
    alertAndRedirect(
      e,
      "ההתחברות בוצעה בהצלחה. הנך מועבר לדף הבית",
      "../../index.html"
    )
  );
// Signup form actions:
if (signupForm)
  signupForm.addEventListener("submit", (e) =>
    alertAndRedirect(
      e,
      "ההרשמה בוצעה בהצלחה. הנך מועבר לדף התחברות",
      "./login.html"
    )
  );
// Contact form actions:
if (contactForm)
  contactForm.addEventListener("submit", (e) =>
    alertAndRedirect(
      e,
      "הטופס נשלח בהצלחה, הנך מועבר לדף הבית",
      "../../index.html"
    )
  );
