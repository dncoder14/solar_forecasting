import os
import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader

class LLMClient:
    def __init__(self):
        # Configure Gemini
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not set")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

        # Setup RAG
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        self.vectorstore = self._build_vectorstore()

    def _build_vectorstore(self):
        # Load documents from data/guidelines/
        loader = DirectoryLoader('data/guidelines/', loader_cls=TextLoader)
        documents = loader.load()

        # Split documents
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        docs = text_splitter.split_documents(documents)

        # Create FAISS vectorstore
        vectorstore = FAISS.from_documents(docs, self.embeddings)
        return vectorstore

    def retrieve_knowledge(self, query, k=3):
        """Retrieve relevant guidelines for the query."""
        docs = self.vectorstore.similarity_search(query, k=k)
        return "\n\n".join([doc.page_content for doc in docs])

    def generate_response(self, prompt):
        """Generate response using Gemini."""
        response = self.model.generate_content(prompt)
        return response.text

    def analyze_forecast(self, forecast_data, uncertainty_level):
        """Analyze forecast with RAG context."""
        # Retrieve relevant guidelines
        query = f"Solar power forecast analysis for {forecast_data.get('summary', 'general conditions')}"
        context = self.retrieve_knowledge(query)

        # Build prompt
        prompt = f"""
        You are an expert solar grid optimization assistant. Analyze the following solar power forecast data and provide recommendations based on grid management guidelines.

        Forecast Data:
        {forecast_data}

        Uncertainty Level: {uncertainty_level}

        Relevant Guidelines:
        {context}

        Provide a structured analysis including:
        - Summary of forecast
        - Risk assessment
        - Action plan for optimization

        Be specific and cite guidelines where applicable.
        """

        return self.generate_response(prompt)