import "./style.css";
import "iconify-icon";

import StatCard, {Stat} from "./components/StatCard";
import Navigation from "./components/Navigation";
import { stats as statsData } from "./mock-data.json";

const stats = document.getElementById("stats");

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
