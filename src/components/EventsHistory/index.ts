import styles from "./EventsHistory.module.css";

import history from "./history.json";
import avatar1 from "@assets/avatar1.png";
import avatar2 from "@assets/avatar2.png";
import avatar3 from "@assets/avatar3.png";

import { createIcon } from "@components/CustomIcon";
import CustomSelect from "./CustomSelect";

const [chevronRightAlt, chevronLeft, chevronRight, chevronDown, search, moreOptions, download] = [
  createIcon("chevronRightAlt").outerHTML,
  createIcon("chevronLeft").outerHTML,
  createIcon("chevronRight").outerHTML,
  createIcon("chevronDown").outerHTML,
  createIcon("search").outerHTML,
  createIcon("moreOptions").outerHTML,
  createIcon("download").outerHTML,
];

class EventsHistory extends HTMLElement {
  constructor() {
    super();
  }

  list: typeof history[number][] = [...history];
  currentPage = 1;
  limit = 10;
  listLength = this.list.length;
  // If list length is a multiple of limit, no need to force rounding up
  pages = this.listLength % this.limit > 0 ?
    Math.ceil(this.listLength / this.limit) :
    this.listLength /this.limit;

  // Table data
  body: HTMLTableSectionElement | null = null;

  // Pagination elements
  pagination: HTMLDivElement = document.createElement("div");
  pageNavBtns: NodeListOf<HTMLSpanElement> | null = null;

  // Query control elements
  query: HTMLDivElement = document.createElement("div");
  searchBar: HTMLInputElement = document.createElement("input");

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

    // Create the pagination section
    this.pagination.classList.add(styles.pagination);
    this.pagination.innerHTML = `
      <div class="${styles["page-controls"]}">
        <button class="${styles["page-left"]} ${this.currentPage === 1 ? styles.disabled : ""}">
          <span class="sr-only">Previous</span>
          ${chevronLeft}
        </button>
        <div class="${styles.pages}"></div>
        <button class="${styles["page-right"]} ${this.currentPage === this.pages ? styles.disabled : ""}">
          <span class="sr-only">Next</span>
          ${chevronRight}
        </button>
      </div>
      <div class="${styles.limit}">
      </div>
    `;

    // Add the pagination select element
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
    this.pageNavBtns = this.pagination.querySelectorAll(`.${styles["page-controls"]}> button`);

    // Listen for button click
    this.pageNavBtns.forEach(btn => btn.addEventListener("click", () => this.navigatePageByOne(btn)))

    // Select the option that corresponds with the current limit
    this.pagination.querySelector(`option[value="${this.limit}"]`)?.setAttribute("selected", "");

    // Listen for change in select element
    this.pagination.querySelector(`.${styles.limit}`)!.addEventListener("opt-change", (event) => {
      if ((event as CustomEvent).detail.type !== "Show:") return;
      // Set new limit based on user selection
      this.limit = Number((event.target as HTMLSelectElement).value);

      this.rerenderTable();
    });

    // Create the query section
    this.query.classList.add(styles.query);
    this.query.innerHTML = `
      <div class="${styles["filter-container"]}">
        <div class="${styles["search-container"]}">
          <input id="search" class="${styles.search}" aria-label="Search" placeholder="Search..." />
          ${search}
        </div>
        <div id="date" data-value="date" class="${styles.date} ${styles.filter}"></div>
        <div id="status" data-value="status" class="${styles.status} ${styles.filter}"></div>
        <div id="name" data-value="eventName" class="${styles.name} ${styles.filter}"></div>
        <span>Displaying <span id="display-text">${this.listLength}</span> results</span>
      </div>
      <div class="${styles["sort-container"]}">
        <div class="${styles.sort}"></div>
        <div class="${styles["more-options"]}">
          <button>
            <span class="sr-only">More options</span>
            ${moreOptions}
          </button>
          <button id="download-btn">
            ${download}
            <span>Export</span>
          </button>
        </div>
      </div>
    `;

    // The search bar
    this.searchBar = this.query.querySelector("#search") as HTMLInputElement;

