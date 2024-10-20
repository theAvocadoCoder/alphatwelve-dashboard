import { customIcons as icons } from "../mock-data.json";

class CustomIcon extends HTMLElement {

  constructor() {
    super();
  }

  private shadowRootInstance: ShadowRoot | null = null;

  // Create the element when it gets connected to the DOM
  connectedCallback() {

    if (this.shadowRootInstance) return;

    this.shadowRootInstance = this.attachShadow({ mode: 'open' });

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

    this.shadowRootInstance.appendChild(svg);
  }
}

customElements.define('custom-icon', CustomIcon);


export function createIcon(icon: keyof typeof icons) {
  const newIcon = new CustomIcon();
  if (icons[icon]) {
    newIcon.setAttribute("data-content", icons[icon].pathDefinitions.join());
    if (icons[icon].scale) newIcon.setAttribute("data-scale", `${icons[icon].scale}`);
  }
  return newIcon;
}

export default CustomIcon;
