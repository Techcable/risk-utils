# Runs typescript compiler
# This must be run to update the webworker
check:
    pnpm exec tsc -p ./tsconfig-primary.json
    pnpm exec tsc -p ./src/workers/tsconfig.json
    @-just check-format

# Run the development server
dev: check
    pnpm exec next dev --turbopack

build: check
    pnpm exec next build

# Needs to be set explicitly since find-cache-dir can't handle package.yml
export CACHE_DIR:="./node_modules/.cache"

# Deploy to github pages
deploy-pages: build
    @# NOTE: Need nojekyll because of underscore _next file
    pnpm exec gh-pages --nojekyll --dist build --cname risk.techcable.net


# Serve the built information
serve:
    miniserve --spa --index index.html build/

check-format:
    pnpm exec prettier --check .

format:
    pnpm exec prettier --write .

# Cleans all caches & build outputs
clean:
    @# Compare to output of `git clean -fdx --dry-run`
    git clean -fdx build tsbuild .next
