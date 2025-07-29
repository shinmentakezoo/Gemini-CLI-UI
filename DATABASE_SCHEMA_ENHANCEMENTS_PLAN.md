# Database Schema Enhancements Plan

## Overview

This document outlines the plan for enhancing the existing database schema to support the new features of the web-based IDE.

## Goals

1.  **Support New Features**: Add new tables and columns to support features like multi-tab editing, debugging, and extensions.
2.  **Scalability**: Ensure that the database schema is scalable and can handle a large amount of data.
3.  **Performance**: Optimize the database schema for performance.
4.  **Data Integrity**: Ensure the integrity of the data stored in the database.

## Existing Schema

The existing schema consists of a single table for user authentication:

```sql
CREATE TABLE geminicliui_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME NULL,
    is_active BOOLEAN DEFAULT 1
);
```

## Proposed Enhancements

### User Sessions

```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES geminicliui_users(id),
    workspace_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP,
    settings JSONB
);
```

### AI Conversations

```sql
CREATE TABLE ai_conversations (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id),
    messages JSONB,
    context_files TEXT[],
    model_used VARCHAR(100),
    created_at TIMESTAMP
);
```

### File Metadata

```sql
CREATE TABLE file_metadata (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id),
    file_path TEXT,
    last_modified TIMESTAMP,
    size BIGINT,
    encoding VARCHAR(50)
);
```

### Editor State

```sql
CREATE TABLE editor_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES geminicliui_users(id),
    project_id TEXT,
    open_tabs JSONB,
    active_tab TEXT,
    layout_config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Debugging Sessions

```sql
CREATE TABLE debug_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES geminicliui_users(id),
    project_id TEXT,
    configuration JSONB,
    breakpoints JSONB,
    watch_expressions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Extension Registry

```sql
CREATE TABLE extensions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    version TEXT NOT NULL,
    author TEXT,
    description TEXT,
    manifest JSONB,
    enabled BOOLEAN DEFAULT 1,
    installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Extension Settings

```sql
CREATE TABLE user_extensions (
    user_id INTEGER REFERENCES geminicliui_users(id),
    extension_id INTEGER REFERENCES extensions(id),
    settings JSONB,
    enabled BOOLEAN DEFAULT 1,
    PRIMARY KEY (user_id, extension_id)
);
```

## Implementation Plan

1.  **Migration Script**: Create a migration script to update the database schema.
2.  **Data Migration**: If necessary, migrate existing data to the new schema.
3.  **Backend Integration**: Update the backend code to use the new schema.
4.  **Testing**: Write comprehensive tests to ensure that the new schema works as expected.

## Security Considerations

-   **Data Encryption**: Encrypt sensitive data at rest.
-   **Access Control**: Implement proper access control to ensure that users can only access their own data.
-   **Data Validation**: Validate all data before inserting it into the database.