# ai-apps-showcase
Demos for Azure Speech Service using Express.js and Azure Speech SDK, with authentication support. You can take a quick look at this [demo website](https://speech-suite.azurewebsites.net)

## Features

- **Speech Services**: Text-to-speech, speech-to-text, and translation demos
- **Authentication**: Complete authentication system with signup and login
  - Google OAuth integration
  - GitHub OAuth integration
  - Email/password authentication
  - User registration and login
  - Session management
  - Protected routes

## Install

First clone the project and install the project
```
git clone https://github.com/electron-react-boilerplate/electron-react-boilerplate.git  

cd <your-project-name>
yarn
```

## Development

Please provide your own environment variables in .env.local file, otherwise, you may not run this app properly.
If you don't have .env.local, you can create one in project root and add environment variables in it.

### Speech Service Variables
```
SPEECH_SERVICE_SUBSCRIPTION_KEY=<your-subscription-key>
SPEECH_SERVICE_SUBSCRIPTION_REGION=<your-subscription-region>
```

### Authentication Variables (Optional)
For full authentication features, add these variables:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

See [AUTHJS_SETUP.md](AUTHJS_SETUP.md) for detailed authentication setup instructions.

To develop the project with hot reload
```
yarn dev
```

To start the project
```
yarn start
```

## License

[Apache License 2.0](LICENSE)