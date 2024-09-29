// server.js

import fs from "fs";
import express from "express"; // Импортируем Express
import cors from "cors"; // Импортируем CORS middleware
import mongoose from "mongoose"; // Импортируем Mongoose
import Anthropic from "@anthropic-ai/sdk"; // Импортируем Anthropic SDK
import dotenv from "dotenv"; // Импортируем dotenv для работы с переменными окружения
import Poems from "./src/models/poems.js"; // Импортируем модель Poems
import QRCode from "qrcode";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { poemsCollectionDeleteCronJob } from "./src/tasks/poems_cron.js";
import cookieParser from "cookie-parser";

// Создаем __dirname и __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: `.env.${process.env.NODE_ENV}` }); // Загружаем переменные окружения из соответствующего .env файла

const app = express(); // Инициализируем приложение Express

app.use(
  cors({
    origin: [
      "http://3.69.178.249",
      "https://3.69.178.249",
      "https://therapoetry.dmytrozuiev.com",
      "http://therapoetry.dmytrozuiev.com",
      "http://localhost:3000",
    ], // Для локальной разработки и продакшена
    methods: ["GET", "POST", "USE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json()); // Включаем JSON-парсинг для входящих запросов

// Use cookie parser middleware
app.use(cookieParser());

// Функция для определения доступных языков на основе файлов в папке translations
function getAvailableLanguages() {
  const translationDir = path.join(__dirname, "src/translations");
  const files = fs.readdirSync(translationDir);

  // Файлы переводов имеют формат 'en.json', 'uk.json', и т.д.
  return files
    .filter((file) => file.endsWith(".json"))
    .map((file) => ({
      code: file.replace(".json", ""), // Языковой код
      name: getLanguageName(file.replace(".json", "")), // Название языка
    }));
}

// Функция для получения отображаемого имени языка по коду
function getLanguageName(code) {
  const languages = {
    en: "English",
    uk: "Українська",
    ru: "Русский",
    es: "Español",
    pt: "Português",
    de: "Deutsch",
    fr: "Français",
    it: "Italiano",
    pl: "Polski",
    hi: "हिन्दी",
    tr: "Türkçe",
    // Добавьте другие языки здесь
  };
  return languages[code] || "Unknown";
}

// Маршрут для рендеринга главной страницы
app.get("/", async (req, res) => {
  // Читаем куки для языка
  const cookieLanguage = req.cookies.appLanguage;
  const browserLanguage =
    req.acceptsLanguages([
      "en",
      "uk",
      "ru",
      "es",
      "pt",
      "de",
      "fr",
      "it",
      "pl",
      "hi",
      "tr",
      "sk",
      "cs",
      "hu",
      "ro",
    ]) || "en"; // Допускаем английский по умолчанию

  // Если куки с языком нет, используем язык браузера или по умолчанию — английский
  let selectedLanguage =
    cookieLanguage || browserLanguage.split("-")[0] || "en";

  // Проверяем, есть ли у нас словарь для этого языка
  const availableLanguages = getAvailableLanguages();
  const languageCodes = availableLanguages.map((lang) => lang.code);

  if (!languageCodes.includes(selectedLanguage)) {
    selectedLanguage = "en"; // Если языка нет, устанавливаем по умолчанию английский
  }

  // Сохраняем язык в куки, если он ещё не установлен
  if (!cookieLanguage) {
    res.cookie("appLanguage", selectedLanguage, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: false,
    }); // Куки на 1 год
  }

  // Загружаем переводы для выбранного языка
  const translations = await import(
    `./src/translations/${selectedLanguage}.json`,
    {
      assert: { type: "json" },
    }
  ).then((module) => module.default);

  // Рендерим страницу с доступными языками и переводами
  res.render("index", {
    translations,
    availableLanguages,
    selectedLanguage,
  });
});

// Middleware to set the selected language based on the cookie
app.use((req, res, next) => {
  const selectedLanguage = req.cookies.appLanguage || "en"; // Default to 'uk' if not set
  req.selectedLanguage = selectedLanguage; // Store in request object for further use
  next();
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, "dist")));

// Настройка для обслуживания статических файлов
app.use(express.static(path.join(__dirname, "public")));

// Set up EJS as view engine
app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "ejs");

console.log("MONGO_URI:", process.env.MONGO_URI); // Логируем MongoDB URI
console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY); // Логируем API-ключ Anthropic
console.log("PORT:", process.env.PORT); // Логируем порт
console.log("API_URL:", process.env.API_URL); // Логируем API URL (по умолчанию http://localhost:3000)

