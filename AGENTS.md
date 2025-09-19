# AGENTS.md

This document describes the rules and requirements for the Financial Tracker mobile application project.

## Project Overview

A financial tracker mobile application built with React Native (Expo, JavaScript) and Supabase as backend. It integrates Gmail API to fetch transaction emails and will later support IMAP. The application parses bank alert emails (POSB, UOB) and categorizes them into expenses. Users can track budgets, view summaries, compare leaderboards, and manage their profile.

## Tech Stack

-   React Native with Expo (JavaScript)
-   Supabase (Auth, Database)
-   Gmail API integration (modular design for future IMAP support)
-   React Navigation (Bottom Tabs)
-   Google APIs client library for Gmail API

## Constants

All constants including the color scheme (purple highlights, black background, white text) must be defined in one file called `config.js`. This ensures that any changes can be made in a single place.

## Onboarding

-   User authentication via Supabase Auth
-   User enters transaction email address
-   User is prompted to enable notifications
-   User provides Supabase URL and API key; app connects to their project or defaults to the provided Supabase instance

## Screens

-   Expenses: Display parsed Gmail transactions. Incoming transactions appear green, outgoing appear red. Each transaction includes date/time (SGT), amount, from, to, description, and mode of payment. Users can categorize transactions and add manual transactions. Reset all expenses to zero on the 1st of every month at 0000hrs.
-   Budgets: Allow creation of categories with monthly budgets. Show bar graph usage: green (<80%), orange (80–99%), red (≥100%).
-   Summary: Show total income, total expenses, balance, and top 3 categories by spend.
-   Leaderboard: Placeholder with dummy data.
-   Profile: Vertical buttons for Friends, Supabase Settings, and App Settings.

## Email Parsing

-   Parser 1: POSB (ibanking.alert@dbs.com)
-   Parser 2: UOB
-   Modular parser system for extending to more banks in the future

## Notifications

-   Push notifications when new transactions are parsed

## Design

-   Theme colors from config.js
-   Minimal, clean UI

## To-dos

-   When signing out, return to the sign in page.
-   For the sign up page, create another page that
-   Get list of categories from Supabase if not done
-
