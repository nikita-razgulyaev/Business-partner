// Фильтрация каталога
document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document
            .querySelectorAll(".filter-btn")
            .forEach((b) => b.classList.remove("filter-btn--active"));
        btn.classList.add("filter-btn--active");
        const filter = btn.getAttribute("data-filter");
        document.querySelectorAll(".product-card").forEach((card) => {
            const cat = card.getAttribute("data-category");
            card.style.display =
                filter === "all" || cat === filter ? "block" : "none";
        });
    });
});

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href === "#") return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

// === Обработка формы ===
const form = document.getElementById("consult-form");
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const modalIcon = document.getElementById("modal-icon");
const modalText = document.getElementById("modal-text");

// Закрытие модалки
modalClose.addEventListener("click", () => {
    modal.classList.remove("show");
    setTimeout(() => {
        modal.style.display = "none";
    }, 300);
});

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Отправка...";

    // Сброс ошибок
    form.querySelectorAll(".consult__form-field").forEach((field) => {
        field.classList.remove("invalid");
    });

    const name = form.name.value.trim();
    const contactValue = form.contact
        ? form.contact.value.trim()
        : form.email
        ? form.email.value.trim()
        : "";
    const agreement = form.agreement.checked;

    let hasError = false;

    // Проверка имени
    if (!name || name.length < 2) {
        form.querySelector('[name="name"]')
            .closest(".consult__form-field")
            .classList.add("invalid");
        hasError = true;
    }

    // Проверка контакта (телефон или email)
    if (contactToggle.checked) {
        // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactValue)) {
            contactField.classList.add("invalid");
            hasError = true;
        }
    } else {
        // Телефон — универсальная проверка для РФ
        const digits = contactValue.replace(/\D/g, ""); // +7 999 123 45 67 → 79991234567

        if (digits.length !== 11 || !["7", "8"].includes(digits[0])) {
            contactField.classList.add("invalid");
            hasError = true;
        }
    }

    // Проверка согласия
    if (!agreement) {
        form.querySelector(".consult__agreement-field").classList.add(
            "invalid"
        );
        hasError = true;
    }

    if (hasError) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        return;
    }

    // Подготовка данных для отправки
    const formData = new FormData();
    formData.append("name", name);

    if (contactToggle.checked) {
        formData.append("email", contactValue);
    } else {
        // Отправляем номер как есть (с +7, пробелами и т.п. — серверу обычно так удобнее)
        formData.append("phone", contactValue);
    }

    if (form.message?.value.trim()) {
        formData.append("message", form.message.value.trim());
    }
    formData.append("agreement", "Да");

    try {
        const response = await fetch(form.action, {
            method: "POST",
            body: formData,
            headers: { Accept: "application/json" },
        });

        if (response.ok) {
            showModal(
                "success",
                "Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время."
            );
            form.reset();
            contactToggle.checked = false;
            contactInput.type = "tel";
            contactInput.placeholder = "Телефон";
            contactInput.name = "contact";
            contactError.textContent = "Введите корректный номер телефона";
        } else {
            throw new Error("Ошибка сервера");
        }
    } catch (error) {
        showModal(
            "error",
            "Произошла ошибка при отправке. Попробуйте позже или позвоните нам."
        );
        console.error(error);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

// Функция показа модалки
function showModal(type, message) {
    modalIcon.className = "modal__icon";
    modalIcon.classList.add(type === "success" ? "success" : "error");

    if (type === "success") {
        modalIcon.innerHTML = `
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" fill="none" stroke="white" stroke-width="4"/>
                <path d="M18 32 L28 42 L46 24" stroke="white" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
    } else {
        modalIcon.innerHTML = `
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" fill="none" stroke="white" stroke-width="4"/>
                <path d="M32 18 L32 36 M32 44 L32 46" stroke="white" stroke-width="5" stroke-linecap="round"/>
            </svg>`;
    }

    modalText.textContent = message;
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("show"), 10);
}

// === Переключение между телефоном и email ===
const contactToggle = document.getElementById("contact-toggle");
const contactInput = document.getElementById("contact-input");
const contactError = document.getElementById("contact-error");
const contactField = document.getElementById("contact-field");

contactToggle.addEventListener("change", function () {
    if (this.checked) {
        contactInput.type = "email";
        contactInput.placeholder = "Email";
        contactInput.name = "email";
        contactError.textContent = "Введите корректный email";
    } else {
        contactInput.type = "tel";
        contactInput.placeholder = "Телефон";
        contactInput.name = "contact";
        contactError.textContent = "Введите корректный номер телефона";
    }
    contactInput.value = "";
    contactField.classList.remove("invalid");
});
