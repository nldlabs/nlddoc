---
title: Mermaid Diagrams
order: 7
---

# Mermaid Diagrams

FastDocs includes built-in support for Mermaid diagrams, allowing you to create flowcharts, sequence diagrams, and other visualizations directly in your markdown files.

## Flowchart Example

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant FastDocs
    participant VitePress
    
    User->>FastDocs: Run serve command
    FastDocs->>VitePress: Create temp project
    VitePress->>FastDocs: Return dev server
    FastDocs->>User: Display documentation
```

## Class Diagram

```mermaid
classDiagram
    class DocumentationSite {
        +String title
        +String description
        +Array pages
        +generateSidebar()
        +build()
    }
    
    class Page {
        +String path
        +String title
        +Number order
        +render()
    }
    
    DocumentationSite "1" --> "*" Page
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start Build
    Processing --> Building: Dependencies Installed
    Building --> Complete: Build Success
    Building --> Error: Build Failed
    Error --> Processing: Retry
    Complete --> [*]
```

## Git Graph

```mermaid
gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
```

## Pie Chart

```mermaid
pie title Project Time Distribution
    "Planning" : 15
    "Development" : 45
    "Testing" : 25
    "Documentation" : 15
```

## Resources

- [Mermaid Official Documentation](https://mermaid.js.org/)
- [Live Mermaid Editor](https://mermaid.live/)
- [Mermaid Syntax Reference](https://mermaid.js.org/intro/syntax-reference.html)

