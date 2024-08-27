import "./style.css"; // Подключаем стили
// import QRCode from "qrcode";

// Определяем URL API
const apiUrl = process.env.API_URL || "http://localhost:3000";
console.log(apiUrl);

let userNameInput = ""; // Переменная для хранения имени пользователя
let currentAgeGroup = ""; // Переменная для хранения текущей возрастной группы
let currentPrompt = ""; // Переменная для хранения текущего промпта
let currentPoem = ""; // Переменная для хранения текущего стихотворения
let currentPoemStyleText = ""; // Переменная для хранения текста текущего стиля стихотворения
let currentPoemStyle = ""; // Переменная для хранения стиля текущего стихотворения
let poemArray = []; // Массив для хранения стихотворений
let selectedLetters = []; // Массив для хранения выбранных букв
let selectedLettersString = ""; // Строка для хранения выбранных букв

// Получаем ссылки на элементы DOM
const nameSection = document.getElementById("nameSection");
const userName = document.getElementById("userName");
const saveBtn = document.getElementById("saveBtn");
const poetrySection = document.getElementById("poetrySection");
const greeting = document.getElementById("greeting");
const ageGroupSelect = document.getElementById("ageGroup");
const lettersGrid = document.querySelectorAll(".alphabet-grid .letter");
const poetryForm = document.getElementById("poetryForm");
const poetryFormContainer = document.querySelector(".poetry-form-container");
const prompt = document.getElementById("prompt");
const storyOutput = document.getElementById("storyOutput");
const tellStoryBtn = document.getElementById("tellStory");
const finishBtn = document.getElementById("finishBtn");

document.addEventListener("DOMContentLoaded", () => {
  const tooltip = document.querySelector(".tooltip");
  const tooltipText = tooltip.querySelector(".tooltiptext");

  tooltip.addEventListener("click", (event) => {
    tooltipText.classList.toggle("show"); // Переключаем видимость окна
    event.stopPropagation(); // Останавливаем распространение события клика
  });

  // Закрываем окно при клике вне его и прокручиваем страницу вверх
  document.addEventListener("click", (event) => {
    if (!tooltip.contains(event.target)) {
      tooltipText.classList.remove("show");
    }
  });

  // Альтернативный метод с focusout
  tooltip.addEventListener("focusout", () => {
    tooltipText.classList.remove("show");
  });
});

lettersGrid.forEach((letter) => {
  letter.addEventListener("click", function () {
    const letterValue = this.textContent;

    // Проверка, выбрана ли буква уже
    if (this.classList.contains("selected")) {
      this.classList.remove("selected");
      selectedLetters = selectedLetters.filter((l) => l !== letterValue);
    } else {
      this.classList.add("selected");
      selectedLetters.push(letterValue);
    }
  });
});

selectedLettersString = selectedLetters.join(", ");

// Обработчик события для сохранения имени
saveBtn.addEventListener("click", () => {
  userNameInput = userName.value; // Сохраняем введенное имя пользователя

  if (userNameInput) {
    // Плавное скрытие секции nameSection
    nameSection.classList.remove("show");
    nameSection.classList.add("hide");
    poetryForm.value = ""; // Сброс значения формы
    ageGroupSelect.value = ""; // Сброс значения селектора

    setTimeout(() => {
      nameSection.style.display = "none"; // Полностью скрываем секцию после завершения анимации
      nameSection.classList.remove("hide");

      // Плавное отображение секции poetrySection
      poetrySection.style.display = "block";
      setTimeout(() => {
        poetrySection.classList.add("show"); // Активируем анимацию для показа
      }, 10); // Небольшая задержка для корректного применения display: block

      greeting.innerHTML = `Привіт, ${userNameInput},<br>Розкажи свою історію 👂... <br>і я перетворю її на вірш.`;
    }, 500); // Время задержки должно совпадать с длительностью анимации (0.5s в CSS)
  }
});

const isEmptySelectorsValues = function () {
  let result = false;

  if (poetryForm.value === "") {
    storyOutput.innerText = "Будь ласка, оберіть форму вірша.";
    result = true;
  }
  if (prompt.value === "") {
    storyOutput.innerText = "Будь ласка, введіть запит.";
    result = true;
  }
  if (ageGroupSelect.value === "") {
    storyOutput.innerText = "Будь ласка, оберіть вікову групу.";
    result = true;
  }
  if (selectedLetters.length === 0) {
    storyOutput.innerText = "Будь ласка, оберіть принаймні одну букву.";
    result = true;
  }
  return result;
};

const sameSelectorsValues = function () {
  let result = false;

  if (
    currentPrompt === prompt.value &&
    currentPoemStyle === poetryForm.value &&
    currentPoemStyleText === poetryForm.selectedOptions[0].textContent &&
    currentAgeGroup === ageGroupSelect.value &&
    selectedLettersString === selectedLetters.join(", ")
  ) {
    storyOutput.innerText =
      "Змініть запит або форму вірша для генерації нового вірша.";
    result = true;
  }
  return result;
};

const isPreviousPoemEmpty = function () {
  let result = false;

  if (
    currentPoem === "" &&
    currentPoemStyle === "" &&
    currentPoemStyleText === "" &&
    currentPrompt === "" &&
    currentAgeGroup === "" &&
    selectedLettersString === ""
  ) {
    storyOutput.innerText = "Будь ласка, спочатку згенеруйте вірш.";
    result = true;
  }
  return result;
};

