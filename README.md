# San Francisco Travel Itinerary Creator

## 🌟 Project Overview

**San Francisco Travel Itinerary Creator** is an intelligent AI-powered travel assistant that generates personalized itineraries and recommendations for visitors to San Francisco. This sophisticated system combines natural language processing, vector search, and local knowledge to create tailored travel experiences based on user preferences, interests, and requirements.

### 🎯 Primary Mission

The system serves as a comprehensive travel planning companion that:
- **Understands User Preferences**: Analyzes interests, budget, accessibility needs, and travel style
- **Generates Personalized Itineraries**: Creates day-by-day plans with activities, dining, and attractions
- **Provides Local Insights**: Offers authentic recommendations beyond typical tourist spots
- **Adapts to Different Travelers**: Caters to families, solo travelers, business visitors, and adventure seekers

## 🏗️ Architecture Overview

The project follows a modern, AI-driven architecture with three main components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Data Pipeline  │
│   (React.js)    │◄──►│   (Node.js)     │◄──►│   (Python)      │
│                 │    │                 │    │                 │
│ • Chat UI       │    │ • Express API   │    │ • Web Scraping  │
│ • Real-time     │    │ • Ollama LLM    │    │ • Data Cleaning │
│   Messaging     │    │ • Pinecone DB   │    │ • Vector Store  │
│ • Markdown      │    │ • OpenAI API    │    │   Population    │
│   Rendering     │    │ • Intent        │    │ • Event Data    │
│                 │    │   Classification│    │   Processing    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔧 Technology Stack

#### Frontend
- **React.js 19.0.0** - Modern UI framework with real-time updates
- **React Markdown** - Rich text rendering for formatted itineraries
- **CSS3** - Responsive design and modern styling
- **Axios** - HTTP client for API communication

#### Backend
- **Node.js** - Server runtime with Express.js framework
- **Ollama** - Local LLM integration for response generation
- **OpenAI API** - Embedding generation and intent classification
- **Pinecone** - Vector database for semantic search
- **LangChain** - LLM orchestration and prompt management
- **CORS** - Cross-origin resource sharing

#### Data Processing
- **Python** - Data scraping and processing pipeline
- **BeautifulSoup** - Web scraping from SF event websites
- **CSV Processing** - User persona and test data management
- **Vector Embeddings** - Semantic search capabilities

## 🚀 Key Features

### 🤖 Intelligent Itinerary Generation
- **Context-Aware Recommendations**: Leverages user preferences and local knowledge
- **Multi-Day Planning**: Creates comprehensive day-by-day itineraries
- **Category-Based Filtering**: Activities, dining, attractions, and events
- **Real-time Processing**: Instant itinerary generation with typing indicators

### 🔍 Advanced Search & Discovery
- **Semantic Search**: Uses embeddings for contextually relevant recommendations
- **Intent Classification**: Understands user queries and preferences
- **Vector Database**: Pinecone integration for efficient similarity search
- **Local Knowledge Base**: Comprehensive SF event and location data

### 💾 Personalized Experience
- **User Personas**: 100+ detailed traveler profiles with preferences
- **Preference Learning**: Adapts recommendations based on user interactions
- **Chat History**: Maintains conversation context across sessions
- **Session Management**: Multiple concurrent planning sessions

### 🎨 Rich User Interface
- **Markdown Rendering**: Beautifully formatted itineraries with headers and sections
- **Responsive Design**: Works across desktop and mobile devices
- **Real-time Updates**: Live message streaming and status updates
- **Professional Styling**: Clean, modern interface design

## 📁 Project Structure

```
San Francisco Travel Itinerary Creator/
├── Backend/                    # Node.js server application
│   ├── index.js               # Main server entry point
│   ├── queryProcessor.js      # Core itinerary generation logic
│   ├── ollamaHandler.js       # LLM interaction handling
│   ├── pinecone.js            # Vector database configuration
│   ├── package.json           # Node.js dependencies
│   ├── test_queries.csv       # Test query dataset
│   ├── sf_users_personas.csv  # User persona database
│   ├── test_results.csv       # Evaluation results
│   └── test-*.js              # Test files for various components
│
├── Frontend/                   # React.js client application
│   ├── src/
│   │   ├── App.js             # Main React component
│   │   ├── App.css            # Application styling
│   │   └── components/        # Reusable UI components
│   │       ├── Feedback.js    # User feedback component
│   │       └── TestResults.js # Results display component
│   ├── public/                # Static assets
│   └── package.json           # React dependencies
│
├── Data Scraping/             # Python data processing pipeline
│   ├── datasetscript.py       # Web scraping from SF event sites
│   ├── cleaneddata.py         # Data cleaning utilities
│   └── output.txt             # Scraped event data
│
└── README.md                  # This documentation
```

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Ollama** (for local LLM)
- **OpenAI API Key** (for embeddings and intent classification)
- **Pinecone Account** (for vector database)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd "San Francisco Travel Itinerary Creator"
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
OLLAMA_MODEL=llama3.2

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name

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

