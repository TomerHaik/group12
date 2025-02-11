export default {
    header: `
<nav>
  <ul>
    <li><a href="${window.flaskUrls.home}">דף הבית</a></li>
    <li><a href="${window.flaskUrls.myTraining}">אזור אישי</a></li>
    <li><a href="${window.flaskUrls.bookTraining}">קביעת אימון</a></li>
    <li><a href="${window.flaskUrls.contact}">יצירת קשר</a></li>
    <li><a href="${window.flaskUrls.about}">קצת עלינו</a></li>
  </ul>
</nav>`,
    trainingItem: `
<div class="training-item">
  <h4>כניסת מנוי</h4>
  <p><span>סוג אימון: </span><span>%TYPE%</span></p>
  <p><span>תאריך: </span><span>%DATE%</span></p>
  <p><span>שעת כניסה: </span><span>%HOUR%</span></p>
</div>`,
    trainingOption: `
<div class="training-option">
  <div>
    <p>%DAY%</p>
    <hr data-color="black" />
    <p>%HOUR%</p>
  </div>
  <div>
    <h4>%TYPE%</h4>
    <div>
      <div>
        <img src="${window.flaskStaticImg}/icons/user.svg" alt="%INSTRUCTOR%" />
        <span>%INSTRUCTOR%</span>
      </div>
      <div>
        <img src="${window.flaskStaticImg}/icons/users.svg" alt="Availabillity" />
        <span>%CAPACITY%/%AVAILABLE%</span>
      </div>
      <button data-id="%ID%" name="book">הרשמה עם מנוי</button>
    </div>
  </div>
</div>`,
    trainingOptionRegistered: `
<div class="training-option training-option-registerd">
  <div>
    <p>%DAY%</p>
    <hr data-color="black" />
    <p>%HOUR%</p>
  </div>
  <div>
    <h4>%TYPE%</h4>
    <div>
      <div>
        <img src="${window.flaskStaticImg}/icons/user.svg" alt="%INSTRUCTOR%" />
        <span>%INSTRUCTOR%</span>
      </div>
      <div>
        <img src="${window.flaskStaticImg}/icons/check.svg" alt="Registerd" />
        <span>נרשמת</span>
      </div>
      <button data-id="%ID%" name="cancel">ביטול רישום</button>
    </div>
  </div>
</div>`,
};