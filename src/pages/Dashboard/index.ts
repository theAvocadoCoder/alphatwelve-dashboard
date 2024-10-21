import styles from "./Dashboard.module.css";

import StatCard,{Stat} from "@components/StatCard";
import Carousel from "@components/Carousel";

import { stats as statsData } from "@/mock-data.json";

const sections = [
  {
    name: "stats",
    title: "",
    content: statsData.map((stat: Stat) => StatCard(stat)),
  },
  {
    name: "monthly",
    title: "Event registrations per month",
    content: ["Chart", new Carousel()],
  },
  {
    name: "history",
    title: "Events History",
    content: ["History..."],
  },
]

export default function Dashboard() {
  const container = document.createDocumentFragment();

  const welcome = document.createElement("h1");
  welcome.textContent = "Welcome, here's your summary";

  const length = sections.length;
  const sectionList:HTMLElement[] = [];

  for (let i = 0; i < length; i++) {
    const currentSection = sections[i];
    const section = document.createElement("section");

    section.classList.add(styles[currentSection.name] || currentSection.name);
    section.innerHTML = `${currentSection.title ? `<h2>${currentSection.title}</h2>` : ""}`;
    section.append(...currentSection.content);

    sectionList.push(section);
  }

  container.append(welcome, ...sectionList);

  return container;
}

