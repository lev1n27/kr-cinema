const burger = document.querySelector(".burger");
const menu = document.querySelector(".menu");

function closeMenu() {
  if (!burger || !menu) return;
  burger.setAttribute("aria-expanded", "false");
  menu.classList.remove("menu--open");
}

if (burger && menu) {
  burger.addEventListener("click", () => {
    const isOpen = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!isOpen));
    menu.classList.toggle("menu--open", !isOpen);
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

document.querySelectorAll(".rail-wrap").forEach((wrapper) => {
  const rail = wrapper.querySelector(".rail");
  const previous = wrapper.querySelector("[data-rail-prev]");
  const next = wrapper.querySelector("[data-rail-next]");
  if (!rail) return;

  const scroll = (direction) => {
    rail.scrollBy({
      left: direction * rail.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  previous?.addEventListener("click", () => scroll(-1));
  next?.addEventListener("click", () => scroll(1));
});

function markInvalidFields(form) {
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.setAttribute("aria-invalid", String(!field.checkValidity()));
  });
}

function prepareForm(form) {
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    const clearError = () => {
      if (field.checkValidity()) field.removeAttribute("aria-invalid");
    };
    field.addEventListener("input", clearError);
    field.addEventListener("change", clearError);
  });
}

const dialog = document.querySelector("#subscribe-dialog");
const dialogForm = document.querySelector("#dialog-form");
const dialogSuccess = document.querySelector("#dialog-success");

if (dialog && dialogForm && dialogSuccess) {
  prepareForm(dialogForm);

  document.querySelectorAll("[data-movie]").forEach((button) => {
    button.addEventListener("click", () => {
      const movie = button.dataset.movie || "";
      document.querySelector("#dialog-movie-name").textContent = movie;
      document.querySelector("#dialog-movie-meta").textContent = button.dataset.meta || "";
      document.querySelector("#selected-movie").value = movie;

      const image = document.querySelector("#dialog-movie-img");
      image.src = button.dataset.image || "images/dune2.jpg";
      image.alt = `Постер: ${movie}`;

      dialogForm.hidden = false;
      dialogSuccess.hidden = true;
      dialog.showModal();
    });
  });

  dialog.querySelectorAll("[data-dialog-close]").forEach((button) => {
    button.addEventListener("click", () => dialog.close());
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", () => {
    dialogForm.reset();
    dialogForm.querySelectorAll("[aria-invalid]").forEach((field) => {
      field.removeAttribute("aria-invalid");
    });
  });

  dialogForm.addEventListener("submit", (event) => {
    event.preventDefault();
    markInvalidFields(dialogForm);
    if (!dialogForm.checkValidity()) {
      dialogForm.reportValidity();
      return;
    }

    const name = document.querySelector("#dialog-name").value.trim();
    const movie = document.querySelector("#selected-movie").value;
    document.querySelector("#dialog-success-text").textContent =
      `${name}, подписка активна. Теперь вы можете смотреть «${movie}».`;
    dialogForm.hidden = true;
    dialogSuccess.hidden = false;
  });
}

const subscribeForm = document.querySelector("#subscribe-form");
const subscribeSuccess = document.querySelector("#subscribe-success");
const planSelect = document.querySelector("#subscribe-plan");
const tariffs = document.querySelectorAll(".tariff[data-plan]");

if (subscribeForm && subscribeSuccess && planSelect) {
  prepareForm(subscribeForm);

  tariffs.forEach((tariff) => {
    tariff.tabIndex = 0;
    tariff.setAttribute("role", "button");
    tariff.setAttribute("aria-label", `Выбрать тариф ${tariff.querySelector(".tariff__name").textContent}`);

    const selectTariff = () => {
      planSelect.value = tariff.dataset.plan;
      planSelect.removeAttribute("aria-invalid");
      tariffs.forEach((item) => item.classList.toggle("tariff--picked", item === tariff));
      subscribeForm.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    tariff.addEventListener("click", selectTariff);
    tariff.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectTariff();
      }
    });
  });

  planSelect.addEventListener("change", () => {
    tariffs.forEach((tariff) => {
      tariff.classList.toggle("tariff--picked", tariff.dataset.plan === planSelect.value);
    });
  });

  subscribeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    markInvalidFields(subscribeForm);
    if (!subscribeForm.checkValidity()) {
      subscribeForm.reportValidity();
      return;
    }

    const name = document.querySelector("#subscribe-name").value.trim();
    const plan = planSelect.options[planSelect.selectedIndex].text;
    document.querySelector("#subscribe-success-text").textContent =
      `${name}, вы выбрали тариф «${plan}». Подписка успешно оформлена.`;
    subscribeForm.hidden = true;
    subscribeSuccess.hidden = false;
    subscribeSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

const phoneInput = document.querySelector("#subscribe-phone");

if (phoneInput) {
  phoneInput.addEventListener("input", () => {
    let digits = phoneInput.value.replace(/\D/g, "");
    if (!digits) return;
    if (digits[0] === "8") digits = `7${digits.slice(1)}`;
    if (digits[0] !== "7") digits = `7${digits}`;
    digits = digits.slice(0, 11);

    let formatted = "+7";
    if (digits.length > 1) formatted += ` (${digits.slice(1, 4)}`;
    if (digits.length >= 4) formatted += ")";
    if (digits.length > 4) formatted += ` ${digits.slice(4, 7)}`;
    if (digits.length > 7) formatted += `-${digits.slice(7, 9)}`;
    if (digits.length > 9) formatted += `-${digits.slice(9, 11)}`;
    phoneInput.value = formatted;
  });
}

