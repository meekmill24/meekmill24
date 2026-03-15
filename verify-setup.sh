#!/bin/bash
# Simple Music - Quick Start Setup Script
# This script helps verify your setup is complete

echo "🎵 Simple Music - Setup Verification"
echo "===================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. Please install Node.js 18+"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "  Node version: $NODE_VERSION"

# Check pnpm
echo "✓ Checking pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "✗ pnpm not found. Install with: npm install -g pnpm"
    exit 1
fi
PNPM_VERSION=$(pnpm -v)
echo "  pnpm version: $PNPM_VERSION"

# Check .env.local
echo "✓ Checking .env.local..."
if [ ! -f .env.local ]; then
    echo "✗ .env.local not found"
    echo "  Create .env.local with Supabase credentials"
    echo "  See README.md for instructions"
    exit 1
fi
echo "  ✓ .env.local exists"

# Check SUPABASE_URL
if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo "  ✓ NEXT_PUBLIC_SUPABASE_URL configured"
else
    echo "  ✗ NEXT_PUBLIC_SUPABASE_URL missing from .env.local"
    exit 1
fi

# Check SUPABASE_ANON_KEY
if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
    echo "  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY configured"
else
    echo "  ✗ NEXT_PUBLIC_SUPABASE_ANON_KEY missing from .env.local"
    exit 1
fi

# Check dependencies
echo "✓ Checking dependencies..."
if [ ! -d node_modules ]; then
    echo "  Installing dependencies..."
    pnpm install
else
    echo "  ✓ Dependencies installed"
fi

echo ""
echo "✅ Setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Ensure DATABASE_SETUP.sql has been run in Supabase"
echo "2. Start dev server: pnpm dev"
echo "3. Open http://localhost:3000"
echo ""
echo "For more details, see README.md"
