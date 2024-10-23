import "./style.css";
import "iconify-icon";

import layout from "./layout";
import Dashboard from "./pages/Dashboard";
import InProgress from "./pages/InProgress";

// Detect user's color scheme preference
if (
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
) document.body.classList.toggle("dark", true);

const app = document.getElementById("app");
let content: HTMLElement;

// Delay appending content to avoid FOUC
setTimeout(() => {
  // Append the layout to the main app div 
  app!.append(layout());
  
  // On page load, append the correct page to the main content element
  content = app!.querySelector("#content")!;
  content?.append(
    window.location.pathname.substring(1) === "" ?
    Dashboard() :
    InProgress()
  );

}, 600)

// On page navigation, append the correct page to the main content element
window.addEventListener("popstate", function(event: PopStateEvent) {
  const target = (event.target! as HTMLAnchorElement).attributes["href" as any].value;
  if (target.substring(1) === "") {
    content?.replaceChildren(Dashboard());
  } else {
    content?.replaceChildren(InProgress());
  }

  // Dispatch custom event to handle page navigation from non-navlink
  const navEvent = new CustomEvent("nav", { detail: target });
  window.dispatchEvent(navEvent);
})
