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

export default CustomIcon;
