#!/bin/bash

echo "🚀 Setting up Local RAG (Python + sentence-transformers)"
echo "================================================"
echo ""

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Create virtual environment
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
else
    echo "✅ Virtual environment already exists"
fi

echo ""
echo "📥 Installing Python dependencies..."
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q fastapi uvicorn sentence-transformers numpy scikit-learn sumy nltk

echo "📚 Downloading NLTK data..."
.venv/bin/python -c "import nltk; nltk.download('punkt', quiet=True)"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the Python RAG server:"
echo "      source .venv/bin/activate"
echo "      python local_rag_server.py"
echo ""
echo "   2. In another terminal, ingest Uniswap data:"
echo "      npm run ingest-local"
echo ""
echo "   3. Start the Node backend:"
echo "      npm run dev"
echo ""
echo "   4. Test the extension!"
