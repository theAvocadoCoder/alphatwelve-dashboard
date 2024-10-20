import "./style.css";
import "iconify-icon";

import layout from "./layout";
import Dashboard from "./pages/Dashboard";
import InProgress from "./pages/InProgress";

// Append the layout to the main app div 
const app = document.getElementById("app");
app!.append(layout());

const length = statsData.length;

for (let i = 0; i < length; i++) {
  stats?.appendChild(StatCard((statsData[i] as Stat)));
}

document.body.prepend(Navigation());

// @ts-expect-error
document.body.addEventListener("nav", function(event: CustomEvent) {
  // console.log(event);
  // console.log("does this run at all")
})
