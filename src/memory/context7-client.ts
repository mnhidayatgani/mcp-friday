/**
 * Context7 Client
 * Integration with Upstash Context7 for library documentation
 */

interface Context7Library {
  id: string;
  name: string;
  description: string;
  trustScore: number;
}

interface Context7Docs {
  content: string;
  library: string;
  relevance: number;
}

export class Context7Client {
  private baseUrl = "https://context7.ai/api";
  
  /**
   * Resolve library ID from name
   */
  resolveLibrary(libraryName: string): Promise<Context7Library | null> {
    try {
      // Comprehensive library mapping
      const knownLibraries: Record<string, Context7Library> = {
        // Frontend Frameworks
        "react": { id: "/facebook/react", name: "React", description: "A JavaScript library for building user interfaces", trustScore: 10 },
        "next.js": { id: "/vercel/next.js", name: "Next.js", description: "The React Framework for Production", trustScore: 10 },
        "nextjs": { id: "/vercel/next.js", name: "Next.js", description: "The React Framework for Production", trustScore: 10 },
        "vue": { id: "/vuejs/vue", name: "Vue.js", description: "Progressive JavaScript Framework", trustScore: 10 },
        "vue.js": { id: "/vuejs/vue", name: "Vue.js", description: "Progressive JavaScript Framework", trustScore: 10 },
        "nuxt": { id: "/nuxt/nuxt", name: "Nuxt", description: "The Intuitive Vue Framework", trustScore: 9 },
        "nuxt.js": { id: "/nuxt/nuxt", name: "Nuxt", description: "The Intuitive Vue Framework", trustScore: 9 },
        "angular": { id: "/angular/angular", name: "Angular", description: "Platform for building mobile and desktop web applications", trustScore: 10 },
        "svelte": { id: "/sveltejs/svelte", name: "Svelte", description: "Cybernetically enhanced web apps", trustScore: 9 },
        "sveltekit": { id: "/sveltejs/kit", name: "SvelteKit", description: "Web development, streamlined", trustScore: 9 },
        "solid": { id: "/solidjs/solid", name: "Solid", description: "Simple and performant reactivity", trustScore: 8 },
        "solidjs": { id: "/solidjs/solid", name: "Solid", description: "Simple and performant reactivity", trustScore: 8 },
        
        // Backend Frameworks
        "express": { id: "/expressjs/express", name: "Express", description: "Fast, unopinionated, minimalist web framework", trustScore: 10 },
        "express.js": { id: "/expressjs/express", name: "Express", description: "Fast, unopinionated, minimalist web framework", trustScore: 10 },
        "fastify": { id: "/fastify/fastify", name: "Fastify", description: "Fast and low overhead web framework", trustScore: 9 },
        "nest.js": { id: "/nestjs/nest", name: "NestJS", description: "Progressive Node.js framework", trustScore: 9 },
        "nestjs": { id: "/nestjs/nest", name: "NestJS", description: "Progressive Node.js framework", trustScore: 9 },
        "koa": { id: "/koajs/koa", name: "Koa", description: "Expressive middleware for Node.js", trustScore: 9 },
        "hapi": { id: "/hapijs/hapi", name: "Hapi", description: "Rich framework for building applications", trustScore: 8 },
        "hono": { id: "/honojs/hono", name: "Hono", description: "Ultrafast web framework", trustScore: 8 },
        
        // Database & ORM
        "prisma": { id: "/prisma/prisma", name: "Prisma", description: "Next-generation ORM for Node.js and TypeScript", trustScore: 10 },
        "mongoose": { id: "/Automattic/mongoose", name: "Mongoose", description: "MongoDB object modeling for Node.js", trustScore: 9 },
        "typeorm": { id: "/typeorm/typeorm", name: "TypeORM", description: "ORM for TypeScript and JavaScript", trustScore: 9 },
        "sequelize": { id: "/sequelize/sequelize", name: "Sequelize", description: "Promise-based Node.js ORM", trustScore: 9 },
        "drizzle": { id: "/drizzle-team/drizzle-orm", name: "Drizzle ORM", description: "TypeScript ORM", trustScore: 8 },
        "drizzle-orm": { id: "/drizzle-team/drizzle-orm", name: "Drizzle ORM", description: "TypeScript ORM", trustScore: 8 },
        "knex": { id: "/knex/knex", name: "Knex.js", description: "SQL query builder", trustScore: 8 },
        "kysely": { id: "/koskimas/kysely", name: "Kysely", description: "Type-safe SQL query builder", trustScore: 8 },
        
        // Databases
        "redis": { id: "/redis/redis", name: "Redis", description: "In-memory data structure store", trustScore: 10 },
        "postgresql": { id: "/postgres/postgres", name: "PostgreSQL", description: "The World's Most Advanced Open Source Database", trustScore: 10 },
        "postgres": { id: "/postgres/postgres", name: "PostgreSQL", description: "The World's Most Advanced Open Source Database", trustScore: 10 },
        "mongodb": { id: "/mongodb/mongo", name: "MongoDB", description: "Document database", trustScore: 10 },
        "mysql": { id: "/mysql/mysql-server", name: "MySQL", description: "Open-source relational database", trustScore: 10 },
        
        // Testing
        "jest": { id: "/jestjs/jest", name: "Jest", description: "Delightful JavaScript Testing", trustScore: 10 },
        "vitest": { id: "/vitest-dev/vitest", name: "Vitest", description: "Next Generation Testing Framework", trustScore: 9 },
        "playwright": { id: "/microsoft/playwright", name: "Playwright", description: "End-to-end testing framework", trustScore: 10 },
        "cypress": { id: "/cypress-io/cypress", name: "Cypress", description: "Fast, easy and reliable testing", trustScore: 9 },
        "testing-library": { id: "/testing-library/react-testing-library", name: "Testing Library", description: "Simple testing utilities", trustScore: 9 },
        "mocha": { id: "/mochajs/mocha", name: "Mocha", description: "JavaScript test framework", trustScore: 9 },
        "chai": { id: "/chaijs/chai", name: "Chai", description: "BDD/TDD assertion library", trustScore: 8 },
        
        // Authentication
        "passport": { id: "/jaredhanson/passport", name: "Passport", description: "Simple, unobtrusive authentication for Node.js", trustScore: 9 },
        "passport.js": { id: "/jaredhanson/passport", name: "Passport", description: "Simple, unobtrusive authentication for Node.js", trustScore: 9 },
        "next-auth": { id: "/nextauthjs/next-auth", name: "NextAuth.js", description: "Authentication for Next.js", trustScore: 9 },
        "nextauth": { id: "/nextauthjs/next-auth", name: "NextAuth.js", description: "Authentication for Next.js", trustScore: 9 },
        "auth0": { id: "/auth0/node-auth0", name: "Auth0", description: "Auth0 SDK for Node.js", trustScore: 9 },
        "clerk": { id: "/clerkinc/javascript", name: "Clerk", description: "Complete user management", trustScore: 8 },
        
        // CSS & Styling
        "tailwind": { id: "/tailwindlabs/tailwindcss", name: "Tailwind CSS", description: "A utility-first CSS framework", trustScore: 10 },
        "tailwindcss": { id: "/tailwindlabs/tailwindcss", name: "Tailwind CSS", description: "A utility-first CSS framework", trustScore: 10 },
        "bootstrap": { id: "/twbs/bootstrap", name: "Bootstrap", description: "Popular CSS framework", trustScore: 10 },
        "material-ui": { id: "/mui/material-ui", name: "Material-UI", description: "React components for faster development", trustScore: 9 },
        "mui": { id: "/mui/material-ui", name: "Material-UI", description: "React components for faster development", trustScore: 9 },
        "chakra-ui": { id: "/chakra-ui/chakra-ui", name: "Chakra UI", description: "Simple, modular component library", trustScore: 9 },
        "styled-components": { id: "/styled-components/styled-components", name: "styled-components", description: "CSS-in-JS library", trustScore: 9 },
        "emotion": { id: "/emotion-js/emotion", name: "Emotion", description: "CSS-in-JS library", trustScore: 8 },
        "sass": { id: "/sass/sass", name: "Sass", description: "CSS extension language", trustScore: 9 },
        "less": { id: "/less/less.js", name: "Less", description: "CSS preprocessor", trustScore: 8 },
        
        // Real-time & WebSocket
        "socket.io": { id: "/socketio/socket.io", name: "Socket.IO", description: "Realtime application framework", trustScore: 9 },
        "socketio": { id: "/socketio/socket.io", name: "Socket.IO", description: "Realtime application framework", trustScore: 9 },
        "ws": { id: "/websockets/ws", name: "ws", description: "Simple WebSocket client and server", trustScore: 9 },
        "pusher": { id: "/pusher/pusher-http-node", name: "Pusher", description: "Hosted WebSocket service", trustScore: 8 },
        
        // State Management
        "redux": { id: "/reduxjs/redux", name: "Redux", description: "Predictable state container", trustScore: 10 },
        "zustand": { id: "/pmndrs/zustand", name: "Zustand", description: "Small, fast state management", trustScore: 9 },
        "jotai": { id: "/pmndrs/jotai", name: "Jotai", description: "Primitive and flexible state management", trustScore: 8 },
        "recoil": { id: "/facebookexperimental/Recoil", name: "Recoil", description: "State management library for React", trustScore: 8 },
        "mobx": { id: "/mobxjs/mobx", name: "MobX", description: "Simple, scalable state management", trustScore: 9 },
        "pinia": { id: "/vuejs/pinia", name: "Pinia", description: "Vue Store", trustScore: 9 },
        
        // Build Tools
        "vite": { id: "/vitejs/vite", name: "Vite", description: "Next Generation Frontend Tooling", trustScore: 10 },
        "webpack": { id: "/webpack/webpack", name: "Webpack", description: "Module bundler", trustScore: 10 },
        "rollup": { id: "/rollup/rollup", name: "Rollup", description: "Module bundler", trustScore: 9 },
        "esbuild": { id: "/evanw/esbuild", name: "esbuild", description: "Extremely fast JavaScript bundler", trustScore: 9 },
        "parcel": { id: "/parcel-bundler/parcel", name: "Parcel", description: "Zero configuration build tool", trustScore: 8 },
        "turbopack": { id: "/vercel/turbo", name: "Turbopack", description: "Incremental bundler", trustScore: 8 },
        
        // Languages & Runtimes
        "typescript": { id: "/microsoft/TypeScript", name: "TypeScript", description: "TypeScript is a superset of JavaScript", trustScore: 10 },
        "node": { id: "/nodejs/node", name: "Node.js", description: "JavaScript runtime", trustScore: 10 },
        "node.js": { id: "/nodejs/node", name: "Node.js", description: "JavaScript runtime", trustScore: 10 },
        "nodejs": { id: "/nodejs/node", name: "Node.js", description: "JavaScript runtime", trustScore: 10 },
        "deno": { id: "/denoland/deno", name: "Deno", description: "Modern JavaScript/TypeScript runtime", trustScore: 9 },
        "bun": { id: "/oven-sh/bun", name: "Bun", description: "Fast all-in-one JavaScript runtime", trustScore: 9 },
        
        // API & GraphQL
        "graphql": { id: "/graphql/graphql-js", name: "GraphQL", description: "Query language for APIs", trustScore: 10 },
        "apollo": { id: "/apollographql/apollo-server", name: "Apollo Server", description: "GraphQL server", trustScore: 9 },
        "apollo-server": { id: "/apollographql/apollo-server", name: "Apollo Server", description: "GraphQL server", trustScore: 9 },
        "trpc": { id: "/trpc/trpc", name: "tRPC", description: "End-to-end typesafe APIs", trustScore: 9 },
        "axios": { id: "/axios/axios", name: "Axios", description: "Promise based HTTP client", trustScore: 9 },
        "fetch": { id: "/node-fetch/node-fetch", name: "node-fetch", description: "Fetch API for Node.js", trustScore: 8 },
        
        // Validation & Schema
        "zod": { id: "/colinhacks/zod", name: "Zod", description: "TypeScript-first schema validation", trustScore: 9 },
        "yup": { id: "/jquense/yup", name: "Yup", description: "Schema validation library", trustScore: 8 },
        "joi": { id: "/hapijs/joi", name: "Joi", description: "Schema description and validation", trustScore: 9 },
        "ajv": { id: "/ajv-validator/ajv", name: "Ajv", description: "JSON schema validator", trustScore: 9 },
        
        // Utilities
        "lodash": { id: "/lodash/lodash", name: "Lodash", description: "Modern JavaScript utility library", trustScore: 10 },
        "ramda": { id: "/ramda/ramda", name: "Ramda", description: "Functional programming library", trustScore: 8 },
        "date-fns": { id: "/date-fns/date-fns", name: "date-fns", description: "Modern date utility library", trustScore: 9 },
        "moment": { id: "/moment/moment", name: "Moment.js", description: "Parse, validate, manipulate dates", trustScore: 9 },
        "dayjs": { id: "/iamkun/dayjs", name: "Day.js", description: "Fast 2kB alternative to Moment.js", trustScore: 9 },
        
        // Documentation
        "storybook": { id: "/storybookjs/storybook", name: "Storybook", description: "UI component dev & test", trustScore: 9 },
        "docusaurus": { id: "/facebook/docusaurus", name: "Docusaurus", description: "Easy documentation websites", trustScore: 9 },
        "vitepress": { id: "/vuejs/vitepress", name: "VitePress", description: "Vite & Vue powered static site generator", trustScore: 8 },
        "nextra": { id: "/shuding/nextra", name: "Nextra", description: "Next.js based documentation", trustScore: 8 },
      };
      
      const lib = knownLibraries[libraryName.toLowerCase()];
      return Promise.resolve(lib || null);
    } catch {
      return Promise.resolve(null);
    }
  }

