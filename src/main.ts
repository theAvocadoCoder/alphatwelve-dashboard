import "./style.css";
import "iconify-icon";

import StatCard, {Stat} from "./components/StatCard";
import data from "./mock-data.json";

const stats = document.getElementById("stats");

const length = data.stats.length;

for (let i = 0; i < length; i++) {
  stats?.appendChild(StatCard((data.stats[i] as Stat)));
}
