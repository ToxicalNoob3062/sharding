FROM oven/bun

WORKDIR /app

COPY package.json package.json

COPY tsconfig.json tsconfig.json

RUN  bun install

COPY node_modules/hashring/index.d.ts /node_modules/hashring/index.d.ts

COPY index.ts index.ts

CMD bun run index.ts



