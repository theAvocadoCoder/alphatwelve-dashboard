import { createIcon } from "./CustomIcon";


export default function StatCard(stat: Stat) {

  // Create the card
  const card = document.createElement("div");
  card.classList.add("stat-card");

  card.innerHTML = `
    <h3>
      ${stat.label}
      ${createIcon("info").outerHTML}
      <span class="tooltip">More information about ${stat.label}...</span>
    </h3>
    <p>
      ${stat.value}
      <span class="${stat.rate[0] === "+" ? "positive-rate" : "negative-rate"}">
        ${createIcon("rate").outerHTML}
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
