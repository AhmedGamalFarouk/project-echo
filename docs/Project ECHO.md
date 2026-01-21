Here is the updated documentation. The key changes are in **Section 1.3**, where the Web App has been elevated from a passive "Reflection" tool to a fully functional client (Post, Feed, Journal) that shares equal footing with the Mobile App.

I have also corrected the Authentication logic to match our move to **Clerk** (removing the old "Device ID" references) and synchronized the technical details with the backend code we just wrote.

---

# **Project ECHO**

**Tagline:** The social network that forgets.  
**Core Concept:** An ephemeral, pseudonymous platform where users respond to a daily prompt and log their mood. Public content disappears every 24 hours. The app automatically maps the world's emotional state by city.

---

## **1\. Feature Specification**

### **1.1 Core Mechanics (Global)**

- **The Daily Prompt:** At 12:00 UTC, a new global prompt appears for everyone simultaneously.
- **The Soapbox:** Authenticated users can post **once** per day.
- **The Mood Check-In:** Users are prompted to log their mood once per day (e.g., Serene, Melancholy, Energetic, Furious). This is separate from posting and tracks personal emotional trends over time.
- **Automatic Location:** The platform automatically detects the user's city via GPS when they post.
- **The Public Wipe:** Posts disappear from the public feed after 24 hours (Rolling Window).
- **Private History:** Authenticated users can view their own past posts and mood trends forever, even after they expire publicly.
- **Pseudonymity:** User identities are hidden on the public feed. Users appear as "Anonymous" or generated aliases (e.g., "Blue Owl"), but are authenticated via Clerk for safety and accountability.
- **Guest Mode:** Unregistered users can view the Global Feed but cannot post.

  ### **1.2 Mobile App (Flutter) \- "The Input"**

- **The Posting Flow:**
  1. **GPS Lock:** App requests location permission.
  2. **Content:** User takes a photo (Camera) or writes text.
  3. **Submit:** The post is sent to the backend to be tagged with City.
- **The Feed:** A scrollable list of today's posts from around the world.
- **The Journal:** A private tab showing the user's personal history and mood trends.
- **Daily Mood Prompt:** Once per day, users are prompted to log their current mood separately from posting.

  ### **1.3 Web App (Next.js) \- "The Universal Hub"**

- **Full Parity Features (Same as Mobile):**
  - **Unified Login:** Users log in with the same Clerk credentials as mobile to access their data.
  - **Posting:** Users can answer the prompt via the browser. (Uses Browser Geolocation API \+ Image Upload).
  - **The Feed:** Full read access to the global feed with infinite scroll.
  - **The Journal:** Users can review their past archives and see their personal mood calendar.
  - **Daily Mood Prompt:** Once per day, users are prompted to log their current mood.
- **Web-Exclusive Features:**
  - **Activity Map:** A real-time map showing posting activity by city.
  - **City Activity Panel:** A data visualization panel showing "Most Active Cities Today" or "Recent Posts by Region."
  - **Deep Links:** Specific posts (if public) can be shared via URL (links expire in 24h).

  ***

  ## **2\. Technical Architecture**

  ### **2.1 Tech Stack**

- **Mobile:** Flutter (Cross-platform).
- **Web:** Next.js (React).
- **Authentication:** Clerk (Handles Identity, Sessions, and Guest logic).
- **Backend:** Convex (Realtime DB, Functions, Scheduler).
- **Location Service:** Google Maps Geocoding API (Proxied via Backend).

  ### **2.2 Data Model**

- **User:**
  - tokenIdentifier: Unique ID from Clerk (links Mobile and Web identities).
  - email: Optional, for account recovery.
  - createdAt: Timestamp.
- **Prompt:** Stores the daily question and date.
- **Post:**
  - Links to User (via Clerk Token) and Prompt.
  - **Content:** Text or Image Storage ID.
  - **Location:** City & Country (e.g., "Paris, FR").
  - **Status:** "Public" (Active) or "Archived" (Expired).
  - **Moderation:** flags (count) and isHidden (boolean).
- **MoodLog (Future):** Daily mood check-ins separate from posts.
  - userId: Links to User.
  - mood: The selected emotion.
  - timestamp: When the mood was logged.
- **Comment (V2):** Linked to a post, with a maximum depth of 3 replies.

  ## **3\. Key Logic & Automation**

  ### **3.1 Automatic Location (Secure Backend Proxy)**

To protect API keys and ensure data consistency, Geocoding happens server-side for both Web and Mobile:

1. **Client (Flutter/Next.js):** Gets GPS coordinates (lat, long) from the device/browser.
2. **Client:** Calls backend action identifyCity(lat, long).
3. **Convex (Server):** Calls Google Maps API securely using environment variables.
4. **Convex:** Returns "City, Country" to be attached to the new post.

   ### **3.2 The "Soft Wipe" (Hourly Scheduler)**

A scheduled background task runs on the backend **every hour**.

1. It queries for posts where status \== "Public" AND createdAt \< 24 hours ago.
2. It updates these posts to status \= "Archived".
3. **Result:** The post vanishes from the Feed but remains in the user's private journal view.

   ### **3.3 Daily Mood Check-In (Future)**

Users will be prompted once per day to log their mood:

1. The system checks if the user has logged a mood in the last 24 hours.
2. If not, a prompt appears asking them to select their current mood.
3. Mood data is stored separately from posts and used for personal trend analysis in the Journal.

   ## **4\. UI/UX Guidelines**

   ### **4.1 Mood Palette (For Personal Journal & Daily Check-In)**

- **Serene:** Mint Green
- **Energetic:** Sunny Yellow
- **Melancholy:** Deep Blue
- **Anxious:** Purple
- **Furious:** Red

These colors are used in the user's personal journal to visualize mood trends over time, not in the public feed.

### **4.2 Safety & Moderation**

- **Report System:** Every post has a "Report" icon.
- **Auto-Hide:** If a post receives \>3 reports, it is automatically hidden (flagged) until reviewed by an admin.
- **Content Policy:** Defined in EULA (required for App Store approval).

  ### **4.3 Visual Style**

- **Theme:** Dark Mode / High Contrast.
- **Map Style:** Dark basemap with glowing colored pulses representing cities.
- ## **Typography:** Monospaced (Typewriter style) for a raw, authentic feel.

  ## **5\. Development Roadmap**

1. **Backend Setup (Complete):**
   - Configure Convex schema (Users, Posts, Prompts).
   - Set up Clerk Auth Config.
   - Implement Geocoding Action and Soft Wipe Scheduler.
2. **Web Implementation (Next.js):**
   - Integrate Clerk \<SignIn /\>.
   - Build "The Feed" and "Posting Form" (Text/Image).
   - Build the Map interface using Mapbox or Google Maps JS.
3. **Mobile Implementation (Flutter):**
   - Integrate clerk_flutter for Auth.
   - Build Camera and Text inputs.
   - Integrate geolocator package.
   - Connect to Convex Client.
4. **Launch Prep:**
   - Seed database with prompts.
   - Test "Report" functionality.
   - Deploy to Vercel (Web) and App Stores (Mobile).
5.
