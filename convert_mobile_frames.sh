#!/bin/bash
# ============================================================
# Mobile Frames Converter
# Converts all 300 desktop frames → mobile-optimized versions
# Output: frames-mobile/ folder (640x360, compressed)
# Run this from inside your "Demo Cafe" folder
# ============================================================

# Check ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg not found. Install it first:"
    echo "   Windows : Download from https://ffmpeg.org/download.html"
    echo "   Mac     : brew install ffmpeg"
    echo "   Linux   : sudo apt install ffmpeg"
    exit 1
fi

# Create output folder
mkdir -p frames-mobile

echo "🚀 Converting 300 frames for mobile..."
echo "   Input  : frames/ (original resolution)"
echo "   Output : frames-mobile/ (640x360, optimized)"
echo ""

# Convert all frames
for i in $(seq -w 001 300); do
    INPUT="frames/ezgif-frame-${i}.png"
    OUTPUT="frames-mobile/ezgif-frame-${i}.png"

    if [ -f "$INPUT" ]; then
        ffmpeg -y -i "$INPUT" \
            -vf "scale=640:360:flags=lanczos" \
            -compression_level 6 \
            "$OUTPUT" -loglevel error

        echo -ne "   Progress: ${i}/300\r"
    else
        echo "⚠️  Missing: $INPUT"
    fi
done

echo ""
echo "✅ Done! frames-mobile/ folder is ready."
echo ""
echo "📁 Your folder structure should now look like:"
echo "   Demo Cafe/"
echo "   ├── frames/              ← Desktop (original)"
echo "   ├── frames-mobile/       ← Mobile (640x360) ✅ NEW"
echo "   ├── index.html"
echo "   ├── script.js"
echo "   └── style.css"
echo ""
echo "🎯 Size comparison (approx):"
DESK_SIZE=$(du -sh frames/ 2>/dev/null | cut -f1)
MOB_SIZE=$(du -sh frames-mobile/ 2>/dev/null | cut -f1)
echo "   Desktop frames : ${DESK_SIZE:-'(check manually)'}"
echo "   Mobile frames  : ${MOB_SIZE:-'(check manually)'}"
