// server.js

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

const router = "/portfolio/therapoetry";

// Создаем __dirname и __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: `.env.${process.env.NODE_ENV}` }); // Загружаем переменные окружения из соответствующего .env файла

const app = express(); // Инициализируем приложение Express

app.use(
  cors({
    origin: [
      "52.58.184.185",
      "52.58.184.185/portfolio/therapoetry",
      "http://dmytrozuiev.com/portfolio/therapoetry",
      "http://localhost:3000",
    ], // Для локальной разработки и продакшена
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json()); // Включаем JSON-парсинг для входящих запросов

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

app.post(`${router}/api/get-poem`, async (req, res) => {
  const { promptInput, poetryChoice, letters, ageGroup } = req.body;
  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      temperature: 0,
      system: `You are a poet specializing in creating therapeutic poems for children with speech difficulties. Your task is to compose a poem that helps children aged ${ageGroup} years practice the pronunciation of specific sounds. The poem should be written in the ${poetryChoice} style, with an emphasis on incorporating the following letters: ${letters}. The poem should be engaging, age-appropriate, and easy to memorize, ensuring that it supports the child's speech therapy.

        Language Instructions:
        - The poem must be generated in Ukrainian.

        Here are your specific instructions:
        1. Focus on Pronunciation: The poem must include the letters ${letters} multiple times, ensuring that these sounds are prominently featured throughout the poem. This will help the child practice and improve their pronunciation of these particular sounds.
        2. Age Appropriateness: The content, language, and themes of the poem must be suitable for a child aged ${ageGroup}. The language should be simple yet engaging, and the poem should be enjoyable for the child to listen to and recite.
        3. Structure and Style: The poem should strictly follow the ${poetryChoice} style. Ensure that the structure, rhyme scheme, and rhythm are consistent with the chosen form. The poem should be concise, ideally consisting of 8-12 lines (2-3 quatrains), making it easy for the child to memorize and repeat.
        4. Use of Theme: Incorporate the following theme or story as the basis of the poem: "${promptInput}". The theme should be used creatively to weave in the chosen sounds and make the poem meaningful and engaging for the child.

        Present the result in the following format:
        1. Створений вірш
        2. Короткий опис: Включіть коротке пояснення того, як вірш включає конкретні звуки і як його можна використовувати в мовленнєвій терапії.`,
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
app.post(`${router}/api/save-poems`, async (req, res) => {
  const { userName, poems } = req.body;

  if (!userName || !poems || !Array.isArray(poems) || poems.length === 0) {
    return res.status(400).json({ error: "Invalid data provided." });
  }

  try {
    const newPoemEntry = new Poems({
      userName,
      poems: poems.map((poem) => ({
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
app.get(`${router}/api/poems/:id`, async (req, res) => {
  const { id } = req.params;

  try {
    const poemEntry = await Poems.findById(id);
    if (!poemEntry) {
      return res.status(404).send("No poems found for this user.");
    }

    res.render("poems", {
      userName: poemEntry.userName,
      poems: poemEntry.poems,
      apiUrl: process.env.API_URL, // Передача переменной API_URL в шаблон
    });
  } catch (error) {
    console.error("Error fetching poems:", error);
    res.status(500).send("An error occurred while fetching the poems.");
  }
});

// Маршрут для генерации QR-кода
app.get(`${router}/api/generate-qr/:id`, async (req, res) => {
  const { id } = req.params;
  const url = `${process.env.API_URL}/poems/${id}`;

  try {
    const qrCode = await QRCode.toDataURL(`${url}`);
    res.json({ qrCode });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ error: "Failed to generate QR code." });
  }
});

app.use(`${router}/api/healthcheck`, (req, res) => {
  res.status(200).send("Server is running");
});

// This should be the last route, to serve the frontend for any unmatched routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = process.env.PORT || 3000; // Устанавливаем порт из переменной окружения PORT или 3000 по умолчанию
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
