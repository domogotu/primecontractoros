# PrimeContractorOS V2 Baseline Validation

Branch: `agent/complete-v2-mirror`  
Commit tested: `e59b2f02ee4f5c8794fba57ddd2068216535c969`  
Node: `v22.23.1`  
pnpm: `10.4.1`

## Results

| Check | Exit code |
|---|---:|
| pnpm install --frozen-lockfile | 0 |
| pnpm db:push (ephemeral MySQL) | 0 |
| pnpm check | 0 |
| pnpm test | 0 |
| pnpm build | 0 |

Exit code 0 means pass. Exit code 99 means skipped because dependency installation failed.

## Install output (tail)

```text
+ @radix-ui/react-toggle-group 1.1.11
+ @radix-ui/react-tooltip 1.2.8
+ @tanstack/react-query 5.100.9
+ @trpc/client 11.17.0
+ @trpc/react-query 11.17.0
+ @trpc/server 11.17.0
+ @types/archiver 7.0.0
+ @types/pdfkit 0.17.6
+ archiver 8.0.0
+ axios 1.12.2
+ bcryptjs 3.0.3
+ better-sqlite3 12.9.0
+ class-variance-authority 0.7.1
+ clsx 2.1.1
+ cmdk 1.1.1
+ cookie 1.1.1
+ date-fns 4.1.0
+ dotenv 17.4.2
+ drizzle-orm 0.44.7
+ embla-carousel-react 8.6.0
+ express 4.21.2
+ framer-motion 12.23.22
+ input-otp 1.4.2
+ jose 6.1.0
+ jsonwebtoken 9.0.3
+ lucide-react 0.453.0
+ mysql2 3.22.3
+ nanoid 5.1.6
+ next-themes 0.4.6
+ pdfkit 0.18.0
+ react 19.2.1
+ react-day-picker 9.11.1
+ react-dom 19.2.1
+ react-hook-form 7.64.0
+ react-resizable-panels 3.0.6
+ recharts 2.15.4
+ resend 6.12.2
+ sonner 2.0.7
+ streamdown 1.4.0
+ stripe 22.1.0
+ superjson 1.13.3
+ tailwind-merge 3.3.1
+ tailwindcss-animate 1.0.7
+ uuid 14.0.0
+ vaul 1.1.2
+ wouter 3.7.1
+ zod 4.1.12

devDependencies:
+ @builder.io/vite-plugin-jsx-loc 0.1.1
+ @tailwindcss/typography 0.5.19
+ @tailwindcss/vite 4.1.14
+ @types/bcryptjs 3.0.0
+ @types/better-sqlite3 7.6.13
+ @types/express 4.17.21
+ @types/google.maps 3.58.1
+ @types/jsonwebtoken 9.0.10
+ @types/node 24.7.0
+ @types/react 19.2.1
+ @types/react-dom 19.2.1
+ @vitejs/plugin-react 5.0.4
+ add 2.0.6
+ autoprefixer 10.4.21
+ drizzle-kit 0.31.10
+ esbuild 0.25.10
+ playwright 1.60.0
+ pnpm 10.18.1
+ postcss 8.5.6
+ prettier 3.6.2
+ tailwindcss 4.1.14
+ tsx 4.20.6
+ tw-animate-css 1.4.0
+ typescript 5.9.3
+ vite 7.1.9
+ vite-plugin-manus-runtime 0.0.57
+ vitest 2.1.9

╭ Warning ─────────────────────────────────────────────────────────────────────╮│                                                                              ││   Ignored build scripts: better-sqlite3.                                     ││   Run "pnpm approve-builds" to pick which dependencies should be allowed     ││   to run scripts.                                                            ││                                                                              │╰──────────────────────────────────────────────────────────────────────────────╯

Done in 6.4s using pnpm v10.4.1
```

## Db output (tail)

```text

> prime-contractor-os@1.0.0 db:push /home/runner/work/-primecontractoros-v2/-primecontractoros-v2
> drizzle-kit generate && drizzle-kit migrate

No config path provided, using default 'drizzle.config.ts'
Reading config file '/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/drizzle.config.ts'
Reading schema files:
/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/drizzle/schema.ts

Error: Interactive prompts require a TTY terminal (process.stdin.isTTY or process.stdout.isTTY is false). This can happen when running in CI, piped input, or non-interactive shells.
    at render10 (/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/node_modules/.pnpm/drizzle-kit@0.31.10/node_modules/drizzle-kit/bin.cjs:1450:31)
    at promptColumnsConflicts (/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/node_modules/.pnpm/drizzle-kit@0.31.10/node_modules/drizzle-kit/bin.cjs:32711:65)
    at columnsResolver (/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/node_modules/.pnpm/drizzle-kit@0.31.10/node_modules/drizzle-kit/bin.cjs:32146:28)
    at applyMysqlSnapshotsDiff (/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/node_modules/.pnpm/drizzle-kit@0.31.10/node_modules/drizzle-kit/bin.cjs:29175:53)
    at process.processTicksAndRejections (node:internal/process/ta[REDACTED_TOKEN]:103:5)
    at async prepareAndMigrateMysql (/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/node_modules/.pnpm/drizzle-kit@0.31.10/node_modules/drizzle-kit/bin.cjs:32331:54)
    at async Object.handler (/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/node_modules/.pnpm/drizzle-kit@0.31.10/node_modules/drizzle-kit/bin.cjs:91990:7)
    at async run (/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/node_modules/.pnpm/drizzle-kit@0.31.10/node_modules/drizzle-kit/bin.cjs:91472:7)
No config path provided, using default 'drizzle.config.ts'
Reading config file '/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/drizzle.config.ts'
[⣷] applying migrations...[2K[1G[⣯] applying migrations...[2K[1G[⣟] applying migrations...[2K[1G[⡿] applying migrations...[2K[1G[⢿] applying migrations...[2K[1G[⣻] applying migrations...[2K[1G[⣽] applying migrations...[2K[1G[⣷] applying migrations...[2K[1G[⣯] applying migrations...[2K[1G[✓] migrations applied successfully!```

