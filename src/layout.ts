import Navigation from "@components/Navigation";

export default function template() {
  const container = document.createDocumentFragment();

  const content = document.createElement("main");
  content.id = "content";
  content.classList.add("content");

  container.append(Navigation(), content);

  return container;
}
