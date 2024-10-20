import styles from "./Navigation.module.css";
import { createIcon } from "../CustomIcon";
import userAvatar from "../../assets/user-avatar.svg";
import { primaryNav as pNavRoutes, secondaryNav as sNavRoutes } from "../../mock-data.json";

const icons = {
  home: createIcon("home").outerHTML,
  messages: createIcon("messages").outerHTML,
  notifications: createIcon("notifications").outerHTML,
  settings: createIcon("settings").outerHTML,
  profile: createIcon("profile").outerHTML,
};

export default function Navigation() {
  // The main navigation container
  const container = document.createElement("div");
  container.classList.add(styles.navigation);

  // The logo
  container.innerHTML = `
    <a href="/" id="logo">
      <div class="${styles.logo}">
        <span role="img" aria-label="AlphaTwelve logo"></span>
      </div>
    </a>
  `;


  // The user profile
  const userProfile = document.createElement("a");
  userProfile.classList.add(styles["user-profile"]);
  userProfile.setAttribute("href", "/profile");
  userProfile.innerHTML = `
    <div class=${styles["profile-small"]}>
      ${icons.profile}
      <span>Profile</span>
    </div>
    <div class=${styles["profile-large"]}>
      <img scr="" width="32px" height="32px" />
      <div>
        <span>Rudra Devi</span>
        <span>rudra.devi@gmail.com</span>
      </div>
    </div>
  `;
  userProfile.querySelector("img")!.src = userAvatar;


  // The collapse button
  const collapseButton = document.createElement("li");
  collapseButton.innerHTML = `
    <button class="${styles["collapse-button"]}">
      <iconify-icon icon="mdi:chevron-double-left"></iconify-icon>
      <span class="${styles["nav-text"]}">Collapse</span>
    </button>
  `;
  collapseButton.addEventListener("click", () => {
    container.classList.toggle(styles.collapsed);
  });


  // The darkmode toggle
  const darkmodeToggle = document.createElement("li");
  // darkmodeToggle.classList.add()
  darkmodeToggle.innerHTML = `
    <button id="darkmode-toggle">
      <span role="checkbox" class="${styles["darkmode-toggle"]}"></span>
      <span class="${styles["nav-text"]}">Dark mode</span>
    </button>
  `;
  darkmodeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    darkmodeToggle.classList.toggle(styles.active);
  });


  // The menu button
  const menuButton = document.createElement("button");
  menuButton.classList.add(styles["menu-button"]);
  menuButton.innerHTML = `
    <iconify-icon icon="solar:hamburger-menu-broken"></iconify-icon>
    <iconify-icon icon="solar:close-circle-line-duotone"></iconify-icon>
  `;
  menuButton.addEventListener("click", toggleMenu);


  // The primary and secondary navigations
  const navs = document.createElement("nav");
  navs.innerHTML = `
    <ul class="${styles["primary-nav"]}">
      ${createNavLinks("primary").innerHTML}
    </ul>
    <ul class="${styles["secondary-nav"]}">
      ${createNavLinks("secondary").innerHTML}
    </ul>
  `;


  // Control buttons stay with the secondary nav since they get hidden on smaller screens
  navs.querySelector(`.${styles["secondary-nav"]}`)?.append(collapseButton, darkmodeToggle);
  navs.append(userProfile);

  container.append(navs, menuButton);


  const links = Array.from(container.getElementsByTagName("a"));
  links.forEach(link => {  
    link.addEventListener("click", function (event: MouseEvent) {
      event.preventDefault();
      
      // Get new route
      const targetId = link!.getAttribute('href')!.substring(1);

      // Create event for navigation
      const navEvent = new CustomEvent("nav", {
        bubbles: true,
        detail: { route: targetId }
      });
      history.pushState({ page: targetId }, targetId, `/${targetId}`);
      link.dispatchEvent(navEvent);

      // Set active link
      links.forEach(_link => _link.classList.toggle(
        styles.active,
        _link.getAttribute('href')!.substring(1) === targetId && _link.id != "logo"
      ));

      // Close menu if it is open
      if (container.classList.contains(styles.expanded)) toggleMenu();
    });
  });


  // Set menu open classes
  function toggleMenu () {
    container.classList.toggle(styles.expanded);
    document.body.classList.toggle("menu-open");
  }

  return container;
}

// Create list of navlinks
function createNavLinks(type: "primary" | "secondary") {
  const container = document.createElement("div");
  const routes = type === "primary" ? pNavRoutes : sNavRoutes;
  const length = routes.length;

  for (let i = 0; i < length; i++) {
    const route = routes[i];
    const isHome = route.link === "home";
    const icon = route.custom ?
      `${icons[route.icon as keyof typeof icons]}`
      : `<iconify-icon icon="${route.icon}"></iconify-icon>`
    ;

    const navItem = document.createElement("li");
    navItem.innerHTML = `
      <a href="/${
        isHome ? "" : route.link
      }" class="${
        window.location.pathname === `/${route.link}` ||
        (isHome && window.location.pathname === "/") ? styles.active : ""
      } ${styles[route.link]}">
        ${icon}
        <span class="${styles["nav-text"]}">${route.text}</span>
      </a>
    `;
    container.appendChild(navItem);
  }

  return container;
}

