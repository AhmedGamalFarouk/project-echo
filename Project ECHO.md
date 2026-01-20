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
- **The Mood Check-In:** Users manually select their mood (e.g., Serene, Melancholy, Energetic, Furious).
- **Automatic Location:** The platform automatically detects the user's city via GPS when they post.
- **The Public Wipe:** Posts disappear from the public feed and map after 24 hours (Rolling Window).
- **Private History:** Authenticated users can view their own past posts and mood trends forever, even after they expire publicly.
- **Pseudonymity:** User identities are hidden on the public feed. Users appear as "Anonymous" or generated aliases (e.g., "Blue Owl"), but are authenticated via Clerk for safety and accountability.
- **Guest Mode:** Unregistered users can view the Global Map and Public Feed but cannot post.

  ### **1.2 Mobile App (Flutter) \- "The Input"**

- **The Posting Flow:**
  1. **GPS Lock:** App requests location permission.
  2. **Mood Selector:** User picks a mood icon.
  3. **Content:** User takes a photo (Camera) or writes text.
  4. **Submit:** The post is sent to the backend to be tagged with City and Mood.
- **The Feed:** A scrollable list of today's answers from around the world.
- **The Journal:** A private tab showing the user's personal history and mood stats.

  ### **1.3 Web App (Next.js) \- "The Universal Hub"**

- **Full Parity Features (Same as Mobile):**
  - **Unified Login:** Users log in with the same Clerk credentials as mobile to access their data.
  - **Posting:** Users can answer the prompt via the browser. (Uses Browser Geolocation API \+ Image Upload).
  - **The Feed:** Full read access to the global feed with infinite scroll.
  - **The Journal:** Users can review their past archives and see their personal mood calendar.
- **Web-Exclusive Features:**
  - **Global Mood Map:** A real-time, high-fidelity WebGL map where cities are colored based on the dominant mood of their inhabitants.
  - **City Trends Sidebar:** A data visualization panel showing "Top 5 Happiest Cities Today" or "Most Anxious Regions."
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
  - **Mood:** The selected emotion.
  - **Location:** City & Country (e.g., "Paris, FR").
  - **Status:** "Public" (Active) or "Archived" (Expired).
  - **Moderation:** flags (count) and isHidden (boolean).
- ## **Comment (V2):** Linked to a post, with a maximum depth of 3 replies.

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
3. **Result:** The post vanishes from the Feed and Map but remains in the user's private getMyJournal view.

   ### **3.3 The Map Aggregation**

The backend calculates the "Mood of the City" dynamically:

1. It filters for **Public** and **Non-Hidden** posts.
2. It groups posts by City.
3. It counts the moods (e.g., 50 Happy, 10 Sad).
4. It applies a **Threshold**: Cities with \< 5 active posts are ignored (Privacy/Significance).
5. ## It returns the "Dominant Mood" color to the Web Map.

   ## **4\. UI/UX Guidelines**

   ### **4.1 Mood Palette**

- **Serene:** Mint Green
- **Energetic:** Sunny Yellow
- **Melancholy:** Deep Blue
- **Anxious:** Purple
- **Furious:** Red

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
