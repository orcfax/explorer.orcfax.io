# Orcfax Fact Explorer

A Human-Readable UI for Orcfax Oracle Network hosted at [explorer.orcfax.io](https://explorer.orcfax.io).

Uses the [explorer-index](https://github.com/orcfax/explorer-index) to index and sync fact statement, feed, node, source, and archive data for display on the explorer.

Also uses the [static-archive-viewer](https://github.com/orcfax/static-archive-viewer) for downloading and viewing fact statement archives offline.

## Overview

The Orcfax Fact Explorer is a SvelteKit application that provides a human-readable interface for exploring and analyzing data on the Orcfax Oracle Network. It offers a comprehensive view of the Orcfax network's data and operations.

### Key Features

- **Fact Statement Explorer**: Browse and search through all fact statements with detailed information
- **Oracle Feed Charts**: Explore all Orcfax feeds with helpful charts and tables
- **Network Summary**: View real-time statistics including total facts, active feeds, and 24-hour metrics
- **Node Details**: Monitor node status, locations, and performance
- **Source Details**: Explore the sources of a fact statement, and see the original data and processing steps used to generate the fact.
- **Archive Explorer**: Fetch, and explore all fact statement archives stored on the Arweave storage network.
- **Offline Archive Viewer**: Download and view fact statement archives offline.

## Getting Started

### Local Development

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd explorer.orcfax.io
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   # Update the .env file with your configuration
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Start the development server:
   ```bash
   pnpm run dev -- --open
   ```

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run linting checks
- `pnpm run format` - Format code using Prettier

## Contributing

Please read our [Security Policy](SECURITY.md) and [License](LICENSE.txt) before contributing to the project.

If you would like to file a bug report or submit a feature request, please use the [GitHub Issues](https://github.com/orcfax/explorer.orcfax.io/issues) page.

## License

This project is licensed under the terms included in [LICENSE.txt](LICENSE.txt).

## Copyright

Copyright © Orcfax Ltd. All rights reserved.
