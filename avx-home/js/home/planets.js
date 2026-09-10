function qsa(root, sel) {
  return Array.from(root.querySelectorAll(sel));
}

export function initPlanets() {
  const nav = document.querySelector(".home__planets");
  if (!nav) return { destroy() {} };

  const links = qsa(nav, ".planet");
  const createdLabels = [];

  for (const link of links) {
    const label = link.getAttribute("data-label") || "";
    link.setAttribute("aria-label", label || "Sección");

    let labelEl = link.querySelector(".planet__label");
    if (!labelEl) {
      labelEl = document.createElement("span");
      labelEl.className = "planet__label";
      labelEl.textContent = label;
      labelEl.setAttribute("data-index", link.getAttribute("data-index") || "");
      link.appendChild(labelEl);
      createdLabels.push(labelEl);
    } else {
      labelEl.textContent = label;
      labelEl.setAttribute("data-index", link.getAttribute("data-index") || "");
    }
  }

  function destroy() {
    for (const el of createdLabels) el.remove();
  }

  return { destroy };
}
