
# Smart Post-Surgery Recovery with Gemini



## Post-Surgery Recovery App - Backend (Express.js)

This repository contains the backend code for a post-surgery recovery app using Google's Gemini API and Google Cloud Speech-to-Text API.

### Requirements

* Node.js and npm (or yarn)
* A Google Cloud Project
* Enabled Google Cloud Speech-to-Text API
* A Gemini API Key

### Setup

1. **Create a Google Cloud Project:**
   * Go to the Google Cloud Console ([https://console.cloud.google.com](https://console.cloud.google.com)) and create a new project.
   * Enable the "Cloud Speech-to-Text API" in your project.
2. **Get API Credentials:**
   * Create a service account or an API key for both the Speech-to-Text API and the Gemini API.
   * Save the API key or service account credentials in a secure location.
3. **Set Up Environment Variables:**
   * Create a `.env` file in the root of your project and add the following environment variables:
     ```
     GEMINI_API_KEY=your-gemini-api-key
     GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id
     GOOGLE_CLOUD_KEY_FILE=path/to/your/keyfile.json
     ```
4. **Install Dependencies:**
   ```bash
   npm install
   ```
5-. **Connect to MongoDB:**
   * Create MongoDB. If you don't have MongoDB installed, you can download it from the official MongoDB website. Follow the installation instructions for your operating system.


Start the Server:
   ```bash
npm start
```


---

## Endpoints
### `/partient` (POST)
add new patients to the system. to get more details, check the patient schema model

### `/patient/generateActivityPlan/:id` (GET)
Generates a personalized activity plan for a patient based on their data and a curated exercise database using the Gemini 1.5 API.

- **Request:**
  Requires a JSON body containing patient information (see `getActivityPlanGemini` function).

- **Response:**
  Returns a JSON response with the activity plan:
  ```json
  {
    "activityPlan": [ ... ],
    "generalNotes": [ ... ]
  }
  ```



### `/transcribe` (POST)
Send a POST request to `/transcribe` with an audio file to get the transcription.

---

## Database Models

- **Patient:** Represents a patient's data.
- **PatientActivityPlan:** Represents a patient's activity plan.
- **Exercise:** Represents an individual exercise from your database.

---

## Usage

- **Generate Activity Plan:**
  Send a GET request to `patient/generateActivityPlan/:id` with the patient information to receive a personalized activity plan.

---

## Notes



- **Customization:**
  You can further customize the exercise filtering and prompt generation logic to meet your specific requirements.

- **Security & Error Handling:**
  Consider implementing robust error handling and security measures.



---
