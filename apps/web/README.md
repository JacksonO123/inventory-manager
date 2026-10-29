# Web

This is the web app

## General structure

Its a [NextJS](https://nextjs.org) project.

### /app

Where nextjs routes go. Any route can have its own `/components` dir, which is where it has components that should be split up, but not general enough to apply to other parts of the app.

### /client

Things that are strictly client specific

### /components

Generally reusable components

### /components/ui

Highly reusable [chadcn ui](https://ui.shadcn.com/) components

### /contexts, /providers

For react context state

### /hooks

For hooks

### /pages

For libraries that require the legacy app router api

### /server

Things that relate to server functionality or server interaction

### /store

Zustand stores

## Bootstrap admins

Find your user id by running this:

```sql
SELECT * FROM "user" WHERE email = '<your email>';
```

Use that id in this query to set yourself as admin:

```sql
INSERT INTO "admin" (user_id) VALUES ('<your id>');
```

Use that id in this query to set yourself as **super** admin:

```sql
INSERT INTO "super_admin" (user_id) VALUES ('<your id>');
```

**NOTE**: Do not enter yourself as both, just one or the other. It wont "break" anything but its not how the system is designed, and you are likely to run into bugs.