## Check output (tail)

```text

> prime-contractor-os@1.0.0 check /home/runner/work/-primecontractoros-v2/-primecontractoros-v2
> tsc --noEmit

```

## Test output (tail)

```text

> prime-contractor-os@1.0.0 test /home/runner/work/-primecontractoros-v2/-primecontractoros-v2
> vitest run


[1m[7m[36m RUN [39m[27m[22m [36mv2.1.9 [39m[90m/home/runner/work/-primecontractoros-v2/-primecontractoros-v2[39m

 [32m✓[39m server/loginFix.test.ts [2m([22m[2m9 tests[22m[2m)[22m[90m 6[2mms[22m[39m
 [32m✓[39m server/guidance.test.ts [2m([22m[2m12 tests[22m[2m)[22m[90m 147[2mms[22m[39m
 [32m✓[39m server/phase32.test.ts [2m([22m[2m12 tests[22m[2m)[22m[33m 1146[2mms[22m[39m
   [33m[2m✓[22m[39m Phase 32: Infrastructure Wiring[2m > [22mRBAC Middleware[2m > [22mshould export enforcePermission function [33m828[2mms[22m[39m
 [32m✓[39m server/crud.test.ts [2m([22m[2m23 tests[22m[2m)[22m[33m 2594[2mms[22m[39m
   [33m[2m✓[22m[39m Opportunities CRUD[2m > [22mshould list opportunities [33m2559[2mms[22m[39m
 [32m✓[39m server/lessonsAndAdmin.test.ts [2m([22m[2m10 tests[22m[2m)[22m[33m 1260[2mms[22m[39m
   [33m[2m✓[22m[39m Lessons Learned Router - Structure[2m > [22mshould export lessonsLearnedRouter with expected procedures [33m1225[2mms[22m[39m
 [32m✓[39m server/emailNotifications.test.ts [2m([22m[2m7 tests[22m[2m)[22m[90m 4[2mms[22m[39m
 [32m✓[39m server/resend.test.ts [2m([22m[2m5 tests[22m[2m)[22m[90m 15[2mms[22m[39m
 [32m✓[39m server/aiEngine.test.ts [2m([22m[2m3 tests[22m[2m)[22m[33m 775[2mms[22m[39m
   [33m[2m✓[22m[39m AI Engine[2m > [22mshould export required workflow functions [33m771[2mms[22m[39m
 [32m✓[39m server/platformAdmin.test.ts [2m([22m[2m8 tests[22m[2m)[22m[33m 970[2mms[22m[39m
   [33m[2m✓[22m[39m Platform Admin Router - Security[2m > [22mshould define admin-only procedures for workspaces [33m966[2mms[22m[39m
 [32m✓[39m server/platform.test.ts [2m([22m[2m3 tests[22m[2m)[22m[33m 941[2mms[22m[39m
   [33m[2m✓[22m[39m Platform Router[2m > [22mshould export workspace and platform routers [33m938[2mms[22m[39m
 [32m✓[39m server/auth.logout.test.ts [2m([22m[2m1 test[22m[2m)[22m[90m 6[2mms[22m[39m
 [32m✓[39m server/batch-routers.test.ts [2m([22m[2m9 tests[22m[2m)[22m[90m 8[2mms[22m[39m
 [32m✓[39m server/batchRouters.test.ts [2m([22m[2m1 test[22m[2m)[22m[90m 2[2mms[22m[39m

[2m Test Files [22m [1m[32m13 passed[39m[22m[90m (13)[39m
[2m      Tests [22m [1m[32m103 passed[39m[22m[90m (103)[39m
[2m   Start at [22m 19:22:06
[2m   Duration [22m 6.62s[2m (transform 1.52s, setup 0ms, collect 7.29s, tests 7.87s, environment 3ms, prepare 1.24s)[22m

```

## Build output (tail)

```text

> prime-contractor-os@1.0.0 build /home/runner/work/-primecontractoros-v2/-primecontractoros-v2
> vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

[36mvite v7.1.9 [32mbuilding for production...[36m[39m
[33m[1m(!) %VITE_ANALYTICS_ENDPOINT% is not defined in env variables found in /index.html. Is the variable mistyped?[22m[39m
[33m[1m(!) %VITE_ANALYTICS_WEBSITE_ID% is not defined in env variables found in /index.html. Is the variable mistyped?[22m[39m
<script src="%VITE_ANALYTICS_ENDPOINT%/umami"> in "/index.html" can't be bundled without type="module" attribute
transforming...
[32m✓[39m 1941 modules transformed.
rendering chunks...
computing gzip size...
[2m../dist/public/[22m[32mindex.html                 [39m[1m[2m  368.37 kB[22m[1m[22m[2m │ gzip: 105.76 kB[22m
[2m../dist/public/[22m[2massets/[22m[35mindex-CuhRRp3a.css  [39m[1m[2m  160.80 kB[22m[1m[22m[2m │ gzip:  25.07 kB[22m
[2m../dist/public/[22m[2massets/[22m[36mindex-BK0GVjdB.js   [39m[1m[33m2,688.00 kB[39m[22m[2m │ gzip: 540.29 kB[22m
[33m
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.[39m
[32m✓ built in 6.24s[39m

  dist/index.js  840.2kb

⚡ Done in 31ms
```