### Intent Classification

The system uses OpenAI's GPT-3.5-turbo for intent classification, categorizing queries into:
- `find-free` - Free activities and events
- `find-category` - Specific activity categories
- `find-date-range` - Time-based recommendations
- `general` - General travel planning queries

### Vector Database Setup

1. Create a Pinecone account at [pinecone.io](https://pinecone.io)
2. Create a new index with 1536 dimensions (for OpenAI embeddings)
3. Configure the index name and API key in your `.env` file

### User Personas

The system includes 100+ detailed user personas with:
- Age demographics (21-70 years)
- Activity preferences (parks, museums, nightlife, etc.)
- Travel priorities (budget-friendly, luxury, family-oriented, etc.)
- Accessibility needs and preferences

## 📊 API Endpoints

### Chat Management

- `POST /api/chat/start` - Start a new chat session
- `GET /api/chat/:chatId/history` - Retrieve chat history
- `DELETE /api/chat/:chatId` - Clear chat history

### Itinerary Generation

- `POST /api/chat/test` - Generate personalized itinerary (main endpoint)
- `POST /api/chat` - Process message with context and history

### Response Format

```json
{
  "reply": "Generated itinerary in markdown format",
  "responseId": "unique_response_identifier"
}
```

## 🧪 Testing & Evaluation

The project includes comprehensive testing and evaluation:

### Test Queries
- `test_queries.csv` - 10 diverse travel planning queries
- Covers different preferences, budgets, and travel styles

### User Personas
- `sf_users_personas.csv` - 100+ detailed traveler profiles
- Includes age, preferences, and specific query examples

### Evaluation Results
- `test_results.csv` - Performance metrics and evaluation scores
- `testEvaluator.js` - Automated evaluation system
- `truLensEvaluator.py` - Advanced evaluation metrics

Run tests with:
```bash
cd Backend
node testEvaluator.js
```

## 🔍 Usage Examples

### Starting a New Travel Planning Session

1. Open the application in your browser
2. Click "New Chat" in the sidebar
3. Describe your travel preferences and requirements
4. Receive a personalized San Francisco itinerary

### Sample Queries

**Example 1 - Family Travel:**
```
User: "I'm visiting San Francisco with my family next weekend. We have two kids (ages 8 and 12) and want to see some museums, parks, and maybe some kid-friendly activities. We're staying near Fisherman's Wharf."
```

**Example 2 - Solo Business Traveler:**
```
User: "I'm in San Francisco for a 3-day business trip. I want to experience the local food scene, maybe some wine tasting, and find good co-working spaces. I prefer trendy neighborhoods and authentic experiences."
```

**Example 3 - Budget Travel:**
```
User: "I'm a budget traveler looking for free or cheap activities in San Francisco. I love parks, street food, and meeting locals. I'm staying in a hostel near Mission District."
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Notes

### Key Implementation Details

1. **Query Processing Pipeline**: 
   - Preprocessing and intent classification
   - Embedding generation with OpenAI
   - Vector search with Pinecone
   - LLM-based reranking and summarization

2. **Itinerary Generation**:
   - Context-aware response generation
   - Markdown formatting for readability
   - Time-based organization (Morning, Afternoon, Evening)
   - Personalized recommendations

3. **Data Management**:
   - Comprehensive user persona database
   - Event and location data from SF sources
   - Vector embeddings for semantic search
   - Real-time data processing

### Future Enhancements

- [ ] Integration with real-time event APIs
- [ ] Weather-aware itinerary adjustments
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Integration with booking platforms
- [ ] Social features and sharing
- [ ] Advanced personalization algorithms
- [ ] Voice interface integration

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **San Francisco Event Community** for local knowledge and data
- **Ollama** for providing local LLM capabilities
- **OpenAI** for embedding and classification services
- **Pinecone** for vector database infrastructure
- **React** and **Node.js** communities for excellent documentation

## 📞 Support

For questions, issues, or contributions, please:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Contact the development team

---

**San Francisco Travel Itinerary Creator** - Your AI-powered companion for discovering the best of San Francisco! 🌉✨