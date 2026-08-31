## Activity 3 screenshots

## 1. Project Description
This project is a personal Student Profile application that showcases my academic background, personal interests, goals, and technical skills. For Activity 3, this application has been significantly upgraded to be fully responsive and optimized for mobile devices, tablets, and desktop screens, ensuring a seamless user experience across all platforms.

## 2. Application Structure
The application is structured into five main components:
* **Header:** Features my profile picture, full name, a brief subtitle ("About Myself"), and houses the main navigation.
* **Navigation Menu:** Contains links to seamlessly navigate the user to different sections of the profile.
* **About Section:** Provides a detailed overview of my background, personal interests, educational background at Ateneo de Cagayan - Xavier University, and my future aspirations in the IT field.
* **Skills Section:** Displays a curated list of my top 5 technical and soft skills (HTML/CSS, JavaScript, Teamwork, Problem Solving, and Time Management) along with short descriptions.
* **Footer:** Contains a copyright notice, my name, and the current year.

## 3. Responsive Design
To make the Student Profile responsive, I applied the "Mobile-First" workflow discussed in Module 4. By default, the CSS applies a single-column layout optimized for small screens, preventing horizontal scrolling and overlapping text. I then utilized CSS `@media` queries to adapt the layout for larger screens:
* **Tablet (min-width: 768px):** The layout expands, turning the skills list into a 2-column grid and increasing container padding.
* **Desktop (min-width: 1024px):** The layout takes advantage of wider screens by restricting the maximum width of the content for readability and organizing the skills into a 3-column grid.

## 4. UI/UX Principles Applied
I carefully applied the following Module 4 principles to improve the application:
* **Responsive Layout:** Used percentage-based widths, flexbox, and CSS grid to ensure the layout adapts automatically to Desktop, Tablet, and Mobile screens without text cutoff or image distortion.
* **Mobile-Friendly Spacing:** Applied `padding` and `margin` consistently, and used the `gap` property in grids to ensure the application is comfortable to read and prevents elements from feeling cramped on smaller screens.
* **Appropriate Typography:** Implemented a clean sans-serif font (`Arial`) with a `line-height: 1.6` for optimal paragraph readability. I also utilized a clear font size hierarchy for `h1`, `h2`, `h3`, and body text.
* **Clear Visual Hierarchy:** Used distinct background colors for the header and footer, underline accents for section headings, and structured cards for skills to clearly distinguish supporting information from primary headings.
* **Usable Controls:** Styled the Navigation links as pill-shaped buttons with generous padding (`10px 22px`). This ensures they meet the minimum recommended tap target size for mobile touchscreens, making them easy to identify and interact with.
* **Basic Accessibility:** Maintained high text-to-background contrast (dark gray text on white/light gray backgrounds, white text on dark blue backgrounds). I also included semantic HTML tags and descriptive `alt` text for my profile picture.
* **Consistent Design:** Maintained uniform spacing, border-radiuses, and a cohesive color palette (`#2c3e50` and `#18bc9c`) across the Header, About, Skills, and Footer sections so the page feels like a single, unified application.

## 5. Navigation
The navigation utilizes standard HTML anchor links (`<a href="#about">` and `<a href="#skills">`). When a user taps these links, the browser navigates directly to the corresponding `<section>` `id` within the same page. **This functionality relies entirely on HTML; no JavaScript is used for this responsive behavior or navigation.**

## 6. How to Run
To build and run this Cordova application:
1. Clone this repository to your local machine.
2. Open your terminal or command prompt and navigate to the project directory.
3. Ensure you have the Android platform added: `cordova platform add android`
4. Build the application: `cordova build android`
5. Run the application on a connected device or emulator: `cordova run android`
*(Alternatively, you can open `index.html` directly in a web browser and use Developer Tools to simulate device sizes): cordova run browser.*

### Mobile View
![Mobile](activity3_SS/ANDROID%20MOBILE%20SS1.png)
![Mobile](activity3_SS/ANDROID%20MOBILE%20SS2.png)


### Tablet View
![Mobile](activity3_SS/ANDROID%20TABLET%20SS1.png)
![Mobile](activity3_SS/ANDROID%20TABLET%20SS2.png)


### Desktop View
![Mobile](activity3_SS/ANDROID%20DESKTOP%20SS1.png)
![Mobile](activity3_SS/ANDROID%20DESKTOP%20SS2.png)