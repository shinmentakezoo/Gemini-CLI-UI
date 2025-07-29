# Technical Architecture - Web-Based IDE with Gemini CLI Integration

## System Overview

The IDE architecture follows a modular, microservices-inspired design with clear separation of concerns between frontend, backend, and external services.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser] --> B[React SPA]
        B --> C[Service Worker/PWA]
    end
    
    subgraph "Frontend Application"
        D[Monaco Editor Core] --> E[Editor Services]
        E --> F[UI Components]
        F --> G[State Management - Zustand]
        G --> H[API Client Layer]
    end
    
    subgraph "Backend Services"
        I[Express Server :4008] --> J[WebSocket Server]
        J --> K[Session Manager]
        K --> L[API Routes]
        L --> M[Service Layer]
    end
    
    subgraph "Core Services"
        N[File System Service] --> O[Git Service]
        O --> P[Language Server Protocol]
        P --> Q[Debug Adapter Protocol]
        Q --> R[Extension Host]
        R --> S[Gemini CLI Integration]
    end
    
    subgraph "Data Layer"
        T[SQLite Database] --> U[Redis Cache]
        U --> V[File Storage]
        V --> W[Session Storage - JSONL]
    end
    
    subgraph "External Services"
        X[Gemini API] --> Y[Language Servers]
        Y --> Z[Git Operations]
    end
    
    B --> I
    H --> I
    J --> S
    M --> N
    S --> X
    P --> Y
    O --> Z
    M --> T