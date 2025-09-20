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

-   For the budget categories, make the categories a clickable. After I click it, I should be able to delete or edit the budget amount which then updates Supabase's category table.
-   Additionally, the mobile application is supposed to intercept the email. How do I activate this? Add the instructions to the bottom of the TODO.md file. Additionally, I want to test whether it works by sending an email from another gmail account. Help me create some files such that I can test whether it is working. Do it by creating a test parser which I can use currently which receives from emails "timeformetostudy@gmail.com"
