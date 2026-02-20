#!/bin/bash
# Downloads ML models for MailSwipe from Hugging Face Hub
# Run this once after cloning the project

set -e
BASE="public/models"

echo "📦 Downloading ML models for MailSwipe..."

# Classification model: Xenova/nli-deberta-v3-small
DIR="$BASE/Xenova/nli-deberta-v3-small"
mkdir -p "$DIR/onnx"
echo "  ⬇️  Downloading nli-deberta-v3-small..."
curl -sL "https://huggingface.co/Xenova/nli-deberta-v3-small/resolve/main/config.json" -o "$DIR/config.json"
curl -sL "https://huggingface.co/Xenova/nli-deberta-v3-small/resolve/main/tokenizer.json" -o "$DIR/tokenizer.json"
curl -sL "https://huggingface.co/Xenova/nli-deberta-v3-small/resolve/main/tokenizer_config.json" -o "$DIR/tokenizer_config.json"
curl -sL "https://huggingface.co/Xenova/nli-deberta-v3-small/resolve/main/special_tokens_map.json" -o "$DIR/special_tokens_map.json"
curl -L "https://huggingface.co/Xenova/nli-deberta-v3-small/resolve/main/onnx/model_quantized.onnx" -o "$DIR/onnx/model_quantized.onnx"
echo "  ✅ Classification model ready"

# Summarization model: Xenova/distilbart-cnn-6-6
DIR="$BASE/Xenova/distilbart-cnn-6-6"
mkdir -p "$DIR/onnx"
echo "  ⬇️  Downloading distilbart-cnn-6-6..."
curl -sL "https://huggingface.co/Xenova/distilbart-cnn-6-6/resolve/main/config.json" -o "$DIR/config.json"
curl -sL "https://huggingface.co/Xenova/distilbart-cnn-6-6/resolve/main/tokenizer.json" -o "$DIR/tokenizer.json"
curl -sL "https://huggingface.co/Xenova/distilbart-cnn-6-6/resolve/main/tokenizer_config.json" -o "$DIR/tokenizer_config.json"
curl -sL "https://huggingface.co/Xenova/distilbart-cnn-6-6/resolve/main/special_tokens_map.json" -o "$DIR/special_tokens_map.json"
curl -sL "https://huggingface.co/Xenova/distilbart-cnn-6-6/resolve/main/generation_config.json" -o "$DIR/generation_config.json"
curl -L "https://huggingface.co/Xenova/distilbart-cnn-6-6/resolve/main/onnx/encoder_model_quantized.onnx" -o "$DIR/onnx/encoder_model_quantized.onnx"
curl -L "https://huggingface.co/Xenova/distilbart-cnn-6-6/resolve/main/onnx/decoder_model_merged_quantized.onnx" -o "$DIR/onnx/decoder_model_merged_quantized.onnx"
echo "  ✅ Summarization model ready"

echo ""
echo "🎉 All models downloaded! Total size:"
du -sh "$BASE"
