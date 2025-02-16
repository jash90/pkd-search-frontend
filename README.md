# PKD Code Search Engine

This React application provides a simple search interface for finding PKD codes based on a user's service description. Users can input a description of their business and receive a suggested PKD code along with additional matching codes.

## Features

- **Search Interface**:
  - Input field to enter a service or business description.
  - Search activation via the `Enter` key or the "Szukaj" button.
- **Results Display**:
  - Shows a suggested PKD code with a matching score.
  - Displays a list of additional matching PKD codes.
- **Error Handling & Loading State**:
  - A loading spinner is displayed during API requests.
  - User-friendly error messages are shown if the search fails.

## Project Structure

- **src/App.tsx**: Main React component handling:
  - State management for search queries, results, loading, and error messages.
  - API requests to the backend using Axios.
  - Displaying both the main suggested code and additional matching codes.

## Setup and Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   or using Yarn:
   ```bash
   yarn install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the root directory and add the base URL for your API:
   ```env
   BASE_URL=http://your-api-url.com
   ```
   Replace `http://your-api-url.com` with the actual endpoint your application should query.

4. **Run the Application**
   ```bash
   npm start
   ```
   or with Yarn:
   ```bash
   yarn start
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

## Technologies Used

- **React & TypeScript**: For building a modern, type-safe user interface using functional components and hooks.
- **Axios**: For handling HTTP requests to the backend.
- **Lucide-react**: For display icons like the search icon and loading spinner.
- **Tailwind CSS**: For styling the UI with a consistent, responsive design.

## Best Practices Followed

- **React Best Practices**:
  - Utilizes functional components and hooks.
  - Implements conditional rendering for loading states and error messages.
- **Code Optimization**:
  - Clean component structure with clear state management.
- **Error Handling**:
  - Graceful error display to improve user experience during API failures.

## Future Improvements

- Enhance error handling with more detailed insights.
- Introduce advanced UI features such as pagination or better result filtering.
- Optimize performance using techniques like `React.lazy` and `Suspense` for code-splitting.
- Expand test coverage to improve code reliability.

## License

This project is licensed under the MIT License. 