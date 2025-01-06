# Therapoetry

Therapoetry is an AI-powered application designed for speech therapists to assist individuals with speech difficulties through the use of therapeutic poems. By combining user-selected letters, poetry styles, and prompts, Therapoetry generates engaging and educational poems tailored to specific speech therapy needs.

## Features

### 1. **Poetry Forms**
   - Supports multiple poetic styles such as:
     - Limerick
     - Quatrain
     - Acrostic
     - Counting Rhyme
     - Riddle Poem
     - Tongue Twister
   - Each form is designed to address specific therapeutic goals and age groups.

### 2. **Age Group Customization**
   - Tailors poems to various age groups:
     - 4-6 years old
     - 7-9 years old
     - 10-12 years old
     - 13-15 years old
     - 16-18 years old
     - Adults
   - Ensures content appropriateness and complexity for effective therapy.

### 3. **Language Localization**
   - Multilingual interface with support for numerous languages, including:
     - English
     - Українська (Ukrainian)
     - Русский (Russian)
     - [Additional languages as per the translation files]
   - Cookie-based language persistence for a seamless user experience.
   - Easy expansion by uploading translation files to the server.

### 4. **AI-Driven Poem Creation**
   - Leverages Claude AI to:
     - Generate personalized poems based on user input.
     - Focus on specific sounds and letters for pronunciation improvement.
     - Provide short descriptions explaining the therapeutic benefits of each poem.

### 5. **Interactive Input**
   - Users can select letters and provide prompts for more targeted poem generation.
   - Supports dynamic feedback on user input to ensure meaningful results.

### 6. **QR Code Sharing**
   - Generates a QR code for each session to allow easy access and sharing of created poems.

### 7. **Server-Side Rendering**
   - Renders language-specific interfaces dynamically using EJS (Embedded JavaScript).
   - Provides localized API responses for a consistent user experience.

### 8. **Modern Frontend Technologies**
   - Built using Webpack for bundling and development.
   - Utilizes CSS and style loaders for dynamic and responsive styling.
   - Implements Babel for JavaScript transpilation, ensuring compatibility across different browsers.

### 9. **Backend with Advanced Features**
   - Powered by Node.js and Express.js.
   - MongoDB and Mongoose for robust database management.
   - Supports scheduled tasks with Node-Cron for maintaining application states.
   - Environment variable management using dotenv for secure configuration.

## How It Works

1. **Select Age Group and Poem Form**
   - Choose the target age group and desired poetic style from the dropdown menus.

2. **Customize Inputs**
   - Select letters to emphasize in the therapy session.
   - Provide a short prompt for context (e.g., "Hello my friend and welcome").

3. **Generate Poem**
   - Click the **Create Poem!** button to generate a poem.
   - View the AI-generated poem and its therapeutic description.

4. **Save and Share**
   - End the session to receive a QR code and URL for accessing the poems.

## Technical Overview

### Backend
- **Language Persistence**: Stores user-selected language settings in cookies.
- **API Integration**: Formats prompts and responses dynamically for the Anthropic API based on the selected language.
- **Server-Side Rendering**: Utilizes EJS for dynamic rendering and localization.
- **Database**: Uses MongoDB and Mongoose for data storage and management.
- **Task Scheduling**: Employs Node-Cron for scheduled tasks like data cleanup or updates.
- **Environment Management**: Manages configuration using dotenv for secure environment variables.

### Frontend
- **Dynamic Localization**: Automatically loads the appropriate language dictionary for rendering.
- **Interactive Design**: User-friendly input methods and real-time feedback for selections.
- **Modern Build Tools**: Leverages Webpack, CSS Loader, Style Loader, and Babel for an efficient development and deployment workflow.
- **Code Quality**: Ensures code reliability with Jest for testing and ESLint for linting.

## Installation and Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zdvman/therapoetry.git
   cd therapoetry
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the root directory.
   - Add necessary environment variables as specified in `.env.example`.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Open your browser and navigate to `http://localhost:3000`.

6. **Enable multilingual support:**
   - Upload translation files to the `translations` directory as needed.

## Example Poem

### Input:
- **Age Group**: 7-9 years old
- **Poem Form**: Limerick
- **Letters**: L, M
- **Prompt**: "Hello my friend and welcome"

### Output:
```
Little Molly met Liam one day,
"Hello, my friend!" she'd warmly say.
"Welcome to my home,
Where we'll laugh and roam,
Let's make merry and play all day!"

Liam smiled and said with glee,
"Lovely Molly, thanks for having me!
We'll make memories grand,
In this magical land,
Where laughter and joy run free!"
```

### Therapeutic Benefits:
This limerick focuses on the sounds L and M, helping children practice their pronunciation in a fun and engaging way.

## Contributions

We welcome contributions! Feel free to fork the repository, submit a pull request, or open an issue for bug fixes or feature requests.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
```

