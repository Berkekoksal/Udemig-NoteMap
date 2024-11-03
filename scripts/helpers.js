import { gotoIcon, homeIcon, parkIcon, briefcaseIcon } from "./constants.js";
//* Status değerine bağlı olarak dinamik bir şekilde doğru icon'u return eden function.
export function getIcon(status) {
  switch (status) {
    case "goto":
      return gotoIcon;
    case "home":
      return homeIcon;
    case "job":
      return briefcaseIcon;
    case "park":
      return parkIcon;
    default:
      return undefined;
  }
}

//* Status değerinin Türkçe karşılığını return eden function
function getStatus(status) {
  switch (status) {
    case "goto":
      return "Visit";
    case "home":
      return "Home";
    case "job":
      return "Briefcase";
    case "park":
      return "Park";
    default:
      return "undefined";
  }
}
export default getStatus;
