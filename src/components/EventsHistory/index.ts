import styles from "./EventsHistory.module.css";

import history from "./history.json";
import avatar1 from "@assets/avatar1.png";
import avatar2 from "@assets/avatar2.png";
import avatar3 from "@assets/avatar3.png";

import { createIcon } from "@components/CustomIcon";
import CustomSelect from "./CustomSelect";

const [chevronRightAlt, chevronLeft, chevronRight, chevronDown] = [
  createIcon("chevronRightAlt").outerHTML,
  createIcon("chevronLeft").outerHTML,
  createIcon("chevronRight").outerHTML,
  createIcon("chevronDown").outerHTML,
];

class EventsHistory extends HTMLElement {
  constructor() {
    super();
  }

  // Table data
  body: HTMLTableSectionElement | null = null;

  // Pagination elements
  pagination: HTMLDivElement = document.createElement("div");
  pageNavBtns: NodeListOf<HTMLSpanElement> | null = null;

  list: typeof history[number][] = [...history];
  currentPage = 1;
  limit = 10;
  listLength = this.list.length;
  // If list length is a multiple of limit, no need to force rounding up
  pages = this.listLength % this.limit > 0 ? Math.ceil(this.listLength / this.limit) : this.listLength /this.limit;

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

    // Render the table
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

    // Create the pagination section
    this.pagination.classList.add(styles.pagination);
    this.pagination.innerHTML = `
      <div class="${styles["page-controls"]}">
        <span class="${styles["page-left"]} ${this.currentPage === 1 ? styles.disabled : ""}">
          ${chevronLeft}
        </span>
        <div class="${styles.pages}"></div>
        <span class="${styles["page-right"]} ${this.currentPage === this.pages ? styles.disabled : ""}">
          ${chevronRight}
        </span>
      </div>
      <div class="${styles.limit}">
      </div>
    `;

    // Add the custom select element
    this.pagination.querySelector(`.${styles.limit}`)!.appendChild(new CustomSelect({
      label: "Show:",
      icon: chevronDown,
      options: [
        { value: "10", text: "10 rows" },
        { value: "20", text: "20 rows" },
        { value: "30", text: "30 rows" },
        { value: "50", text: "50 rows" },
      ],
    }));

    // Render the page numbers
    this.renderPageNumbers();

    // The previous and next page navigation buttons
    this.pageNavBtns = this.pagination.querySelectorAll(`.${styles["page-controls"]}> span`);

    // Listen for button click
    this.pageNavBtns.forEach(btn => btn.addEventListener("click", () => this.navigatePageByOne(btn)))

    // Select the option that corresponds with the current limit
    this.pagination.querySelector(`option[value="${this.limit}"]`)?.setAttribute("selected", "")

    // Listen for change in select element
    this.pagination.querySelector(`.${styles.limit}`)!.addEventListener("change", (event) => {
      // Set new limit based on user selection
      this.limit = Number((event.target as HTMLSelectElement).value);

      this.updatePages();
      this.togglePageNavDisabled();
      this.renderTable();
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

    this.append(this.modal.root, table, this.pagination);
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

    this.pagination.querySelectorAll(`span.${styles["page-number"]}`).forEach(number => {
      number.classList.toggle(styles.active, Number(number.id.slice(5)) === this.currentPage);
    })
  }

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

  // When limit changes, numbe rof pages also changes
  updatePages = () => {
    this.pages = this.listLength % this.limit > 0 ? Math.ceil(this.listLength / this.limit) : this.listLength /this.limit;
    this.renderPageNumbers();
  }

  // Render the page numbers that will be displayed
  renderPageNumbers = () => {
    const container = this.pagination.querySelector(`.${styles.pages}`);
    container!.innerHTML = "";

    for (let i = 0; i < this.pages; i++) {
      // When more than 5 pages, truncate the numbers at depth of 2
      if (this.pages > 5 && i === 2){  
        container!.innerHTML += `
          <span>...</span>
        `;
        if (this.currentPage > 2 && this.currentPage < this.pages - 1) {
          container!.innerHTML += `
            <span id="page-${this.currentPage}" class="${styles["page-number"]} ${
              styles.active
            }">${this.currentPage}</span><span>...</span>
          `;
        }
        i = this.pages - 3;
        continue;
      }
      // Display current page in the midst of truncation
      container!.innerHTML += `
        <span id="page-${i+1}" class="${styles["page-number"]} ${
          this.currentPage === i + 1 ? styles.active : ""
        }">${i+1}</span>
      `;
    }

    // Add click event listeners to change pages
    container!.querySelectorAll(`.${styles["page-number"]}`).forEach(number => number.addEventListener("click", () => {
      this.currentPage = Number(number.id.slice(5));
      this.renderTable();
      this.togglePageNavDisabled();
      this.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }));
  }

  // Disable respective nav buttons when at start or end of pages
  togglePageNavDisabled = () => {

    if (this.currentPage === 1) {
      this.pageNavBtns!.forEach(_btn => _btn.classList.toggle(styles.disabled, _btn.classList.contains(styles["page-left"])));
    } else if (this.currentPage === this.pages) {
      this.pageNavBtns!.forEach(_btn => _btn.classList.toggle(styles.disabled, _btn.classList.contains(styles["page-right"])));
    } else { 
      this.pageNavBtns!.forEach(_btn => _btn.classList.toggle(styles.disabled, false));
    }

  }

  // Move to next or previous page
  navigatePageByOne = (btn: HTMLElement) => {
      
    if (btn.classList.contains(styles["page-left"])) {
      if (this.currentPage === 1) return;

      this.currentPage--;
      this.renderTable();

    } else if (btn.classList.contains(styles["page-right"])) {
      if (this.currentPage === this.pages) return;

      this.currentPage++;
      this.renderTable();

    } else { return }
    
    this.renderPageNumbers();
    this.togglePageNavDisabled();
    
    this.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

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
