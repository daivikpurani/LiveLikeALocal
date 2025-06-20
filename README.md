# LiveLikeALocal: Interdisciplinary Collaboration Assistant

## 🌟 Project Overview

**LiveLikeALocal** is an innovative AI-powered chatbot system designed to facilitate seamless collaboration between Computer Science and Biology teams working on DNA-related projects. This interdisciplinary assistant bridges knowledge gaps, translates domain-specific terminology, and helps team members understand concepts outside their expertise through intelligent conversation and context-aware responses.

### 🎯 Primary Mission

The system serves as a sophisticated bridge between two complex domains:
- **Computer Science**: Algorithms, data structures, machine learning, software engineering
- **Biology**: DNA structures, genetic processes, molecular biology, genomic data

By providing real-time translation and contextual understanding, LiveLikeALocal enables more effective interdisciplinary collaboration, reducing communication barriers and accelerating scientific discovery.

## 🏗️ Architecture Overview

The project follows a modern, scalable architecture with three main components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Data Pipeline  │
│   (React.js)    │◄──►│   (Node.js)     │◄──►│   (Python)      │
│                 │    │                 │    │                 │
│ • Chat UI       │    │ • Express API   │    │ • Web Scraping  │
│ • Real-time     │    │ • Ollama LLM    │    │ • Data Cleaning │
│   Messaging     │    │ • Pinecone DB   │    │ • Vector Store  │
│ • Chat History  │    │ • Embeddings    │    │   Population    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔧 Technology Stack

#### Frontend
- **React.js 19.0.0** - Modern UI framework
- **CSS3** - Styling and responsive design
- **Web Vitals** - Performance monitoring

#### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Ollama** - Local LLM integration
- **Pinecone** - Vector database
- **Transformers.js** - Embedding generation
- **CORS** - Cross-origin resource sharing

#### Data Processing
- **Python** - Data scraping and processing
- **BeautifulSoup** - Web scraping
- **LangChain** - LLM orchestration
- **Sentence Transformers** - Text embeddings

## 🚀 Key Features

### 🤖 Intelligent Conversation
- **Context-Aware Responses**: Leverages retrieved documents and chat history
- **Domain Translation**: Converts technical concepts between CS and Biology
- **Multi-turn Conversations**: Maintains conversation context across sessions
- **Real-time Processing**: Instant responses with typing indicators

### 🔍 Advanced Search & Retrieval
- **Semantic Search**: Uses embeddings for contextually relevant document retrieval
- **Vector Database**: Pinecone integration for efficient similarity search
- **Document Context**: Provides relevant background information for responses

### 💾 Persistent Chat Management
- **Chat Sessions**: Multiple concurrent chat sessions
- **History Persistence**: Maintains conversation history across sessions
- **Session Management**: Start, load, and clear chat sessions

### 🎨 Modern User Interface
- **Responsive Design**: Works across desktop and mobile devices
- **Real-time Updates**: Live message streaming and status updates
- **Intuitive Navigation**: Sidebar chat management and easy switching
- **Professional Styling**: Clean, modern interface design

## 📁 Project Structure

```
LiveLikeALocal/
├── Backend/                    # Node.js server application
│   ├── index.js               # Main server entry point
│   ├── ollamaHandler.js       # LLM interaction logic
│   ├── pinecone.js            # Vector database configuration
│   ├── package.json           # Node.js dependencies
│   ├── Initialprompt.md       # System prompt configuration
│   ├── graduate seminar (2).ipynb  # Development notebook
│   └── test-*.js              # Test files for various components
│
├── Frontend/                   # React.js client application
│   ├── src/
│   │   ├── App.js             # Main React component
│   │   ├── App.css            # Application styling
│   │   └── components/        # Reusable UI components
│   ├── public/                # Static assets
│   └── package.json           # React dependencies
│
├── Data Scraping/             # Python data processing pipeline
│   ├── datasetscript.py       # Web scraping script
│   ├── cleaneddata.py         # Data cleaning utilities
│   └── output.txt             # Scraped data output
│
└── README.md                  # This documentation
```

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Ollama** (for local LLM)
- **Pinecone Account** (for vector database)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd LiveLikeALocal
```

### Step 2: Backend Setup

```bash
cd Backend

# Install Node.js dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure your `.env` file with the following variables:

```env
# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_CHAT_MODEL=llama3.2

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name

# Embedding Model
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2

# Server Configuration
PORT=8000
```

### Step 3: Frontend Setup

```bash
cd Frontend

# Install React dependencies
npm install
```

