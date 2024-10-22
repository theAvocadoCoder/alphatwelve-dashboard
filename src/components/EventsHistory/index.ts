import styles from "./EventsHistory.module.css";

import history from "./history.json";
import avatar1 from "@assets/avatar1.png";
import avatar2 from "@assets/avatar2.png";
import avatar3 from "@assets/avatar3.png";

import { createIcon } from "@components/CustomIcon";

const [chevronRightAlt] = [createIcon("chevronRightAlt").outerHTML];

class EventsHistory extends HTMLElement {
  constructor() {
    super();
  }

  // Table data
  body: HTMLTableSectionElement | null = null;
  list: typeof history[number][] = [...history];
  currentPage = 1;
  limit = 10;
  listLength = this.list.length;
  pages = Math.ceil(this.listLength / this.limit);

  // Modal data
  modal: {
    root: HTMLDialogElement,
    name?: HTMLParagraphElement,
    date?: HTMLParagraphElement,
    description?: HTMLParagraphElement,
  } = {
    root: document.createElement("dialog"),
  };
  avatars = [avatar1, avatar2, avatar3].map((avatar: string) => {
    const img = document.createElement("img");

    img.src = avatar;
    img.alt = "Speaker's avatar";

    return img;
  });

  /** 
   * Create the table, sort & filter controls and pagination controls 
   * when the component is added to the DOM 
  */
  connectedCallback() {
    const table = document.createElement("table");
    table.classList.add(styles.table);
    table.innerHTML = `
      <thead class="${styles.head}">
        <tr>
          <th>Event Name</th>
          <th class="${styles.collapsible}">Date</th>
          <th class="${styles.collapsible}">Speaker</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody class="${styles.body}"></tbody>
    `;

    this.body = table.getElementsByTagName("tbody")[0];

    this.renderTable();

    // Listen for the button click to open the row dropdown
    Array.from(this.body.getElementsByClassName(styles["collapse-btn"])).forEach(btn => {
      btn.addEventListener("click", () => {
        document.getElementById(`extra-${btn.id[btn.id.length - 1]}`)!.classList.toggle(styles.hidden);
      })
    })

    // Listen for clicks on the rows to open the modal dialog
    Array.from(this.body.getElementsByTagName("tr")).forEach(row => {
      row.addEventListener("click", (event) => {
        // If the collapse button is clicked, do not open the modal
        if (
          (event.target! as HTMLElement).classList.contains(styles["collapse-btn"]) ||
          (event.target! as HTMLElement).localName === "custom-icon"
        ) return;

        const index = Number(row.id[row.id.length - 1]) + (this.limit * (this.currentPage - 1));
        this.openModal(this.list[index]);
      })
    })

    // Create the popup modal
    this.modal.root.innerHTML = `
      <div class="${styles["modal-heading"]}">
        <p id="event-name"></p>
        <p id="event-date"></p>
        <iconify-icon icon="solar:close-circle-line-duotone"></iconify-icon>
        <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
      </div>
      <div class="${styles["modal-body"]}">
        <p id="event-description"></p>
        <div>
          <div class="${styles.avatars}">
          </div>
          <p id="attendance">
          </p>
        </div>
      </div>
      <div class="${styles["modal-control"]}">
        <button class="edit">Edit</button>
        <div>
          <button class="delete">Delete</button>
          <button class="mark-complete">Mark as completed</button>
        </div>
      </div>
    `;

    // Close the modal on button click
    Array.from(this.modal.root.querySelectorAll("iconify-icon")!).forEach(btn => btn.addEventListener("click", () => {
      this.modal.root.close();
    }));

    // Store the elements for the event name, date and description
    [
      this.modal.name,
      this.modal.date,
      this.modal.description,
    ] = [
      this.modal.root.querySelector<HTMLParagraphElement>("#event-name")!,
      this.modal.root.querySelector<HTMLParagraphElement>("#event-date")!,
      this.modal.root.querySelector<HTMLParagraphElement>("#event-description")!,
    ]

    this.modal.root.classList.add(styles.modal);
    this.appendChild(this.modal.root);
    this.appendChild(table);
  }

  // Tear down the element when it is removed from the DOM
  disconnectedCallback() {
    this.innerHTML = "";
  }

  renderTable = () => {
    // Pagination: render table by page
    const list = this.list.slice(
      this.limit * (this.currentPage - 1),
      this.limit * this.currentPage
    );
    const length = list.length;

    // Clear previous table data
    this.body!.innerHTML = "";

    // Add table rows
    for (let i = 0; i < length; i++) {
      const item = list[i];
      this.body!.innerHTML += `
        <tr id="event-${i}">
          <td>
            <span id="btn-${i}" class="${styles["collapse-btn"]}">${chevronRightAlt}</span>
            ${item.eventName}
          </td>
          <td class="${styles.collapsible}">${item.date}</td>
          <td class="${styles.collapsible}">${item.speaker}</td>
          <td><span class="${styles.dot} ${styles[item.status.split(" ").join("").toLocaleLowerCase()]}">${item.status}</span></td>
        </tr>
        <tr id="extra-${i}" class="${styles.extra} ${styles.hidden}">
          <td class="${styles.expandible}">${item.speaker}</td>
          <td class="${styles.expandible}">${item.date}</td>
        </tr>
      `;
    }
  }

  nextPage() {}

  previousPage() {}

  openModal = (event: typeof this.list[number]) => {
    this.clearModal();

    this.modal.name!.innerHTML = event.eventName;
    this.modal.date!.innerHTML = event.date;
    this.modal.description!.innerHTML = `${event.speaker} gives a sterling presentation at ${event.eventName}`;

    // Randomly generate number of speakers
    const numSpeakers = Math.ceil(Math.random() * 3);
    const randomIndex = Math.floor(Math.random() * this.listLength);

    let speakers = ``;
    for (let i = 0; i < numSpeakers; i++) {
      speakers += `${this.list[randomIndex + i].speaker}${i === numSpeakers - 1 ? "." : ", "}`
    }

    // Append the avatars
    this.modal.root.querySelector(`.${styles.avatars}`)!.append(...this.avatars.slice(0, numSpeakers));

    this.modal.root.querySelector("#attendance")!.innerHTML += `
      <p>${numSpeakers} Guest Speakers: ${speakers}</p>
      <p>${Math.ceil(Math.random() * 500)} Attendees</p>
    `;

    this.modal.root.showModal();
  }

  // Clear previous data from the modal
  clearModal = () => {
    this.modal.name!.innerHTML = ``;
    this.modal.date!.innerHTML = ``;
    this.modal.description!.innerHTML = ``;
    this.modal.root.querySelector("#attendance")!.innerHTML = ``;
    this.modal.root.querySelector(`.${styles.avatars}`)!.innerHTML = ``;
  }
}

customElements.define("events-history", EventsHistory);

export default EventsHistory;
