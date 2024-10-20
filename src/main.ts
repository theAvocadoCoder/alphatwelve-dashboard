import "./style.css";
import "iconify-icon";

import layout from "./layout";
import Dashboard from "./pages/Dashboard";
import InProgress from "./pages/InProgress";

// Append the layout to the main app div 
const app = document.getElementById("app");
app!.append(layout());

// On page load, append the correct page to the main content element
const content = app!.querySelector("#content");
content!.append(
  window.location.pathname.substring(1) === "" ?
  Dashboard() :
  InProgress()
);

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