// Используем MONGO_URI из .env файла
const mongoUri = process.env.MONGO_URI;
// Используем ANTHROPIC_API_KEY из .env файла
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

// Подключаемся к MongoDB с использованием Mongoose
mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected with Mongoose"))
  .catch((err) => console.error("MongoDB connection error:", err));

const anthropic = new Anthropic({
  apiKey: anthropicApiKey, // Используем API-ключ из .env файла
});

// start the cron job to delete expired poems
poemsCollectionDeleteCronJob.start();

const appLanguage = function (language) {
  switch (language) {
    case "en":
      return "English";
    case "es":
      return "Spanish";
    case "fr":
      return "French";
    case "de":
      return "German";
    case "it":
      return "Italian";
    case "pt":
      return "Portuguese";
    case "ru":
      return "Russian";
    case "uk":
      return "Ukrainian";
    case "zh":
      return "Chinese";
    case "ja":
      return "Japanese";
    case "ko":
      return "Korean";
    case "ar":
      return "Arabic";
    case "hi":
      return "Hindi";
    case "bn":
      return "Bengali";
    case "pa":
      return "Punjabi";
    case "te":
      return "Telugu";
    case "mr":
      return "Marathi";
    case "ta":
      return "Tamil";
    case "ur":
      return "Urdu";
    case "gu":
      return "Gujarati";
    case "kn":
      return "Kannada";
    case "or":
      return "Odia";
    case "ml":
      return "Malayalam";
    case "vi":
      return "Vietnamese";
    case "th":
      return "Thai";
    case "ms":
      return "Malay";
    case "id":
      return "Indonesian";
    case "tl":
      return "Filipino";
    case "tr":
      return "Turkish";
    case "fa":
      return "Persian";
    case "he":
      return "Hebrew";
    case "el":
      return "Greek";
    case "bg":
      return "Bulgarian";
    case "cs":
      return "Czech";
    case "da":
      return "Danish";
    case "nl":
      return "Dutch";
    case "fi":
      return "Finnish";
    case "hu":
      return "Hungarian";
    case "ga":
      return "Irish";
    case "lt":
      return "Lithuanian";
    case "lv":
      return "Latvian";
    case "mt":
      return "Maltese";
    case "pl":
      return "Polish";
    case "ro":
      return "Romanian";
    case "sk":
      return "Slovak";
    case "sl":
      return "Slovenian";
    case "sv":
      return "Swedish";
    case "hr":
      return "Croatian";
    case "et":
      return "Estonian";
    case "is":
      return "Icelandic";
    case "mk":
      return "Macedonian";
    case "no":
      return "Norwegian";
    case "sq":
      return "Albanian";
    case "sr":
      return "Serbian";
    default:
      return "English";
  }
};

