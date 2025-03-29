# Checks for compilation errors or formatting issues
check:
    pnpm exec tsc
    @-just check-format

# Run the development server
dev: check
    pnpm run dev


check-format:
    pnpm exec prettier --check .

format:
    pnpm exec prettier --write .
