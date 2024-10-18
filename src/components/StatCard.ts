import CustomIcon from "./CustomIcon";

export default function StatCard(stat: Stat) {
  // Path definitions for card icons
  const RATE_PATH_DEFINITION = "M8.5 7.16667V1.5H2.83333M8.33333 1.66667L1.5 8.5";
  const INFO_PATH_DEFINITION = [
    "M8 8.66666V9.99999",
    "M8.33333 5.99999C8.33333 6.18409 8.1841 6.33332 8 6.33332C7.81591 6.33332 7.66667 6.18409 7.66667 5.99999C7.66667 5.81589 7.81591 5.66666 8 5.66666C8.1841 5.66666 8.33333 5.81589 8.33333 5.99999Z",
    "M12.8333 7.99999C12.8333 10.6694 10.6694 12.8333 8 12.8333C5.33062 12.8333 3.16667 10.6694 3.16667 7.99999C3.16667 5.33061 5.33062 3.16666 8 3.16666C10.6694 3.16666 12.8333 5.33061 12.8333 7.99999Z",
  ];

  // Create the card
  const card = document.createElement('div');
  card.classList.add('stat-card');

  // Create the label
  const label = document.createElement('h3');
  label.textContent = stat.label;

  // Create the tooltip icon
  const infoIcon = new CustomIcon();
  infoIcon.setAttribute("data-content", INFO_PATH_DEFINITION.join());
  infoIcon.setAttribute("data-scale", "16");

  // Create the tooltip
  const infoToolTip = document.createElement("span");
  infoToolTip.appendChild(document.createTextNode(`More information about ${stat.label}...`));
  infoToolTip.classList.add("tooltip");

  label.appendChild(infoIcon);
  label.appendChild(infoToolTip);
  card.appendChild(label);

  // Create the value
  const value = document.createElement('p');
  value.textContent = stat.value;
  
  // Create the rate
  const rate = document.createElement('span');
  rate.classList.add(stat.rate[0] === "+" ? "positive-rate" : "negative-rate");

  // Create the rate icon
  const rateIcon = new CustomIcon();
  rateIcon.setAttribute("data-content", RATE_PATH_DEFINITION);
  rateIcon.setAttribute("data-scale", "10");

  rate.appendChild(rateIcon);
  rate.appendChild(document.createTextNode(stat["rate"]));

  value.appendChild(rate);
  card.appendChild(value);

  return card;
}

export type Stat = {
  label: string,
  value: string,
  rate: string,
}
