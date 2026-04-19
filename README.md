# ☀️ SolarVista — Solar Energy Forecasting Dashboard

AI-powered solar energy generation forecasting using Machine Learning and interactive data visualization with intelligent optimization assistance.

## Features

- **Dashboard Overview** — Real-time metrics, power vs radiation curves, model accuracy gauge
- **Weather & Analytics** — Interactive weather input form with grouped parameters, instant ML predictions, 24-hour power simulation
- **🤖 Ved AI Optimization Assistant** — Agentic AI system that transforms raw predictions into actionable grid optimization recommendations using RAG and structured reasoning

## Tech Stack

- **ML Model**: Random Forest Regressor (scikit-learn)
- **AI Agent**: LangGraph + Google Gemini 1.5 Flash + FAISS RAG
- **Frontend**: Streamlit with custom dark theme
- **Visualization**: Plotly (interactive charts, gauges, simulations)
- **Data**: 4200+ weather observation records

## AI Agent Features

The Ved AI agent provides intelligent solar optimization through:

- **Multi-step Reasoning**: Forecast analysis → Knowledge retrieval → Optimization synthesis
- **RAG System**: Context-aware recommendations based on grid management guidelines
- **Structured Output**: JSON reports with summary, risk assessment, and action plans
- **Real-time Integration**: Processes live forecast data for immediate insights

## Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd solar_forecasting
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up Google Gemini API**
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - The app will prompt for the API key in the sidebar

4. **Run the application**
   ```bash
   streamlit run app.py
   ```

## Usage

1. **Explore Dashboard**: View real-time metrics and data visualizations
2. **Make Predictions**: Input weather conditions to get solar power forecasts
3. **AI Optimization**: Use the Ved AI agent for intelligent grid optimization recommendations

## AI Agent Architecture

The Ved AI agent uses a structured reasoning pipeline:

1. **ForecastAnalyst**: Analyzes raw prediction data
2. **KnowledgeRetriever**: Queries RAG system for relevant guidelines
3. **GridOptimizer**: Synthesizes insights into actionable recommendations

All outputs follow a consistent JSON schema for reliable integration.
solar_forecasting/
├── app.py                    # Main Streamlit dashboard
├── src/
│   ├── config.py             # App configuration and constants
│   └── ui/
│       ├── plots.py          # Plotly chart functions
│       └── components.py     # Reusable UI components
├── assets/
│   └── style.css             # Custom dark theme styling
├── data/
│   └── spg.csv               # Solar power generation dataset
├── models/
│   └── solar_model.pkl       # Trained Random Forest model
├── notebooks/
│   └── solar_forecasting.ipynb
├── .streamlit/
│   └── config.toml           # Streamlit theme config
└── requirements.txt
```

## Setup

```bash
pip install -r requirements.txt
streamlit run app.py
```

## System Architecture

```mermaid
flowchart TD
    A[Weather Data Input] --> B[Data Preprocessing]
    B --> C[Machine Learning Model - Random Forest]
    C --> D[Prediction Output]
    D --> E[Evaluation MAE RMSE]
    E --> F[Streamlit UI Display]
    F --> G[Interactive Plotly Charts]
    F --> H[24-Hour Simulation]
    F --> I[Optimization Assistant]
```

## Team

Built as a group project for AI/ML coursework.