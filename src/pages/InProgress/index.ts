import styles from "./InProgress.module.css";

export default function InProgress() {
  const container = document.createElement("div")
  container.id = "in-progress";
  container.classList.add(styles["container"]);
  container.innerHTML = `
    <h1>We're working on it</h1>
    <p>We're not quite finished with this page</p>
    <p>Would you like to <a href="/">go to your dashboard</a> instead?</p>
  `

  container.getElementsByTagName("a")[0].addEventListener("click", function (event: MouseEvent) {
    event.preventDefault();

    const popState = new Event("popstate", { bubbles: true });
    history.pushState({ page: "home" }, "home", "/");
    this.dispatchEvent(popState);
  })

  return container;
}
