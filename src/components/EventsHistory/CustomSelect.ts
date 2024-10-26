import styles from "./EventsHistoryControls.module.css";

class CustomSelect extends HTMLElement {

  private _icon: InitOptions["icon"];
  private _options: InitOptions["options"];
  private _label: InitOptions["label"];
  private _labelAsText: InitOptions["labelAsText"];

  private selectButton: HTMLButtonElement;
  private dropDown: HTMLUListElement;
  private options: NodeListOf<HTMLLIElement> | null;
  private announcement: HTMLDivElement;
  private isDropdownOpen = false;
  private currentOptionIndex = 0;

  constructor(init: InitOptions) {
    super();

    if (init.icon) this._icon = init.icon;
    if (init.labelAsText) this._labelAsText = init.labelAsText;
    this._options = init.options;
    this._label = init.label;
  
    this.selectButton = document.createElement("button");
    this.dropDown = document.createElement("ul");
    this.options = document.createDocumentFragment().childNodes as NodeListOf<HTMLLIElement>;
    this.announcement = document.createElement("div");
    this.isDropdownOpen = false;
    this.currentOptionIndex = 0;

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.selectOptionByElement = this.selectOptionByElement.bind(this);
  }

  // Create the element when connected to the DOM
  connectedCallback() {

    this.innerHTML = `
      ${this._labelAsText ? "" : `<label for="select">${this._label}</label>`}
      <button
        name="select"
        id="select-${this._label}"
        role="combobox"
        value="${this._options[this.currentOptionIndex].value}"
        aria-controls="select-options"
        aria-haspopup="listbox"
        tabindex="0"
        aria-expanded="false"
      >
        ${this._labelAsText ? this._label : this._options[0].text}
        ${this._icon || ""}
      </button>
      <ul
        role="listbox"
        id="select-options"
        aria-labelledby="select-${this._label}"
        class="custom-select-options"
      >
      </ul>
      <div id="announcement" class="announcement" aria-live="assertive" role="alert"></div>
    `;

    this.dropDown = this.querySelector("ul")!;
    // Add the options to the list
    this.listOptions();
    this.querySelector("custom-icon")?.classList.add(styles.icon)

    this.selectButton = this.querySelector("button")!;
    this.options = this.querySelectorAll(`[role="option"]`);
    this.announcement = this.querySelector("#announcement")!;

    this.selectButton.addEventListener("click", this.toggleDropdown)
    this.dropDown.addEventListener(
      "click", 
      (event) => this.selectOptionByElement(event.target as HTMLLIElement)
    )
    
    this.addEventListener("keydown", this.handleKeyPress)
    this.addEventListener("focusout", () => {
      setTimeout(() => {
        if (
          this.isDropdownOpen && 
          !this.contains(document.activeElement)
        ) this.toggleDropdown();
      }, 200)
    });

    this.classList.add("custom-select");

  }

  // Tear down element when removed from the dom
  disconnectedCallback() {
    this.innerHTML = "";
    this.isDropdownOpen = false;
    this.currentOptionIndex = 0;
  }

  // Add options to the list
  listOptions = () => {
    const length = this._options.length;
    this.dropDown!.innerHTML = "";

    for (let i = 0; i < length; i++) {
      this.dropDown!.innerHTML += `
        <li role="option" id="${this._options[i].value}">
          ${this._options[i].text}
        </li>
      `;
    }
  }

  // Toggle the dropdown select list
  toggleDropdown = () => {
    this.dropDown!.classList.toggle(styles.active, !this.isDropdownOpen);
    this.isDropdownOpen = !this.isDropdownOpen;
    this.selectButton!.setAttribute('aria-expanded', this.isDropdownOpen.toString()); // update the aria-expanded state

    if (this.isDropdownOpen) {
      this.dropDown.focus();
      this.focusCurrentOption();
      this.dropDown.style.visibility = "visible";
    }
    else {
      this.dropDown.style.visibility = "hidden";
      this.dropDown.removeAttribute("tabindex");
      this.focus();
    }
  }

  // Apply styles to currently highlighted option
  focusCurrentOption = () => {
    const currentOption = this.options![this.currentOptionIndex];
    
    this.options!.forEach((option) => {
      option.classList.toggle(styles.current, option === currentOption);
    });
    currentOption.focus();
  }

  // Handle keyboard interaction
  handleKeyPress = (event: KeyboardEvent) => {
    const { key } = event;
    // Don't prevent default behaviour of function keys and Tab
    if (key.substring(0,1) !== "F" && key !== "Tab") event.preventDefault();
    const openKeys = ['ArrowDown', 'ArrowUp', 'Enter', ' '];
 
   if (!this.isDropdownOpen && openKeys.includes(key)) {
      this.toggleDropdown();
    } else if  (this.isDropdownOpen ) {
      switch(key) {
        case "Escape":
          this.toggleDropdown();
          break;
        case "ArrowDown":
          this.moveFocusDown();
          break;
        case "ArrowUp":
          this.moveFocusUp();
          break;
        case "Enter":
        case " ":
          this.selectCurrentOption();
          break;
        default:
          break;
      }
    }
  }

  // For keyboard interactions - arrow down
  moveFocusDown = () => {
    if (this.currentOptionIndex < this.options!.length - 1) {
      this.currentOptionIndex++;
    } else {
      this.currentOptionIndex = 0;
    }
    this.focusCurrentOption();
  }

  // For keyboard interactions - arrow up
  moveFocusUp = () => {
    if (this.currentOptionIndex > 0) {
      this.currentOptionIndex--;
    } else {
      this.currentOptionIndex = this.options!.length - 1;
    }
    this.focusCurrentOption();
  }

  // Select the currently highlighted option
  selectCurrentOption = () => {
    const selectedOption = this.options![this.currentOptionIndex];
    this.selectOptionByElement(selectedOption);
  }

  // Select specified element - for mouse event
  selectOptionByElement = (optionElement: HTMLLIElement) => {
    const optionValue = optionElement.textContent;
  
    if (!this._labelAsText) this.selectButton!.innerHTML = `${optionValue} ${this._icon}`;
    this.selectButton!.value = `${optionElement.id}`;
    this.options!.forEach(option => {
      option.classList.remove(styles.active);
      option.setAttribute('aria-selected', 'false');
    });
  
    optionElement.classList.add(styles.active);
    optionElement.setAttribute('aria-selected', 'true');

    this.toggleDropdown();
    this.emitChange();
    this.announceOption(optionValue!);
  }

  // Announce the selection - for screen readers
  announceOption = (text: string) => {
    this.announcement!.textContent = text;
    this.announcement!.setAttribute('aria-live', 'assertive');
    setTimeout(() => {
      this.announcement!.textContent = '';
      this.announcement!.setAttribute('aria-live', 'off');
    }, 1000); // Announce and clear after 1 second 
  }

  // Emit the change event so parent can process it
  emitChange = () => {
    const changeEvent = new CustomEvent("opt-change", {
      bubbles: true,
      detail: {
        type: this._label
      }
    });

    this.selectButton!.dispatchEvent(changeEvent);
  }
  
}

interface InitOptions {
  icon?: string,
  labelAsText?: boolean,
  options: {
    value: string,
    text: string,
  }[],
  label: string,
}

customElements.define("custom-select", CustomSelect);

export default CustomSelect;