app.post(`/api/get-poem`, async (req, res) => {
  const { language, promptInput, poetryChoice, letters, ageGroup } = req.body;
  const appCurrentLanguage = appLanguage(language);
  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      temperature: 0,
      system: `You are a poet specializing in creating therapeutic poems for individuals with speech difficulties. Depending on the age group (${ageGroup}), your task is to compose a poem that helps either children (if young) or adults (if older) practice pronunciation of specific sounds. The poem should be in the ${poetryChoice} style, incorporating the following letters: ${letters}. It must be engaging, age-appropriate, or suitable for adults, and easy to memorize, supporting their speech therapy goals.

      - The poem and its output, including any headings, should **not** include Markdown syntax (e.g., no hash symbols for headings or other special formatting symbols).
      - Both the headings and the content should be generated in ${appCurrentLanguage}.

      Specific instructions:
      1. **Focus on Pronunciation**: The poem must prominently feature the letters ${letters}, ensuring these sounds appear frequently throughout the poem to help the child practice pronunciation.
      2. **Age Appropriateness**: Ensure the poem is suitable for a child aged ${ageGroup}, using simple yet engaging language. The poem should be fun for the child to listen to and recite.
      3. **Structure and Style**: Adhere strictly to the ${poetryChoice} style, ensuring the structure, rhyme scheme, and rhythm match the chosen form. The poem should be concise, ideally consisting of 8-12 lines (2-3 quatrains), making it easy to memorize.
      4. **Incorporating Theme**: Use the following theme/story as the foundation for the poem: "${promptInput}". Weave in the selected sounds (${letters}) to align the theme with the therapeutic goal.
      5. **Therapeutic Benefit**: The poem should be designed to help children aged ${ageGroup} years practice pronunciation of specific sounds, making it an effective tool for speech therapy.
      
      ### Output Format (no Markdown, bold text, or special formatting):
      1. The heading for the "Created Poem" and the "Short Description" should be generated in ${appCurrentLanguage}.
      2. Created Poem: Present the poem in ${poetryChoice} style in ${appCurrentLanguage}, with a focus on the letters ${letters}.
      3. Short Description: Provide a brief explanation of how the poem incorporates the specific sounds and how it can be used in speech therapy, focusing on its therapeutic benefit for children aged ${ageGroup} years.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: promptInput,
            },
          ],
        },
      ],
    });

    // Предполагается, что API возвращает массив блоков, фильтруем и мапим их для извлечения текстового содержимого
    const textContent = msg.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    res.json({ content: textContent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate poem" });
  }
});

// Маршрут для сохранения поэм
app.post(`/api/save-poems`, async (req, res) => {
  const { userName, poems } = req.body;

  if (!userName || !poems || !Array.isArray(poems) || poems.length === 0) {
    return res.status(400).json({ error: "Invalid data provided." });
  }

  try {
    const newPoemEntry = new Poems({
      userName,
      poems: poems.map((poem) => ({
        language: poem.language,
        styleOfPoem: poem.style,
        prompt: poem.prompt,
        poem: poem.text,
        letters: poem.letters,
        ageGroup: poem.ageGroup,
      })),
    });

    const savedPoemEntry = await newPoemEntry.save();
    res.status(201).json(savedPoemEntry);
  } catch (error) {
    console.error("Error saving poems:", error);
    res.status(500).json({ error: "Failed to save poems to database." });
  }
});

// Маршрут для отображения поэм пользователя
app.get(`/api/poems/:id`, async (req, res) => {
  const { id } = req.params;
  const selectedLanguage = req.selectedLanguage; // Get the selected language from the request object

  try {
    const poemEntry = await Poems.findById(id);
    if (!poemEntry) {
      return res.status(404).send("No poems found for this user.");
    }

    const translations = await import(
      `./dist/translations/${selectedLanguage}.json`,
      {
        assert: { type: "json" },
      }
    ).then((module) => module.default);

    res.render("poems", {
      userName: poemEntry.userName,
      poems: poemEntry.poems,
      apiUrl: process.env.API_URL, // Pass the API URL to the view
      translations, // Pass the translations to the view for rendering
    });
  } catch (error) {
    console.error("Error fetching poems:", error);
    res.status(500).send("An error occurred while fetching the poems.");
  }
});

// Маршрут для генерации QR-кода
app.get(`/api/generate-qr/:id`, async (req, res) => {
  const { id } = req.params;
  const url = `${process.env.API_URL}/api/poems/${id}`;

  try {
    const qrCode = await QRCode.toDataURL(`${url}`);
    res.json({ qrCode });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ error: "Failed to generate QR code." });
  }
});

app.use(`/api/healthcheck`, (req, res) => {
  res.status(200).send("Server is running");
});

// This should be the last route, to serve the frontend for any unmatched routes
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });

const port = process.env.PORT || 3000; // Устанавливаем порт из переменной окружения PORT или 3000 по умолчанию
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
