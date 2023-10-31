import { TOAST_DURATION, MAX_CHARACTERS_ON_TEXT } from "./constants.js";

export async function showToast(message, isError = false) {
  const toastId = `#toast`;
  $(`${toastId}-message`).html(`
      <p class="${isError && "text-red-300"} px-1">${message}</p>
    `);
  $(toastId).slideToggle("fast");

  setTimeout(() => {
    $(toastId).slideToggle("fast");
  }, TOAST_DURATION);
}

export function validateInputFields(inputFields) {
  const inputData = {};

  for (const element of inputFields) {
    const tag = $(`#${element.id}`);
    let value = tag.val() || tag.text();

    if (value.length === 0)
      throw new Error(`Input fields (${element.id}) must not be empty!`);
    if (value.length > MAX_CHARACTERS_ON_TEXT)
      throw new Error(
        `Input field (${element.id}) character length must not exceed ${MAX_CHARACTERS_ON_TEXT}!`
      );
    inputData[element.id] = value;
  }

  return inputData;
}

export function isLoggedIn(user) {
  if (!user) throw new Error("You must be authenticated to do this action!");
}
