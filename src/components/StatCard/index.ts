import styles from "./StatCard.module.css";
import { createIcon } from "@components/CustomIcon";

const [ infoIcon, rateIcon ] = [ createIcon("info").outerHTML, createIcon("rate").outerHTML ];

export default function StatCard(stat: Stat) {
  // Create the card
  const card = document.createElement("div");
  card.classList.add(styles["stat-card"]);

  card.innerHTML = `
    <p>
      ${stat.label}
      ${infoIcon}
      <span class="${styles.tooltip}">More information about ${stat.label}...</span>
    </p>
    <p>
      ${stat.value}
      <span class="${stat.rate[0] === "+" ? styles["positive-rate"] : styles["negative-rate"]}">
        ${rateIcon}
        ${stat.rate}
      </span>
    </p>
  `;

  return card;
}

export type Stat = {
  label: string,
  value: string,
  rate: string,
}