const searchInput = document.querySelector(".search__input");
const query = new URLSearchParams(window.location.search).get("q")?.trim();
const normalizedQuery = query?.toLocaleLowerCase("ru") || "";
const filtersPanel = document.querySelector(".filters");
const filterSelects = [...document.querySelectorAll("[data-filter-key]")];
const sortSelect = document.querySelector("[data-sort]");
const quickFilterButtons = [...document.querySelectorAll("[data-quick-filter]")];
const resetFiltersButton = document.querySelector("[data-filters-reset]");
const filtersEmpty = document.querySelector("[data-filters-empty]");
const catalogGroups = [...document.querySelectorAll(".film-group")].filter((group) => {
  return group.querySelector(".films");
});
const pageNote = document.querySelector(".page-head__note");
const initialPageNote = pageNote?.textContent || "";
const quickFilters = new Set();
const cardDetails = new WeakMap();

if (searchInput && query) searchInput.value = query;

catalogGroups.forEach((group) => {
  group.querySelectorAll(".film-card").forEach((card, index) => {
    const info = card.querySelector(".film-card__info")?.textContent || "";
    const age = info.match(/(\d+)\+/)?.[1];
    cardDetails.set(card, {
      index,
      title: card.querySelector(".film-card__name")?.textContent.trim() || "",
      year: Number.parseInt(info, 10) || 0,
      rating: Number.parseFloat(
        (card.querySelector(".film-card__score")?.textContent || "0")
          .replace("★", "")
          .trim()
          .replace(",", "."),
      ),
      age: age === undefined ? null : Number(age),
      isNew: Boolean(card.querySelector(".film-card__label--new")),
    });
  });
});

function matchesFilters(card, group, selectedFilters) {
  const details = cardDetails.get(card);
  const countries = (card.dataset.country || "").split(" ");

  if (normalizedQuery && !card.textContent.toLocaleLowerCase("ru").includes(normalizedQuery)) {
    return false;
  }
  if (selectedFilters.genre && selectedFilters.genre !== "all" && group.id !== selectedFilters.genre) {
    return false;
  }
  if (selectedFilters.country && selectedFilters.country !== "all" && !countries.includes(selectedFilters.country)) {
    return false;
  }
  if (selectedFilters.year && selectedFilters.year !== "all" && details.year !== Number(selectedFilters.year)) {
    return false;
  }
  if (selectedFilters.age && selectedFilters.age !== "all" && details.age !== Number(selectedFilters.age)) {
    return false;
  }
  if (selectedFilters.rating && selectedFilters.rating !== "all" && details.rating < Number(selectedFilters.rating)) {
    return false;
  }
  if (quickFilters.has("new") && !details.isNew) return false;
  if (quickFilters.has("top") && details.rating < 8.5) return false;
  if (quickFilters.has("little") && details.age !== 0) return false;
  return true;
}

function sortCards(cards) {
  const sorting = sortSelect?.value || "popular";
  return cards.sort((first, second) => {
    const a = cardDetails.get(first);
    const b = cardDetails.get(second);
    if (sorting === "rating") return b.rating - a.rating || a.index - b.index;
    if (sorting === "newest") return b.year - a.year || a.index - b.index;
    if (sorting === "oldest") return a.year - b.year || a.index - b.index;
    if (sorting === "title") return a.title.localeCompare(b.title, "ru");
    return a.index - b.index;
  });
}

function updateCatalog() {
  const selectedFilters = Object.fromEntries(
    filterSelects.map((select) => [select.dataset.filterKey, select.value]),
  );
  const hasFilters = Object.values(selectedFilters).some((value) => value !== "all") || quickFilters.size > 0;
  let matches = 0;

  catalogGroups.forEach((group) => {
    const list = group.querySelector(".films");
    const cards = [...list.querySelectorAll(".film-card")];
    let visibleCards = 0;

    sortCards(cards).forEach((card) => {
      list.append(card);
      const isVisible = matchesFilters(card, group, selectedFilters);
      card.hidden = !isVisible;
      if (isVisible) visibleCards += 1;
    });

    group.hidden = visibleCards === 0;
    matches += visibleCards;
  });

  if (filtersEmpty) filtersEmpty.hidden = matches > 0;
  if (resetFiltersButton) {
    resetFiltersButton.disabled = !hasFilters && (!sortSelect || sortSelect.value === "popular");
  }
  if (!pageNote) return;
  pageNote.setAttribute("aria-live", "polite");
  if (query) {
    pageNote.textContent = `По запросу «${query}» найдено: ${matches}`;
  } else if (hasFilters) {
    pageNote.textContent = `Показано: ${matches}`;
  } else {
    pageNote.textContent = initialPageNote;
  }
}

filterSelects.forEach((select) => {
  select.addEventListener("change", updateCatalog);
});

sortSelect?.addEventListener("change", updateCatalog);

quickFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.quickFilter;
    if (quickFilters.has(name)) quickFilters.delete(name);
    else quickFilters.add(name);
    button.setAttribute("aria-pressed", String(quickFilters.has(name)));
    updateCatalog();
  });
});

resetFiltersButton?.addEventListener("click", () => {
  filterSelects.forEach((select) => {
    select.value = "all";
  });
  if (sortSelect) sortSelect.value = "popular";
  quickFilters.clear();
  quickFilterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
  });
  updateCatalog();
});

if (filtersPanel || query) updateCatalog();
