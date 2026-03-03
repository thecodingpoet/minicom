#!/usr/bin/env bash
set -o errexit

bundle install
npm ci

npm run build
npm run build:css

echo "--- Verifying JS/CSS builds ---"
ls -la app/assets/builds/

RAILS_ENV=production SECRET_KEY_BASE_DUMMY=1 bundle exec rails assets:precompile

echo "--- Verifying precompiled assets ---"
ls -la public/assets/
cat public/assets/.manifest.json

bundle exec rails db:migrate
