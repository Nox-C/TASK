# CASCADE DEVELOPMENT RULES

## 🎯 PROJECT CLEANLINESS & ARCHITECTURE RULES

### 📋 STRICT ARCHITECTURAL INSTRUCTIONS

#### 🚫 **STRICT ARCHITECTURAL INSTRUCTIONS:**

- **Stop creating new files for shared logic** - Use the existing `src/shared/context/` for state that affects both Charts and Bots
- **Organize by Feature** - All chart components must live in `src/features/charts/` and all bot logic in `src/features/bots/`
- **Consolidate Data** - Merge all price-related WebSockets into a single `PriceFeedContext.tsx`
- **No Duplicate UI** - If you need a button or input, check `src/shared/components/` first. Do not recreate it
- **Clean Up** - Identify any redundant files currently in the root or components/ folder and move them into their respective feature folders or delete them if they are duplicates

#### ✅ **APPROVED PROJECT STRUCTURE**

```
src/
├── shared/                 # UNIVERSAL DATA & TOOLS
│   ├── context/
│   │   ├── PriceFeedContext.tsx  # One WebSocket for the whole app
│   │   └── ActiveBotContext.tsx  # Tracks clicked bot & its grid params
│   ├── components/               # Reusable UI (Buttons, Modals, Wall-E themed)
│   └── hooks/
│       └── usePrice.ts           # Hook to pull price from the feed
├── features/               # SELF-CONTAINED MODULES
│   ├── charts/
│   │   ├── components/
│   │   │   ├── MainChart.tsx     # Main chart component
│   │   │   └── GridOverlay.tsx   # Subscribes to ActiveBotContext to draw lines
│   │   ├── hooks/               # Chart-specific hooks
│   │   └── utils/               # Chart utilities
│   └── bots/
│       ├── components/
│       │   ├── BotList.tsx       # When clicked, updates ActiveBotContext
│       │   └── GridForm.tsx      # Updates grid params in real-time
│       └── services/
│           └── botExecution.ts   # Bot logic & API calls
├── App.tsx                 # Main layout & Provider wrapper
└── main.tsx                # Entry point
```

### 🚫 **FORBIDDEN ACTIONS**

#### ❌ **FILE CREATION RESTRICTIONS**

- **NEVER** create new files for shared logic outside `src/shared/context/`
- **NEVER** create duplicate UI components - check `src/shared/components/` first
- **NEVER** create files not in the approved structure above
- **NEVER** create temporary or development files

#### ❌ **ARCHITECTURE VIOLATIONS**

- **NEVER** bypass the single PriceFeedContext for WebSocket connections
- **NEVER** create duplicate WebSocket connections
- **NEVER** place chart components outside `src/features/charts/`
- **NEVER** place bot logic outside `src/features/bots/`

### ✅ **REQUIRED IMPLEMENTATION LOGIC**

#### 1. **THE PRICE FEED**

- **PriceFeedContext** opens a **SINGLE** WebSocket connection
- **Chart and bot forms** BOTH use `usePrice` hook to get updates
- **NO EXCEPTIONS** - all price data must flow through this single source

#### 2. **THE VISUAL GRID**

- **GridForm.tsx** pushes price levels to **ActiveBotContext**
- **GridOverlay.tsx** watches this context and **AUTOMATICALLY** renders lines
- **NO MANUAL** chart updates - context changes trigger automatic rendering

#### 3. **CONTEXT SWITCHING**

- **BotList.tsx** click updates "Active Bot" in shared state
- **Chart AUTOMATICALLY** reloads correct symbol and displays bot's grid lines
- **NO DIRECT** chart manipulation - all through context

### 🧹 **CLEANUP REQUIREMENTS**

#### 🗑️ **FILE CLEANUP**

- **IDENTIFY** any redundant files in root or components/ folder
- **MOVE** files to respective feature folders or DELETE if duplicates
- **CONSOLIDATE** all functionality into approved structure

#### 🧼 **CODE CLEANUP**

- **REMOVE** unused imports, variables, and functions
- **DELETE** debugging code before finalizing changes
- **CONSOLIDATE** duplicate UI components

### 📝 **CODE QUALITY STANDARDS**

#### 🎯 **PRODUCTION GRADE REQUIREMENTS**

- **EVERY** file must be production-ready to highest standard
- **NO** minimal or placeholder implementations
- **COMPLETE** error handling and TypeScript types
- **COMPREHENSIVE** comments and documentation

#### 🏗️ **ARCHITECTURAL COMPLIANCE**

- **STRICT** adherence to feature-based organization
- **CONSISTENT** code style and patterns
- **PROPER** React hooks usage and context patterns
- **CLEAN** separation of concerns

### ⚡ **IMPLEMENTATION WORKFLOW**

#### 📋 **BEFORE CODING**

1. **VERIFY** file doesn't exist (check case sensitivity)
2. **CONFIRM** file is in approved project structure
3. **ANALYZE** full impact of changes
4. **PLAN** complete implementation

#### 🛠️ **DURING CODING**

1. **FOLLOW** exact project structure
2. **MAINTAIN** existing code style
3. **IMPLEMENT** production-grade quality
4. **USE** shared contexts and components

#### ✅ **AFTER CODING**

1. **REVIEW** code follows project style guide
2. **CLEANUP** temporary files and duplicates
3. **UPDATE** documentation
4. **VERIFY** architectural compliance

### 🔧 **DEVELOPMENT STANDARDS**

#### 💻 **EDITOR CONFIGURATION**

- **4 spaces** per indent (no tabs)
- **UTF-8** encoding for all files
- **LF** line endings (Unix/Linux)
- **Auto-remove** trailing whitespace on save

#### 🎨 **CODE STYLE**

- **Consistent** naming conventions
- **Descriptive** variable and function names
- **Proper** TypeScript types
- **Clean** component structure

### 🚨 **STRICT ENFORCEMENT**

#### ⚠️ **MANDATORY RULES**

- **NEVER** skip files in the outline
- **NEVER** create files not in the outline
- **NEVER** take shortcuts that violate principles
- **ALWAYS** create production-grade implementations

#### 🛡️ **QUALITY GATES**

- **NO** incorrect or minimal files
- **NO** files that will need revisiting
- **NO** disappointing implementations
- **NO** shortcuts that create more work

---

## 🎯 **REMINDER: EVERY FILE MUST BE THE BEST POSSIBLE IMPLEMENTATION**

**If a file needs to be revisited later, don't continue until it's perfect.**

---

*Last Updated: 2025-01-28*
*Version: 1.0*