### Step 4: Data Pipeline Setup

```bash
cd "Data Scraping"

# Install Python dependencies
pip install requests beautifulsoup4 langchain openai pinecone-client sentence-transformers
```

### Step 5: Start Ollama

Ensure Ollama is running with the required model:

```bash
# Install and start Ollama (if not already installed)
ollama serve

# Pull the required model
ollama pull llama3.2
```

## 🚀 Running the Application

### Development Mode

1. **Start the Backend Server**:
   ```bash
   cd Backend
   npm start
   ```
   The server will run on `http://localhost:8000`

2. **Start the Frontend Development Server**:
   ```bash
   cd Frontend
   npm start
   ```
   The React app will run on `http://localhost:3000`

3. **Run Data Pipeline** (if needed):
   ```bash
   cd "Data Scraping"
   python datasetscript.py
   ```

### Production Deployment

1. **Build the Frontend**:
   ```bash
   cd Frontend
   npm run build
   ```

2. **Deploy Backend**:
   ```bash
   cd Backend
   npm start
   ```

## 🔧 Configuration

### System Prompt Customization

The system behavior is controlled by the prompt in `Backend/Initialprompt.md`. This file contains the core instructions for the AI assistant, including:

- Domain translation guidelines
- Communication protocols
- Knowledge bridging strategies
- Project-specific context

### Model Configuration

You can customize the LLM and embedding models by modifying the environment variables:

- `OLLAMA_CHAT_MODEL`: The chat model to use (default: llama3.2)
- `EMBEDDING_MODEL`: The embedding model for semantic search (default: Xenova/all-MiniLM-L6-v2)

### Vector Database Setup

1. Create a Pinecone account at [pinecone.io](https://pinecone.io)
2. Create a new index with appropriate dimensions for your embedding model
3. Configure the index name and API key in your `.env` file

## 📊 API Endpoints

### Chat Management

- `POST /api/chat/start` - Start a new chat session
- `GET /api/chat/:chatId/history` - Retrieve chat history
- `DELETE /api/chat/:chatId` - Clear chat history

### Message Processing

- `POST /api/chat` - Process a message with context and history
- `POST /api/local-chat` - Process a message without chat history

### Response Format

```json
{
  "response": "AI-generated response",
  "chatHistory": [
    {
      "role": "user",
      "content": "User message"
    },
    {
      "role": "assistant", 
      "content": "AI response"
    }
  ]
}
```

## 🧪 Testing

The project includes comprehensive test files:

- `test-chat.js` - Chat functionality testing
- `test-ollama.js` - Ollama integration testing
- `test-embeddings.js` - Embedding generation testing
- `test-endpoint.js` - API endpoint testing

Run tests with:
```bash
cd Backend
node test-chat.js
```

## 🔍 Usage Examples

### Starting a New Chat

1. Open the application in your browser
2. Click "New Chat" in the sidebar
3. Begin typing your message
4. The system will provide context-aware responses

### Interdisciplinary Questions

**Example 1 - CS to Biology Translation:**
```
User: "How does a machine learning algorithm work for DNA sequence analysis?"
Assistant: "Think of machine learning like teaching a computer to recognize patterns in DNA sequences, similar to how biologists identify genetic markers..."
```

**Example 2 - Biology to CS Translation:**
```
User: "What are the computational challenges of DNA sequencing errors?"
Assistant: "DNA sequencing errors create data quality issues that require robust error correction algorithms, similar to how software handles corrupted data..."
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Notes

### Key Implementation Details

1. **Embedding Generation**: Uses Transformers.js for client-side embedding generation
2. **Vector Search**: Implements semantic search using Pinecone vector database
3. **Chat Persistence**: In-memory chat history management with session IDs
4. **Error Handling**: Comprehensive error handling and user feedback
5. **Performance**: Optimized for real-time conversation with minimal latency

### Future Enhancements

- [ ] Database persistence for chat history
- [ ] User authentication and profiles
- [ ] Advanced document processing pipeline
- [ ] Multi-language support
- [ ] Integration with external knowledge bases
- [ ] Real-time collaboration features

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Ollama** for providing local LLM capabilities
- **Pinecone** for vector database infrastructure
- **Hugging Face** for embedding models and transformers
- **React** and **Node.js** communities for excellent documentation

## 📞 Support

For questions, issues, or contributions, please:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Contact the development team

---

**LiveLikeALocal** - Bridging the gap between Computer Science and Biology through intelligent conversation. 🧬💻 