    // Listen to changes as user types or when they press enter
    this.searchBar!.addEventListener("keyup", (event: KeyboardEvent) => {
      if (event.key === "Enter") this.searchTable();
    });
    this.searchBar!.addEventListener("keyup", debounce(this.searchTable, 500));

    // The filter containers
    const filterContainers = this.query.querySelectorAll(
      `.${styles["filter-container"]} div:not(.${styles["search-container"]})`
    ) as NodeListOf<HTMLDivElement>;

    // Add custom select elements for filters
    filterContainers.forEach(container => {
      container.appendChild(new CustomSelect({
        label: container.id.replace(
          /[a-z]/g, 
          (c: string, offset?: number) => offset === 0 ? c.toUpperCase() : c
        ),
        labelAsText: true,
        icon: chevronDown,
        options: Array.from(
          new Set(
            history.map(item => (JSON.stringify({
              value: item[container.getAttribute("data-value") as keyof typeof history[number]],
              text: item[container.getAttribute("data-value") as keyof typeof history[number]],
            })))
          )
        )
        .map(item => JSON.parse(item))
        .sort((a: any, b: any) => {
          switch (container.id) {
            case "date":
              return new Date(a.value).getTime() - new Date(b.value).getTime();
            default:
              return a.value.localeCompare(b.value, undefined, { sensitivity: 'base' });
          }
        }),
      }));

      container.addEventListener("opt-change", (event) => {
        this.filterTable(
          container.getAttribute("data-value") as keyof typeof this.list[number], 
          (event.target as HTMLSelectElement).value
        );
      });
    });

    // The sort container
    const sortContainer = this.query.querySelector(`.${styles.sort}`);

    // Add custom select element for sorting
    sortContainer!.appendChild(new CustomSelect({
      label: "Sort:",
      icon: chevronDown,
      options: [
        {value: "most-recent", text: "Most Recent"},
        {value: "oldest", text: "Oldest"},
        {value: "name", text: "Name"},
        {value: "name-reversed", text: "Name Reversed"}
      ]
    }));

    // Listen for the filter's change event and handle
    sortContainer!.addEventListener("opt-change", (event) => {
      this.sortTable((event.target as HTMLSelectElement).value);
    });

