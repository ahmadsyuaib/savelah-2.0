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

## Structure of code

-   Add anything developer have to do with the code into 'TODO.md' file. For example, if the Developer have to create a new table in Supabase, add the schema to the 'TODO.md' file together with further instructions.

## To-dos

-   After sign up, for the onboarding, it gets the email used for transactions, whether they want default supabase account and/or the supabase account they will be using for transactions. It then uploads them to Supabase. So, add:
    (1) "email" they will be using
    (2) boolean whether they are using default
    (3) alternate "supabase" url (optional)
    (4) alternate "supabase" api key (optional)
-   After signing in, it does not have to onboard fully. Only onboard when signing up. The email for transactions should be there already. So it does a Supabase check for the most updated email. Check if they use their own supabase account. If yes, get it and initialise the variables for adding categories and transactions to that. Only have push_notifications turned on, that's all.
-   In the profile screen, add an button to change email used for transactions AKA update supabase.
-   Also, create a readme file called 'TODO.md' with all the things I should do to run the app including the schema for new database to add
