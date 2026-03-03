#!/usr/bin/env bash
set -o errexit

bundle install
yarn install

yarn build
yarn build:css
bundle exec rails assets:precompile
bundle exec rails assets:clean

bundle exec rails db:migrate