    // Add click event listener for the downlaod button
    this.query.querySelector("#download-btn")!.addEventListener("click", this.downloadTable)

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
    Array.from(this.modal.root.querySelectorAll("iconify-icon, button")!)
    .forEach(btn => btn.addEventListener("click", () => {
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

    this.append(this.modal.root, this.query, table, this.pagination);
  }

  // Tear down the element when it is removed from the DOM
  disconnectedCallback() {
    this.innerHTML = "";
  }

  // Render the table
  renderTable = () => {

    // If search results don't yield anything, display helpful message
    if (this.listLength === 0) {
      this.body!.innerHTML = "";
      const noResultsRow = document.createElement("tr");
      const noResultsCell = document.createElement("td");
      const columnCount = this.querySelector("thead tr")?.children.length;
      noResultsCell.setAttribute("colspan", `${columnCount}`); // Spans all columns
      noResultsCell.textContent = "You have no events that match this search. Try adjusting your filters.";
      noResultsRow.appendChild(noResultsCell);
      noResultsRow.classList.add(styles["no-results"]);
      this.body!.appendChild(noResultsRow);

      return;
    }

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

    // Listen for the button click to open the row dropdown
    Array.from(this.body!.getElementsByClassName(styles["collapse-btn"])).forEach(btn => {
      btn.addEventListener("click", () => {
        document.getElementById(`extra-${btn.id[btn.id.length - 1]}`)!.classList.toggle(styles.hidden);
      })
    })

    // Listen for clicks on the rows to open the modal dialog
    Array.from(this.body!.getElementsByTagName("tr")).forEach(row => {
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

    this.pagination.querySelectorAll(`span.${styles["page-number"]}`).forEach(number => {
      number.classList.toggle(styles.active, Number(number.id.slice(5)) === this.currentPage);
    })
  }

  // Rerender the table after query operations
  rerenderTable = () => {
    this.listLength = this.list.length;
    this.query.querySelector("#display-text")!.textContent = "" + this.listLength;
    this.currentPage = 1;

    this.updatePages();
    this.togglePageNavDisabled();
    this.renderTable();
  }

  // Filter the table using one property
  filterTable = (property: keyof typeof this.list[number], value: string) => {
    this.list = [...history];
    this.list = this.list.filter(item => item[property] == value);

    this.rerenderTable();
  }

  // Sort the table with limited patterns
  sortTable = (pattern: string) => {
    this.list = [...history];

    this.list.sort((a: typeof this.list[number], b: typeof this.list[number]) => {
      switch(pattern) {
        case "most-recent":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
          break;
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "name":
          return a.eventName.localeCompare(b.eventName, undefined, { sensitivity: 'base' });
          break;
        case "name-reversed":
          return b.eventName.localeCompare(a.eventName, undefined, { sensitivity: 'base' });
          break;
        default:
          return 0;
          break;
      }
    })
    
    this.rerenderTable();
  }

  // Filter the table to match user's search string
  searchTable = () => {
    // Trimming and lowering case helps bypass String.includes() strict comparison
    const query = this.searchBar.value.toLocaleLowerCase().trim();
    
    this.list = [...history];

    if (query === "") return this.rerenderTable();

    this.list = this.list.filter(item => (
      item.date.toLocaleLowerCase().trim().includes(query) ||
      item.eventName.toLocaleLowerCase().trim().includes(query) ||
      item.speaker.toLocaleLowerCase().trim().includes(query)
    ));

    this.rerenderTable();
  }

  // Open the event details modal
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
    this.pages = this.listLength % this.limit > 0 ? 
      Math.ceil(this.listLength / this.limit) : 
      this.listLength /this.limit;

    if (this.currentPage > this.pages) this.currentPage = this.pages;
    this.renderPageNumbers();
  }

  // Render the page numbers that will be displayed
  renderPageNumbers = () => {
    const container = this.pagination.querySelector(`.${styles.pages}`);
    container!.innerHTML = "";

    for (let i = 0; i < this.pages; i++) {
      // When more than 5 pages, truncate the numbers at depth of 2
      if (this.pages > 5 && i === 2){  
        const isCurrentPage = this.currentPage > 2 && this.currentPage < this.pages - 1;

        container!.innerHTML += `
          ${isCurrentPage ? "<span>...</span>" : "<span>&nbsp;&nbsp;&nbsp;</span>"}
          ${isCurrentPage ? `<span id="page-${this.currentPage}" class="${styles["page-number"]} ${
              styles.active
            }">${this.currentPage}</span>` : "<span>&nbsp;...&nbsp;</span>"}
          ${isCurrentPage ? "<span>...</span>" : "<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>"}
        `;

        i = this.pages - 3;
        continue;

      } else {
        // Display current page in the midst of truncation
        container!.innerHTML += `
          <span id="page-${i+1}" class="${styles["page-number"]} ${
            this.currentPage === i + 1 ? styles.active : ""
          }">${i+1}</span>
        `;
      }
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
    } else if (this.currentPage === this.pages && this.pages > 0) {
      this.pageNavBtns!.forEach(_btn => _btn.classList.toggle(styles.disabled, _btn.classList.contains(styles["page-right"])));
    } else if (this.currentPage === 0) {
      this.pageNavBtns!.forEach(_btn => _btn.classList.toggle(styles.disabled, true));
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

  // Download the table
  downloadTable = () => {
    // Extract the keys
    const keys = Object.keys(this.list[0]) as (keyof typeof this.list[number])[];
    const csvRows = ["Event Name,Date,Speaker,Status"];

    // Add the body
    this.list.forEach(obj => {
      const values = keys.map(key => JSON.stringify(obj[key], null, 2));
      csvRows.push(values.join(","));
    });

    // Convert to a blob
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });

    // Download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "events-history";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (this: any, ...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function(this: any, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  }
}

customElements.define("events-history", EventsHistory);

export default EventsHistory;
