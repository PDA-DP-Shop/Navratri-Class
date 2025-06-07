# Navratri Garba Training Registration System

A web application for managing Navratri Garba training class registrations. Built with HTML, CSS, and JavaScript, using Firebase for backend services.

## Features

- Online registration form for Garba training classes
- Real-time registration counter
- Multiple payment methods (Google Pay and Offline)
- Registration search functionality
- Responsive design for all devices
- Firebase integration for data storage
- Analytics tracking

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Firebase (Firestore, Analytics)
- Font Awesome Icons
- Google Fonts

## Setup and Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/navratri-garba.git
```

2. Open `index.html` in your browser to view the website locally.

3. For development, you'll need to:
   - Set up a Firebase project
   - Update the Firebase configuration in `script.js`
   - Enable Firestore and Analytics in your Firebase console

## Firebase Configuration

Update the Firebase configuration in `script.js` with your own credentials:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};
```

## Deployment

The website is deployed using GitHub Pages. To deploy:

1. Push your code to GitHub
2. Go to repository settings
3. Navigate to "Pages" section
4. Select the main branch as source
5. Save the settings

Your website will be available at: `https://yourusername.github.io/navratri-garba/`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - your.email@example.com
Project Link: [https://github.com/yourusername/navratri-garba](https://github.com/yourusername/navratri-garba) 