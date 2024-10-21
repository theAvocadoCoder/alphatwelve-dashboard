import styles from "./Carousel.module.css";

import carousel1 from "@assets/carousel1.png";
import carousel2 from "@assets/carousel2.png";
import carousel3 from "@assets/carousel3.png";

import { createIcon } from "@components/CustomIcon";

const [chevronLeft, chevronRight] = [createIcon("chevronLeft").outerHTML, createIcon("chevronRight").outerHTML];


class Carousel extends HTMLElement {

  slider: HTMLElement | null;
  container: HTMLElement | null;
  indicators: HTMLSpanElement[];

  constructor() {
    super();
    this.slider = null;
    this.container = null;
    this.indicators = [];
  }

  private currentCard = 0;
  private intervalId: NodeJS.Timeout | null = null;

  private cards = [carousel1, carousel2, carousel3].map((image: string) => {
    const imgContainer = document.createElement("div");
    imgContainer.classList.add(styles["img-container"]);

    imgContainer.innerHTML = `
      <img src="${image}" alt="" />
    `;

    return imgContainer;
  });

  // Create the element when connecte to the DOM
  connectedCallback() {
    // The container holds that slider and overlay
    this.container = document.createElement("div");
    this.container.classList.add(styles.carousel);
    
    // The slider contains the images, hides them when not in view
    this.slider = document.createElement("div");
    this.slider.classList.add(styles.slider);
    this.slider.append(...this.cards);

    // The overlay sits on top of the slider
    const overlay = document.createElement("div");
    overlay.classList.add(styles.overlay || "overlay");
    overlay.innerHTML = `
      <div class="${styles.controls || "controls"}">
        <span id="previous">${chevronLeft}</span>
        <span id="next">${chevronRight}</span>
      </div>
      <div class="${styles["overlay-text"] || "overlay-text"}">
        <span>Latest News & Updates</span>
        <span>
          Turpis interdum nunc varius ornare dignissim pretium.
          Massa ornare quis aliquet sed vitae. Sed velit nisi, fermentum erat.
          Fringilla purus, erat fringilla tincidunt quisque non.
          Pellentesque in ut tellus.
        </span>
      </div>
      <div class="${styles["slide-position"] || "slide-position"}">
        <span class="indicators ${styles.active}"></span>
        <span class="indicators"></span>
        <span class="indicators"></span>
      </div>
    `;

    // Listen for clicks on control buttons
    Array.from(overlay.getElementsByTagName(`span`)).forEach(control => (
      control.addEventListener("click", () => {
        if (!["next", "previous"].includes(control.id)) return;

        this.stopSlide.bind(this)();

        if (control.id === "next") {
          this.currentCard < 2 && this.nextSlide.bind(this)();
        } else if (control.id === "previous") {
          this.currentCard > 0 && this.previousSlide.bind(this)();
        }
        
        this.startSlide.bind(this)();
      })
    ));

    // Save the indicators for later
    this.indicators = Array.from(
      overlay.getElementsByClassName("indicators") as HTMLCollectionOf<HTMLSpanElement>
    );

    // Append the slider and over to the container, and the container to the custom element
    this.container.append(this.slider, overlay);
    this.appendChild(this.container);

    // Start auto slide
    this.startSlide();
  }

  // Tear down component when it's removed from the DOM
  disconnectedCallback() {
    this.innerHTML = "";
    this.stopSlide();
  }

  // Start interval for automative slide
  startSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 3000)
  }

  // Clear interval for automativ slide
  stopSlide() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  // Move to the next slide
  nextSlide() {
    // Get the container's current width
    let currentWidth: string | number = window.getComputedStyle(this.container!).width;
    currentWidth = Number(currentWidth.substring(0, currentWidth.indexOf("p"))); 

    // Scroll to the next image based on the container width
    this.slider?.scrollTo({
      left: currentWidth * ((this.currentCard + 1) % 3), 
      top: 0,
      behavior: "smooth",
    });

    // Update the current card
    this.currentCard = (this.currentCard + 1) % 3;

    // Update the indicators
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle(
        styles.active,
        index == this.currentCard
      )
    });
  }

  // Move to the previous slide
  previousSlide() {
    // Get the container's current width
    let currentWidth: string | number = window.getComputedStyle(this.container!).width;
    currentWidth = Number(currentWidth.substring(0, currentWidth.indexOf("p"))); 

    // Scroll to the previous image based on the container width
    this.slider?.scrollTo({
      left: currentWidth * ((this.currentCard + 2) % 3), 
      top: 0,
      behavior: "smooth",
    });

    // Updat the current card
    this.currentCard = (this.currentCard + 2) % 3;

    // Update the indicators
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle(
        styles.active,
        index == this.currentCard
      )
    });
  }
}

customElements.define('carousel-slider', Carousel);

export default Carousel;
