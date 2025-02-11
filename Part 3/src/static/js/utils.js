/**
 * Save the given value to the local storage in a given key position.
 * @param {string} key
 * @param {*} value
 */
export const saveToLocalStorage = function (key, value) {
  localStorage.setItem(key, JSON.stringify(value));
};

/**
 * Validate the phone number input field in a given input event.
 * @param {Event} e
 */
export const validatePhoneNumber = function (e) {
  // Clean the input:
  let value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-digit characters
  if (!value.startsWith("05")) value = "05" + value.slice(2); // Starts with "05"
  if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits
  if (value.length > 3) value = value.slice(0, 3) + "-" + value.slice(3); // Add dash after the third digit

  // Update the input field:
  e.target.value = value;
};
