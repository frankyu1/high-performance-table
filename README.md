# High Performance React Table

A high-performance, virtualized table component built with React that can efficiently handle large datasets (10,000 rows) while maintaining smooth scrolling and responsive performance.

## Features

- **Virtual Scrolling**: Only renders visible rows plus buffer rows, dramatically reducing DOM nodes
- **Sortable Columns**: Click column headers to sort data
- **Filtering**: Filter rows by ID with debounced search
- **URL State Management**: Table state (sort, filter) is preserved in URL parameters

### Virtual Scrolling
The table implements virtual scrolling through a three-layer structure:
1. Outer container with `overflow-y: auto`
2. Middle div with total height of all rows
3. Inner div with absolutely positioned visible rows

This architecture allows for:
- Smooth scrolling with minimal DOM nodes
- Correct scrollbar behavior
- Accurate row positioning

### Row Height Management
- Dynamic row height calculation based on content
- Minimum row height enforcement
- Efficient height caching

### State Management
- URL parameters for filter and sort state
- Debounced filter input
- Memoized calculations for performance

## Getting Started

### Installation

```bash
yarn install
```

### Development

```bash
yarn run dev
```
## License

MIT