  /**
   * Get documentation for a library
   */
  getDocs(libraryId: string, topic?: string, _maxTokens = 5000): Promise<Context7Docs | null> {
    try {
      // This is a placeholder that returns useful info
      // In production, this would call the actual Context7 MCP server
      
      const libraryName = libraryId.split("/").pop() || libraryId;
      
      return Promise.resolve({
        library: libraryName,
        content: `Please consult ${libraryName} official documentation for: ${topic || "general usage"}
        
Common resources:
- Official docs: https://docs.${libraryName.toLowerCase()}.com
- GitHub: https://github.com${libraryId}
- NPM: https://npmjs.com/package/${libraryName}

For MCP integration with Context7, use the upstash-conte MCP server to fetch real-time documentation.`,
        relevance: 0.6,
      });
    } catch {
      return Promise.resolve(null);
    }
  }

  /**
   * Search for libraries by topic
   */
  searchLibraries(topic: string): Promise<Context7Library[]> {
    const libraries: Context7Library[] = [];
    const topicLower = topic.toLowerCase();
    
    // Authentication & Authorization
    if (topicLower.match(/auth|login|user|session|jwt|oauth|security/)) {
      libraries.push(
        { id: "/jaredhanson/passport", name: "Passport", description: "Authentication middleware", trustScore: 9 },
        { id: "/nextauthjs/next-auth", name: "NextAuth.js", description: "Auth for Next.js", trustScore: 9 },
        { id: "/auth0/node-auth0", name: "Auth0", description: "Auth0 SDK", trustScore: 9 },
        { id: "/clerkinc/javascript", name: "Clerk", description: "User management", trustScore: 8 }
      );
    }
    
    // Database & ORM
    if (topicLower.match(/database|orm|sql|query|model|schema|migration/)) {
      libraries.push(
        { id: "/prisma/prisma", name: "Prisma", description: "Next-gen ORM", trustScore: 10 },
        { id: "/Automattic/mongoose", name: "Mongoose", description: "MongoDB ODM", trustScore: 9 },
        { id: "/typeorm/typeorm", name: "TypeORM", description: "TypeScript ORM", trustScore: 9 },
        { id: "/sequelize/sequelize", name: "Sequelize", description: "Promise-based ORM", trustScore: 9 },
        { id: "/drizzle-team/drizzle-orm", name: "Drizzle ORM", description: "TypeScript ORM", trustScore: 8 }
      );
    }
    
    // PostgreSQL specific
    if (topicLower.match(/postgres|postgresql|pg/)) {
      libraries.push(
        { id: "/postgres/postgres", name: "PostgreSQL", description: "Advanced database", trustScore: 10 },
        { id: "/prisma/prisma", name: "Prisma", description: "With PostgreSQL support", trustScore: 10 }
      );
    }
    
    // MongoDB specific
    if (topicLower.match(/mongodb|mongo|nosql|document/)) {
      libraries.push(
        { id: "/mongodb/mongo", name: "MongoDB", description: "Document database", trustScore: 10 },
        { id: "/Automattic/mongoose", name: "Mongoose", description: "MongoDB ODM", trustScore: 9 }
      );
    }
    
    // Redis & Caching
    if (topicLower.match(/redis|cache|memory|queue|pub\/sub/)) {
      libraries.push(
        { id: "/redis/redis", name: "Redis", description: "In-memory store", trustScore: 10 }
      );
    }
    
    // Testing
    if (topicLower.match(/test|testing|spec|e2e|unit|integration/)) {
      libraries.push(
        { id: "/jestjs/jest", name: "Jest", description: "JavaScript Testing", trustScore: 10 },
        { id: "/vitest-dev/vitest", name: "Vitest", description: "Next-gen Testing", trustScore: 9 },
        { id: "/microsoft/playwright", name: "Playwright", description: "E2E testing", trustScore: 10 },
        { id: "/cypress-io/cypress", name: "Cypress", description: "E2E testing", trustScore: 9 },
        { id: "/testing-library/react-testing-library", name: "Testing Library", description: "Testing utilities", trustScore: 9 }
      );
    }
    
    // Real-time & WebSocket
    if (topicLower.match(/real.*time|websocket|socket|chat|live|streaming/)) {
      libraries.push(
        { id: "/socketio/socket.io", name: "Socket.IO", description: "Real-time framework", trustScore: 9 },
        { id: "/websockets/ws", name: "ws", description: "WebSocket library", trustScore: 9 }
      );
    }
    
    // CSS & Styling
    if (topicLower.match(/css|style|styling|ui|component|design/)) {
      libraries.push(
        { id: "/tailwindlabs/tailwindcss", name: "Tailwind CSS", description: "Utility-first CSS", trustScore: 10 },
        { id: "/mui/material-ui", name: "Material-UI", description: "React components", trustScore: 9 },
        { id: "/chakra-ui/chakra-ui", name: "Chakra UI", description: "Component library", trustScore: 9 },
        { id: "/styled-components/styled-components", name: "styled-components", description: "CSS-in-JS", trustScore: 9 }
      );
    }
    
    // State Management
    if (topicLower.match(/state|redux|store|context|global/)) {
      libraries.push(
        { id: "/reduxjs/redux", name: "Redux", description: "State container", trustScore: 10 },
        { id: "/pmndrs/zustand", name: "Zustand", description: "State management", trustScore: 9 },
        { id: "/pmndrs/jotai", name: "Jotai", description: "Atomic state", trustScore: 8 },
        { id: "/mobxjs/mobx", name: "MobX", description: "Reactive state", trustScore: 9 }
      );
    }
    
    // API & GraphQL
    if (topicLower.match(/api|graphql|rest|endpoint|fetch|http/)) {
      libraries.push(
        { id: "/graphql/graphql-js", name: "GraphQL", description: "Query language", trustScore: 10 },
        { id: "/apollographql/apollo-server", name: "Apollo Server", description: "GraphQL server", trustScore: 9 },
        { id: "/trpc/trpc", name: "tRPC", description: "Typesafe APIs", trustScore: 9 },
        { id: "/axios/axios", name: "Axios", description: "HTTP client", trustScore: 9 }
      );
    }
    
    // Validation
    if (topicLower.match(/validat|schema|form|input|check/)) {
      libraries.push(
        { id: "/colinhacks/zod", name: "Zod", description: "Schema validation", trustScore: 9 },
        { id: "/jquense/yup", name: "Yup", description: "Validation library", trustScore: 8 },
        { id: "/hapijs/joi", name: "Joi", description: "Schema validation", trustScore: 9 }
      );
    }
    
    // Build Tools
    if (topicLower.match(/build|bundle|vite|webpack|rollup|compiler/)) {
      libraries.push(
        { id: "/vitejs/vite", name: "Vite", description: "Build tool", trustScore: 10 },
        { id: "/webpack/webpack", name: "Webpack", description: "Module bundler", trustScore: 10 },
        { id: "/evanw/esbuild", name: "esbuild", description: "Fast bundler", trustScore: 9 }
      );
    }
    
    // Frontend Frameworks
    if (topicLower.match(/react|next|component|jsx|tsx/)) {
      libraries.push(
        { id: "/facebook/react", name: "React", description: "UI library", trustScore: 10 },
        { id: "/vercel/next.js", name: "Next.js", description: "React framework", trustScore: 10 }
      );
    }
    
    if (topicLower.match(/vue|nuxt/)) {
      libraries.push(
        { id: "/vuejs/vue", name: "Vue.js", description: "Progressive framework", trustScore: 10 },
        { id: "/nuxt/nuxt", name: "Nuxt", description: "Vue framework", trustScore: 9 }
      );
    }
    
    if (topicLower.match(/svelte|sveltekit/)) {
      libraries.push(
        { id: "/sveltejs/svelte", name: "Svelte", description: "Cybernetically enhanced", trustScore: 9 },
        { id: "/sveltejs/kit", name: "SvelteKit", description: "Web framework", trustScore: 9 }
      );
    }
    
    // Backend Frameworks
    if (topicLower.match(/express|server|backend|api|middleware/)) {
      libraries.push(
        { id: "/expressjs/express", name: "Express", description: "Web framework", trustScore: 10 },
        { id: "/fastify/fastify", name: "Fastify", description: "Fast framework", trustScore: 9 },
        { id: "/nestjs/nest", name: "NestJS", description: "Progressive framework", trustScore: 9 }
      );
    }
    
    // Documentation
    if (topicLower.match(/doc|documentation|storybook|guide/)) {
      libraries.push(
        { id: "/storybookjs/storybook", name: "Storybook", description: "UI dev tool", trustScore: 9 },
        { id: "/facebook/docusaurus", name: "Docusaurus", description: "Documentation site", trustScore: 9 },
        { id: "/vuejs/vitepress", name: "VitePress", description: "Static site generator", trustScore: 8 }
      );
    }
    
    // Utilities
    if (topicLower.match(/util|helper|lodash|date|time/)) {
      libraries.push(
        { id: "/lodash/lodash", name: "Lodash", description: "Utility library", trustScore: 10 },
        { id: "/date-fns/date-fns", name: "date-fns", description: "Date utilities", trustScore: 9 },
        { id: "/iamkun/dayjs", name: "Day.js", description: "Date library", trustScore: 9 }
      );
    }
    
    return Promise.resolve(libraries);
  }
}

/**
 * Note: For full Context7 integration, use the MCP server approach:
 * 
 * Add to MCP config:
 * {
 *   "upstash-conte": {
 *     "command": "npx",
 *     "args": ["-y", "@upstash/conte-mcp"]
 *   }
 * }
 * 
 * Then use MCP client to call:
 * - resolve-library-id: Get library ID
 * - get-library-docs: Fetch actual documentation
 */
