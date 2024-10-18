class CustomIcon extends HTMLElement {

  constructor() {
    super();
  }

  // Create the element when it gets connected to the DOM
  connectedCallback() {

    const shadow = this.attachShadow({ mode: 'open' });

    const content = this.getAttribute("data-content")?.split(","); // data-content is an array of path definitions
    const scale = this.getAttribute("data-scale") || "14";

    // Create the SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${scale} ${scale}`);
    svg.setAttribute("fill", "none");

    const length = content!.length;

    // Add the paths to the svg
    for (let i = 0; i < length; i++) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", content![i]);
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("stroke-width", "1.5");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");

      svg.appendChild(path);
    }

    shadow.appendChild(svg);
  }
}

customElements.define('custom-icon', CustomIcon);

const icons = {
  info: {
    pathDefinitions: [
      "M8 8.66666V9.99999",
      "M8.33333 5.99999C8.33333 6.18409 8.1841 6.33332 8 6.33332C7.81591 6.33332 7.66667 6.18409 7.66667 5.99999C7.66667 5.81589 7.81591 5.66666 8 5.66666C8.1841 5.66666 8.33333 5.81589 8.33333 5.99999Z",
      "M12.8333 7.99999C12.8333 10.6694 10.6694 12.8333 8 12.8333C5.33062 12.8333 3.16667 10.6694 3.16667 7.99999C3.16667 5.33061 5.33062 3.16666 8 3.16666C10.6694 3.16666 12.8333 5.33061 12.8333 7.99999Z",
    ],
    scale: 16,
  },
  rate: {
    pathDefinitions: [
      "M8.5 7.16667V1.5H2.83333M8.33333 1.66667L1.5 8.5",
    ],
    scale: 10,
  },
}

export function createIcon(icon: keyof typeof icons) {
  const newIcon = new CustomIcon();
  if (icons[icon]) {
    newIcon.setAttribute("data-content", icons[icon].pathDefinitions.join());
    if (icons[icon].scale) newIcon.setAttribute("data-scale", `${icons[icon].scale}`);
  }
  return newIcon;
}

export default CustomIcon;
