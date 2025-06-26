# Neural Network Angular Demo

An interactive web application for learning and experimenting with neural networks, built with Angular and featuring real-time training visualization, MNIST digit recognition, and hands-on neural network configuration.

![Neural Network Demo](https://img.shields.io/badge/Angular-19.2-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Neural Networks](https://img.shields.io/badge/Neural%20Networks-MNIST-orange)

## 🧠 About

This application provides an interactive introduction to neural networks and deep learning concepts. Users can:

- **Learn** about neural network fundamentals through interactive explanations
- **Create** custom neural network architectures with configurable hidden layers
- **Train** networks on the MNIST dataset with real-time progress monitoring
- **Test** trained networks by drawing digits and seeing predictions in action

The application demonstrates key concepts including:

- Feedforward neural networks
- Backpropagation algorithm
- Gradient descent optimization
- MNIST digit classification
- Real-time training visualization via WebSocket connections

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Modern web browser

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd neural-angular-demo
   ```

2. **Install dependencies**

   ```bash
   cd neural-angular-demo
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

   Or use the VS Code task:

   ```bash
   # In VS Code, run the "Start Neural Network Demo" task
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200/`

## 🚀 Railway Deployment

This application is configured for easy deployment to Railway. For detailed deployment instructions, see the [Railway Deployment Guide](RAILWAY_DEPLOYMENT.md).

### Quick Deploy to Railway

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Deploy to Railway"
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Railway will automatically deploy using the included configuration

The application includes:

- Pre-configured `railway.json` deployment settings
- Express server for serving the built Angular app
- Environment-specific configurations
- Production build optimizations

## 🏗️ Architecture

### Frontend (Angular)

- **Angular 19.2** - Modern TypeScript framework
- **RxJS** - Reactive programming for real-time updates
- **Socket.IO Client** - WebSocket communication for training progress
- **Responsive Design** - Works on desktop and mobile devices

### Backend API

- **Production**: `https://neural-network-intro-production.up.railway.app/`
- **Features**: Network creation, training, testing, and real-time progress updates
- **Documentation**: See `api-documentation.md` for complete API reference

### Project Structure

```
neural-angular-demo/
├── src/
│   ├── app/
│   │   ├── components/           # UI components
│   │   │   ├── learn/           # Educational content
│   │   │   ├── network-config/  # Network architecture setup
│   │   │   ├── network-training/# Training interface
│   │   │   ├── network-test/    # Testing interface
│   │   │   └── ...
│   │   ├── services/            # API and WebSocket services
│   │   ├── interfaces/          # TypeScript type definitions
│   │   └── interceptors/        # HTTP interceptors
│   └── assets/                  # Static assets
├── api-documentation.md         # Complete API reference
└── README.md                   # This file
```

## 🎯 Features

### 🎓 Learn Section

Interactive explanations of neural network concepts, including:

- What are neural networks?
- How do they learn?
- Mathematical foundations
- Practical applications

### ⚙️ Network Configuration

- Choose between single or dual hidden layer architectures
- Customize layer sizes (neurons per layer)
- Real-time architecture visualization
- Preset configurations for common use cases

### 🏋️ Training Interface

- Configure training parameters (epochs, batch size, learning rate)
- Real-time training progress with WebSocket updates
- Live accuracy metrics and loss visualization
- Training time tracking

### 🧪 Testing Interface

- Interactive digit drawing canvas
- Real-time prediction as you draw
- Confidence scores for each digit (0-9)
- Example gallery of test cases

## 🔧 Development

### Running Tests

```bash
# Unit tests
npm test

# E2E tests (requires additional setup)
npm run e2e
```

### Building for Production

```bash
npm run build
```

### Code Scaffolding

```bash
# Generate new component
ng generate component component-name

# Generate new service
ng generate service service-name
```

## 📚 Educational Resources & Inspiration

This project was inspired by and builds upon excellent educational resources:

### 🎥 3Blue1Brown's Neural Networks Series

A fantastic video series that provides intuitive explanations of neural networks and deep learning:

- **YouTube Playlist**: [Neural Networks](https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi)
- **Topics Covered**: What are neural networks, gradient descent, backpropagation, and more
- **Why It's Great**: Visual and intuitive explanations that make complex concepts accessible

### 📖 Neural Networks and Deep Learning (Michael Nielsen)

An excellent free online book that provides both intuitive understanding and mathematical rigor:

- **Website**: [http://neuralnetworksanddeeplearning.com/](http://neuralnetworksanddeeplearning.com/)
- **Topics Covered**: From basic perceptrons to advanced deep learning techniques
- **Why It's Great**: Perfect balance of theory and practical implementation

These resources provide the theoretical foundation that this application aims to make interactive and hands-on.

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

1. **Report bugs** or suggest features via GitHub issues
2. **Improve documentation** - especially educational content
3. **Add new visualizations** or interactive elements
4. **Optimize performance** for large networks or datasets
5. **Add new neural network architectures** or training algorithms

### Development Guidelines

- Follow Angular style guide and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **3Blue1Brown** for the exceptional neural networks video series that makes complex topics accessible
- **Michael Nielsen** for the comprehensive and free "Neural Networks and Deep Learning" book
- **Angular Team** for the excellent framework and development tools
- **MNIST Dataset** creators for providing the standard benchmark dataset

## 📞 Support

If you have questions, suggestions, or run into issues:

1. Check the [API Documentation](api-documentation.md) for backend-related questions
2. Review the Angular project's README in the `neural-angular-demo/` directory
3. Open an issue on GitHub for bugs or feature requests

---

**Happy Learning! 🧠✨**

_This application is designed to make neural networks more accessible and intuitive. Whether you're a student, educator, or curious developer, we hope it helps you understand these fascinating algorithms that power modern AI._