tellStoryBtn.addEventListener("click", async () => {
  // Проверка на пустые значения селекторов и поля ввода
  if (isEmptySelectorsValues()) return;

  // Проверка на одинаковые значения селекторов с предыдущими
  if (sameSelectorsValues()) return;

  // Проверка на наличие предыдущего стихотворения
  if (isPreviousPoemEmpty() != true) {
    // Сохраняем предыдущее стихотворение в массив
    poemArray.push({
      text: currentPoem,
      style: currentPoemStyleText,
      prompt: currentPrompt,
      letters: selectedLettersString,
      ageGroup: currentAgeGroup,
    });
    currentPoem = "";
  }
  currentAgeGroup = ageGroupSelect.value;
  selectedLettersString = selectedLetters?.join(", ");
  currentPoemStyle = poetryForm.value;
  currentPoemStyleText = poetryForm.selectedOptions[0].textContent;
  currentPrompt = prompt.value;
  if (currentPrompt && currentPoemStyle && storyOutput) {
    storyOutput.innerText = "Ваш вірш генерується...";

    try {
      const response = await fetch(`${apiUrl}/api/get-poem`, {
        // Полный URL с портом
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptInput: currentPrompt,
          poetryChoice: currentPoemStyle,
          ageGroup: currentAgeGroup,
          letters: selectedLettersString,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.content) {
        // If data.content exists - save it to array of poems
        currentPoem = data.content;
      }
      storyOutput.innerText = data.content || "Sorry, no response generated.";
    } catch (error) {
      storyOutput.innerText = "Sorry, something went wrong. Please try again.";
      console.error("Error:", error);
    }
  }
});

// Обработчик события для завершения сессии
finishBtn?.addEventListener("click", async () => {
  if (
    currentPoem !== "" &&
    currentPoemStyle !== "" &&
    currentPrompt !== "" &&
    userNameInput !== "" &&
    currentAgeGroup !== "" &&
    selectedLettersString !== "" &&
    currentPoemStyleText !== ""
  ) {
    poemArray.push({
      text: currentPoem,
      style: currentPoemStyleText,
      prompt: currentPrompt,
      letters: selectedLettersString,
      ageGroup: currentAgeGroup,
    });
    currentPoem = "";
    currentPoemStyle = "";
    currentPoemStyleText = "";
    currentPrompt = "";
    selectedLetters = [];
    selectedLettersString = "";
    currentAgeGroup = "";
  }

  if (userNameInput && poemArray.length > 0) {
    try {
      const response = await fetch(`${apiUrl}/api/save-poems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: userNameInput,
          poems: poemArray,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save poems to database.");
      }

      const result = await response.json();
      console.log("Poems saved successfully:", result);

      // Генерация URL для страницы с поэмами
      const poemsPageUrl = `${apiUrl}/api/poems/${result._id}`;

      // Запрос на генерацию QR-кода
      const qrCodeResponse = await fetch(
        `${apiUrl}/api/generate-qr/${result._id}`
      );
      const qrCodeData = await qrCodeResponse.json();

      if (qrCodeData.qrCode) {
        // Создаем элемент всплывающего окна
        const popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.top = "50%";
        popup.style.left = "50%";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.padding = "20px";
        popup.style.backgroundColor = "#fff";
        popup.style.border = "1px solid #ccc";
        popup.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
        popup.style.borderRadius = "10px";
        popup.style.zIndex = "1000";
        popup.style.textAlign = "center";
        popup.style.maxWidth = "90%";
        popup.style.width = "400px";
        popup.style.boxSizing = "border-box";

        popup.innerHTML = `
           <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Скануйте цей QR-код, щоб переглянути свої вірші:</h2>
           <img src="${qrCodeData.qrCode}" alt="QR Code" style="margin-bottom: 1rem;">
           <p><strong>Або відвідайте цей URL:</strong> <br><br><a href="${poemsPageUrl}" target="_blank" style="color: #007bff; text-decoration: none;">Ваша сторінка з віршами</a></p>
           <button id="closePopup" style="margin-top: 1rem; padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Закрити</button>
           `;

        // Добавляем обработчик для закрытия всплывающего окна
        document.body.appendChild(popup);
        document.getElementById("closePopup").addEventListener("click", () => {
          document.body.removeChild(popup);
        });
      }
      // Очистка массива после успешного сохранения
      poemArray = [];
      userNameInput = "";
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Плавное скрытие секции poetrySection
  poetrySection.classList.remove("show");
  poetrySection.classList.add("hide");

  setTimeout(() => {
    poetrySection.style.display = "none"; // Полностью скрываем секцию после завершения анимации
    poetrySection.classList.remove("hide");

    // Плавное отображение секции nameSection
    nameSection.style.display = "block";
    setTimeout(() => {
      nameSection.classList.add("show"); // Активируем анимацию для показа
    }, 10); // Небольшая задержка для корректного применения display: block

    // Сброс значений
    userName.value = "";
    prompt.value = "";
    storyOutput.innerText = "";
    poetryForm.value = "";
    ageGroupSelect.value = "";
    lettersGrid.forEach((letter) => {
      letter.classList.remove("selected");
    });
  }, 500); // Время задержки должно совпадать с длительностью анимации (0.5s в CSS)
});
