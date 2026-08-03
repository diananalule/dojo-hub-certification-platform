import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'DojoHub2026!';

function durationToSeconds(mmss: string): number {
  const [m, s] = mmss.split(':').map(Number);
  return m * 60 + s;
}

async function main() {
  console.log('Seeding Dojo Hub database...');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  // ---------------------------------------------------------------------
  // Levels (certification ladder)
  // ---------------------------------------------------------------------
  const levelDefs = [
    { name: 'Beginner', order: 0, passingScore: 80 },
    { name: 'Intermediate', order: 1, passingScore: 85 },
    { name: 'Advanced', order: 2, passingScore: 85 },
    { name: 'Expert', order: 3, passingScore: 90 },
  ];
  const levels: Record<string, Awaited<ReturnType<typeof prisma.level.upsert>>> = {};
  for (const def of levelDefs) {
    levels[def.name] = await prisma.level.upsert({ where: { name: def.name }, update: def, create: def });
  }

  // ---------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------
  const categoryNames = ['Hardware', 'Software', 'Data Science'];
  const categories: Record<string, Awaited<ReturnType<typeof prisma.category.upsert>>> = {};
  for (const name of categoryNames) {
    categories[name] = await prisma.category.upsert({
      where: { name },
      update: { isDefault: true },
      create: { name, isDefault: true },
    });
  }

  // ---------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------
  const admin = await prisma.user.upsert({
    where: { email: 'sarah.chen@dojo.edu' },
    update: {},
    create: { name: 'Sarah Chen', email: 'sarah.chen@dojo.edu', passwordHash, role: 'ADMIN', status: 'ACTIVE' },
  });

  const evaluatorDefs = [
    { name: 'Lead Instructor Kenji', email: 'kenji@dojo.edu' },
    { name: 'Director Tanaka', email: 'tanaka@dojo.edu' },
    { name: 'Mentor Amanda', email: 'amanda@dojo.edu' },
  ];
  const evaluators: Record<string, Awaited<ReturnType<typeof prisma.user.upsert>>> = {};
  for (const def of evaluatorDefs) {
    evaluators[def.email] = await prisma.user.upsert({
      where: { email: def.email },
      update: {},
      create: { name: def.name, email: def.email, passwordHash, role: 'EVALUATOR', status: 'ACTIVE' },
    });
  }

  const studentDefs = [
    { name: 'Alex Mercer', email: 'alex.mercer@dojo.edu', level: 'Intermediate' },
    { name: 'Sophia Lin', email: 'sophia.lin@dojo.edu', level: 'Advanced' },
    { name: 'Devon Carter', email: 'devon.carter@dojo.edu', level: 'Expert' },
    { name: 'Aria Sterling', email: 'aria.sterling@dojo.edu', level: 'Beginner' },
  ];
  const students: Record<string, Awaited<ReturnType<typeof prisma.user.upsert>>> = {};
  for (const def of studentDefs) {
    const user = await prisma.user.upsert({
      where: { email: def.email },
      update: {},
      create: { name: def.name, email: def.email, passwordHash, role: 'STUDENT', status: 'ACTIVE' },
    });
    students[def.email] = user;
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: { currentLevelId: levels[def.level].id },
      create: { userId: user.id, currentLevelId: levels[def.level].id },
    });
  }

  // ---------------------------------------------------------------------
  // Tracks: Hardware
  // ---------------------------------------------------------------------
  const hardwareTrack = await upsertTrack({
    id: 'seed-track-hardware',
    title: 'The Hardware Course',
    category: categories.Hardware,
    description:
      'Master embedded electronics, schematic design, logic analyzer signaling, and bare-metal firmware. Build connected devices from the silicon up.',
    icon: '📟',
    difficulty: 'INTERMEDIATE',
    durationWeeks: 12,
  });

  const hwMod1 = await upsertModule(hardwareTrack.id, 0, {
    id: 'seed-hw-mod-1',
    title: 'Module 1: Foundations of Microcontrollers',
    description: 'Explore GPIO registers, Analog-to-Digital Conversion (ADC), and PWM motor drivers on ARM Cortex-M architecture.',
  });
  await upsertTopic(hwMod1.id, 0, {
    id: 'seed-hw-top-11',
    title: 'Topic 1.1: Environment Setup & Toolchains',
    description: 'Install GCC compiler for ARM Embedded, set up OpenOCD debugger, and flash your first led-blink firmware.',
    duration: '14:20',
    videoUrl: 'https://www.youtube.com/watch?v=PxQw5_7yI8Q',
    tools: ['ARM GCC Compiler', 'OpenOCD', 'ST-Link v2', 'CMake', 'VS Code'],
    subtitles: [
      { timeSeconds: 0, text: 'Welcome to Hardware & IoT Engineering Track!' },
      { timeSeconds: 3, text: 'In this topic, we will configure the ARM bare-metal compilation toolchain.' },
      { timeSeconds: 11, text: 'We will verify compilation by flashing our first non-blocking led-blink routine.' },
    ],
  });
  await upsertTopic(hwMod1.id, 1, {
    id: 'seed-hw-top-12',
    title: 'Topic 1.2: Analog-to-Digital Conversion (ADC) Channels',
    description: 'Configure multi-channel ADC in single and continuous-conversion modes.',
    duration: '18:45',
    videoUrl: 'https://www.youtube.com/watch?v=LO2R6VMkYcs',
    tools: ['Multi-meter', 'Rotary Potentiometer', 'ARM ADC Registers', 'Oscilloscope'],
    subtitles: [
      { timeSeconds: 0, text: 'Now we explore Analog-to-Digital conversion.' },
      { timeSeconds: 8, text: 'Observe how we set the sample-and-hold cycles to stabilize the reference voltage.' },
    ],
  });
  await upsertCompetency(hwMod1.id, {
    title: 'Non-blocking Sensor Loop Competency',
    description: 'Demonstrate a working ADC read loop that never blocks the main thread.',
    validationRequirements: [
      'GPIO pins are configured with the correct alternate function mode',
      'ADC readings are scaled correctly to the 0-4095 range',
      'A non-blocking timer check gates the sampling loop',
    ],
    tools: ['ARM GCC Compiler', 'Oscilloscope'],
  });

  const hwMod2 = await upsertModule(hardwareTrack.id, 1, {
    id: 'seed-hw-mod-2',
    title: 'Module 2: Embedded Protocols & Sensors',
    description: 'Establish serial bus architectures (I2C, SPI, UART) to query hardware state from digital sensors.',
  });
  await upsertTopic(hwMod2.id, 0, {
    id: 'seed-hw-top-21',
    title: 'Topic 2.1: I2C Wire Signaling with Logic Analyzers',
    description: 'Learn the pull-up resistor constraints on standard I2C buses and decode packets with a logic analyzer.',
    duration: '15:30',
    videoUrl: 'https://www.youtube.com/watch?v=Esl6mkuhB-k',
    tools: ['Logic Analyzer', 'I2C Temp Sensor', '4.7k Pull-up Resistors', 'PulseView Software'],
    subtitles: [{ timeSeconds: 0, text: 'I2C is a 2-wire synchronous serial communication bus.' }],
  });
  await upsertTopic(hwMod2.id, 1, {
    id: 'seed-hw-top-22',
    title: 'Topic 2.2: SPI Sensor Registers & DMA Buffers',
    description: 'Interact with high-speed 3-axis accelerometers using SPI, and offload transfers to DMA.',
    duration: '21:05',
    videoUrl: 'https://www.youtube.com/watch?v=IjjZcnwkrAg',
    tools: ['3-Axis Accelerometer', 'SPI Controller', 'DMA Controller Channels', 'Saleae Logic'],
    subtitles: [{ timeSeconds: 0, text: 'SPI runs significantly faster than I2C.' }],
  });

  await upsertModuleQuiz(hwMod1.id, {
    title: 'Module 1: Foundations of Microcontrollers Chapter Quiz',
    objective: [
      {
        question: 'Which GPIO register configuration is most suitable for driving an LED directly from a microcontroller pin?',
        options: [
          'Input mode with high-impedance (floating)',
          'Output mode configured as Push-Pull',
          'Output mode configured as Open-Drain',
          'Analog alternate function mode',
        ],
        correctIndex: 1,
        explanation: 'Push-Pull configuration can actively drive a pin both HIGH and LOW, perfect for LEDs.',
      },
      {
        question: 'Why is non-blocking software debouncing preferred over blocking delays for push-button interrupts?',
        options: [
          'Simple delays consume more battery power',
          'Interrupts do not trigger during blocking delays',
          'Blocking delays halt the CPU from executing other tasks',
          'Debouncing increases MCU clock speed',
        ],
        correctIndex: 2,
        explanation: 'Blocking delays halt all other execution, hurting responsiveness.',
      },
    ],
    subjective: {
      prompt:
        'Design a system that monitors a 12-bit analog thermistor and drives a DC warning motor using PWM. Outline the GPIO configurations, ADC register settings, and a non-blocking PWM duty-cycle update routine.',
      guidelines: 'Mention GPIO configuration, ADC scaling (0-4095), PWM timer frequency, and non-blocking time-checking logic.',
      sampleKeywords: ['GPIO', 'ADC', 'PWM', 'non-blocking', 'timer', 'duty cycle'],
    },
  });

  // ---------------------------------------------------------------------
  // Tracks: Software
  // ---------------------------------------------------------------------
  const softwareTrack = await upsertTrack({
    id: 'seed-track-software',
    title: 'The Software Course',
    category: categories.Software,
    description:
      'Learn high-performance client state management, server-side REST pipelines, caching tiers, and containerized DevOps architecture.',
    icon: '💻',
    difficulty: 'ADVANCED',
    durationWeeks: 16,
  });

  const swMod1 = await upsertModule(softwareTrack.id, 0, {
    id: 'seed-sw-mod-1',
    title: 'Module 1: High-Performance Client Applications',
    description: 'Understand rendering mechanics, custom state hooks, and sensory elements in modern client interfaces.',
  });
  await upsertTopic(swMod1.id, 0, {
    id: 'seed-sw-top-11',
    title: 'Topic 1.1: Virtual DOM, Fiber Reconciliation, & State Slices',
    description: 'Dive deep into React 19 Fiber architecture and learn memoization and selector patterns.',
    duration: '16:50',
    videoUrl: 'https://www.youtube.com/watch?v=LlvBzyy-558',
    tools: ['React DevTools', 'Zustand Store', 'Chrome Performance Profiler', 'Vite Bundler'],
    subtitles: [{ timeSeconds: 0, text: 'Let’s look under the hood of React rendering cycles.' }],
  });
  await upsertTopic(swMod1.id, 1, {
    id: 'seed-sw-top-12',
    title: 'Topic 1.2: Intersection Observer & Responsive Infinite Scroll',
    description: 'Build scroll managers that load pages dynamically without layout shift.',
    duration: '12:15',
    videoUrl: 'https://www.youtube.com/watch?v=LOH1l-MP_9k',
    tools: ['Intersection Observer API', 'Tailwind CSS Layouts', 'REST Mock Server'],
    subtitles: [{ timeSeconds: 0, text: 'Infinite scroll shouldn’t lag your interface.' }],
  });
  await upsertCompetency(swMod1.id, {
    title: 'Render Performance Competency',
    description: 'Demonstrate a dashboard view that stays smooth under rapid state updates.',
    validationRequirements: [
      'State updates are batched or throttled appropriately',
      'Expensive child components are memoized',
      'No unnecessary re-renders are visible in the React DevTools profiler',
    ],
    tools: ['React DevTools', 'Chrome Performance Profiler'],
  });

  const swMod2 = await upsertModule(softwareTrack.id, 1, {
    id: 'seed-sw-mod-2',
    title: 'Module 2: Resilient API Design & Middleware Pipelines',
    description: 'Construct secure, scalable servers using Express and database caching layers.',
  });
  await upsertTopic(swMod2.id, 0, {
    id: 'seed-sw-top-21',
    title: 'Topic 2.1: RESTful Contracts, Input Validation, & JWT Auth',
    description: 'Write robust API servers using Express with schema validation and JWT verification.',
    duration: '19:40',
    videoUrl: 'https://www.youtube.com/watch?v=-okvkzxuXJU',
    tools: ['Node Express', 'Zod validation', 'jsonwebtoken', 'Bruno API Client'],
    subtitles: [{ timeSeconds: 0, text: 'Every secure API begins with input validation.' }],
  });
  await upsertTopic(swMod2.id, 1, {
    id: 'seed-sw-top-22',
    title: 'Topic 2.2: Horizontal Scaling & Redis Cache Eviction',
    description: 'Introduce a Redis cache layer and configure custom eviction policies.',
    duration: '22:15',
    videoUrl: 'https://www.youtube.com/watch?v=8A6s9d0jnWI',
    tools: ['Redis', 'ioredis client', 'Docker Compose', 'k6 Load Testing'],
    subtitles: [{ timeSeconds: 0, text: 'Let’s scale our Node cluster to 10 instances.' }],
  });

  await upsertModuleQuiz(swMod1.id, {
    title: 'Module 1: High-Performance Client Applications Chapter Quiz',
    objective: [
      {
        question:
          'In React, which practice is most effective for preventing unnecessary re-renders of child components in a large dashboard?',
        options: [
          'Storing all values in global window properties',
          'Wrapping the child in React.memo and using precise state selectors',
          'Placing all state inside a single monolithic Context Provider',
          'Running forceUpdate() on every user interaction',
        ],
        correctIndex: 1,
        explanation: 'React.memo plus precise selectors avoids re-rendering unaffected components.',
      },
    ],
    subjective: {
      prompt:
        'Explain React 19 Fiber reconciliation, then design an optimization strategy for a monitoring panel receiving 100 state packets/second while keeping 60fps.',
      guidelines: 'Explain Fiber reconciliation, suggest batching/throttling, and mention useMemo/useCallback or refs.',
      sampleKeywords: ['reconciliation', 'Fiber', 'batching', 'throttle', 'requestAnimationFrame', 'useMemo'],
    },
  });

  // ---------------------------------------------------------------------
  // Tracks: Data Science
  // ---------------------------------------------------------------------
  const dataTrack = await upsertTrack({
    id: 'seed-track-data',
    title: 'The Data Science Course',
    category: categories['Data Science'],
    description: 'Transform datasets, engineer statistical features, optimize neural architectures, and pipeline ML models.',
    icon: '📊',
    difficulty: 'ADVANCED',
    durationWeeks: 14,
  });

  const dsMod1 = await upsertModule(dataTrack.id, 0, {
    id: 'seed-ds-mod-1',
    title: 'Module 1: Scientific Computing & EDA',
    description: 'Examine pandas indexing logic, vectorize transformations, and build high-fidelity visualizers.',
  });
  await upsertTopic(dsMod1.id, 0, {
    id: 'seed-ds-top-11',
    title: 'Topic 1.1: Jupyter Notebooks & Pandas Multi-Indexing',
    description: 'Understand multi-index series, categorical categorization, and pivot operations.',
    duration: '15:10',
    videoUrl: 'https://www.youtube.com/watch?v=BpPJxtOk8uw',
    tools: ['Jupyter Lab', 'Python Pandas', 'NumPy Vectors', 'Anaconda'],
    subtitles: [{ timeSeconds: 0, text: 'Welcome to the Applied AI & Data Science Track.' }],
  });
  await upsertTopic(dsMod1.id, 1, {
    id: 'seed-ds-top-12',
    title: 'Topic 1.2: Dimensionality Reduction (PCA) Visualizations',
    description: 'Apply scikit-learn PCA to project 50 features down to 2 axes.',
    duration: '20:10',
    videoUrl: 'https://www.youtube.com/watch?v=6uwa9EkUqpg',
    tools: ['Scikit-Learn', 'Matplotlib', 'PCA Pipeline Objects', 'D3.js Charts'],
    subtitles: [{ timeSeconds: 0, text: 'High dimensional data is extremely difficult to visualize.' }],
  });

  const dsMod2 = await upsertModule(dataTrack.id, 1, {
    id: 'seed-ds-mod-2',
    title: 'Module 2: Machine Learning & Neural Networks',
    description: 'Train deep neural models, optimize loss weights, and deploy local model files.',
  });
  await upsertTopic(dsMod2.id, 0, {
    id: 'seed-ds-top-21',
    title: 'Topic 2.1: Feature Engineering & Gradient Boosting Trees',
    description: 'Handle missing values, encode categorical variables, and train XGBoost/LightGBM models.',
    duration: '18:50',
    videoUrl: 'https://www.youtube.com/watch?v=aLOQD66Sj0g',
    tools: ['XGBoost Engine', 'OneHotEncoder', 'Cross Validation Folders', 'Feature Importances'],
    subtitles: [{ timeSeconds: 0, text: 'Let’s construct advanced features for our tree models.' }],
  });

  await upsertModuleQuiz(dsMod1.id, {
    title: 'Module 1: Scientific Computing & EDA Chapter Quiz',
    objective: [
      {
        question: 'Why is it recommended to use vectorized operations rather than nested for-loops in Pandas?',
        options: [
          'For-loops are deprecated in modern Python',
          'Vectorization uses SIMD registers for massive parallel execution speed',
          'Vectorized operations use fewer lines of code but run at the same speed',
          'Vectorization automatically encrypts the dataset',
        ],
        correctIndex: 1,
        explanation: 'Vectorized operations run compiled code using SIMD, vastly outperforming Python loops.',
      },
    ],
    subjective: {
      prompt:
        'A CSV contains 10 million telemetry readings with high collinearity across 40 sensors. Outline your EDA pipeline, including collinearity checks, scaling, and PCA.',
      guidelines: 'State the Pandas/Scikit-learn methods used, how you choose component count, and how to represent variance.',
      sampleKeywords: ['PCA', 'StandardScaler', 'correlation matrix', 'collinearity', 'scree plot', 'variance'],
    },
  });

  // ---------------------------------------------------------------------
  // Track: Intern Software Engineering (single-module, no quizzes)
  // ---------------------------------------------------------------------
  const internTrack = await upsertTrack({
    id: 'seed-track-intern-sw',
    title: 'Intern Software Engineering Course',
    category: categories.Software,
    description: 'A specialized single-module course for engineering interns, verifying six critical software engineering topics.',
    icon: '🎓',
    difficulty: 'BEGINNER',
    durationWeeks: 4,
    examEnabled: false,
  });
  const internMod = await upsertModule(internTrack.id, 0, {
    id: 'seed-intern-mod-1',
    title: 'Module 1: Intern Software Core Competencies',
    description: 'Verifies six fundamental development and engineering capabilities.',
    quizEnabled: false,
  });
  const internTopics = [
    {
      id: 'seed-intern-comp-1',
      title: 'Topic 1: Secure Local Environment Configuration',
      tools: ['dotenv', 'process.env', 'Node.js'],
      videoUrl: 'https://www.youtube.com/watch?v=o8P_FXImj9E',
    },
    {
      id: 'seed-intern-comp-2',
      title: 'Topic 2: Clean Express-v5 Routing Table',
      tools: ['Express v5', 'Router', 'REST APIs'],
      videoUrl: 'https://www.youtube.com/watch?v=-okvkzxuXJU',
    },
    {
      id: 'seed-intern-comp-3',
      title: 'Topic 3: Unit Testing with Jest Framework',
      tools: ['Jest', 'Supertest', 'Assert'],
      videoUrl: 'https://www.youtube.com/watch?v=vDLE8hqzA8I',
    },
    {
      id: 'seed-intern-comp-4',
      title: 'Topic 4: Async Catch Middleware Promise Handling',
      tools: ['Async/Await', 'Express Middleware'],
      videoUrl: 'https://www.youtube.com/watch?v=favjC6EKFgw',
    },
    {
      id: 'seed-intern-comp-5',
      title: 'Topic 5: Schema Verification using Zod',
      tools: ['Zod', 'Schema Validation', 'TypeScript'],
      videoUrl: 'https://www.youtube.com/watch?v=U9PYyMhDc_k',
    },
    {
      id: 'seed-intern-comp-6',
      title: 'Topic 6: Deploying Server Code to Sandbox Containers',
      tools: ['Docker', 'Cloud Run', 'Sandbox'],
      videoUrl: 'https://www.youtube.com/watch?v=vGkLcuZ4AG8',
    },
  ];
  for (let i = 0; i < internTopics.length; i++) {
    const t = internTopics[i];
    await upsertTopic(internMod.id, i, {
      id: t.id,
      title: t.title,
      description: `${t.title} — hands-on practical for engineering interns.`,
      duration: '12:00',
      videoUrl: t.videoUrl,
      tools: t.tools,
      subtitles: [{ timeSeconds: 0, text: `Welcome to ${t.title}` }],
    });
  }

  // ---------------------------------------------------------------------
  // Track final assessments
  // ---------------------------------------------------------------------
  await upsertTrackAssessment(hardwareTrack.id, {
    title: 'The Hardware Course Overall Certification Assessment',
    objective: [
      {
        question: 'Which serial protocol uses MOSI, MISO, SCLK, and individual SS select wires without pull-up constraints?',
        options: ['I2C Bus', 'SPI Bus', 'UART Serial', 'CAN Bus'],
        correctIndex: 1,
        explanation: 'SPI uses dedicated synchronous lines and per-peripheral chip-select wires.',
      },
      {
        question: 'How do you prevent a watchdog timer (WDT) from resetting an embedded device during normal execution?',
        options: [
          'Delete the watchdog driver before deploying',
          'Regularly "kick" the watchdog in the main application loop',
          'Keep the MCU in persistent sleep mode',
          'Lower the power supply voltage',
        ],
        correctIndex: 1,
        explanation: 'Feeding/kicking the watchdog resets its countdown, signaling healthy execution.',
      },
    ],
    subjective: {
      prompt:
        'Architect a complete IoT weather monitoring station sampling temperature (ADC), wind speed (SPI/DMA), and streaming telemetry over UART. Detail peripheral mapping and your non-blocking scheduling loop.',
      guidelines: 'Cover ADC DMA config, SPI DMA interrupt handling, UART packet framing with checksums, and watchdog integration.',
      sampleKeywords: ['DMA', 'ADC', 'SPI', 'UART', 'ISR', 'watchdog', 'checksum', 'non-blocking'],
    },
  });

  await upsertTrackAssessment(softwareTrack.id, {
    title: 'The Software Course Overall Certification Assessment',
    objective: [
      {
        question: 'Which describes the Node.js event loop processing model?',
        options: [
          'A new OS thread per incoming HTTP request',
          'A single-threaded model delegating blocking I/O to a background thread pool',
          'It halts execution until database transactions complete',
          'It runs client rendering calculations inside server RAM',
        ],
        correctIndex: 1,
        explanation: 'Node delegates blocking work to libuv worker threads, keeping the event loop free.',
      },
    ],
    subjective: {
      prompt:
        'Architect a highly available real-time ticket booking platform handling 50,000 requests/minute. Cover client render optimizations, API middleware, caching, real-time sockets, and race-condition prevention.',
      guidelines: 'Cover virtual scrolling/state selectors, rate limiting, distributed locks or row locks, and WebSocket broadcasting.',
      sampleKeywords: ['virtual list', 'rate limiting', 'distributed lock', 'concurrency', 'WebSocket', 'middleware'],
    },
  });

  await upsertTrackAssessment(dataTrack.id, {
    title: 'The Data Science Course Overall Certification Assessment',
    objective: [
      {
        question: 'What is the core issue associated with "multicollinearity" in regression modeling?',
        options: [
          'Columns are colored differently in notebooks',
          'Highly correlated predictors inflate coefficient variance, obscuring individual feature impact',
          'The dataset has more than 100 columns',
          'The target column average is negative',
        ],
        correctIndex: 1,
        explanation: 'Multicollinearity makes model coefficients unstable and hard to interpret.',
      },
    ],
    subjective: {
      prompt:
        'Design an end-to-end ML pipeline predicting device failures from streaming telemetry. Cover ingestion, feature engineering, class-imbalance handling, and a PyTorch model architecture, avoiding temporal leakage.',
      guidelines: 'Cover vectorized feature creation, imbalance correction (SMOTE/focal loss), walk-forward splitting, and drift monitoring.',
      sampleKeywords: ['imbalance', 'focal loss', 'SMOTE', 'drift', 'leakage', 'time-series split'],
    },
  });

  // ---------------------------------------------------------------------
  // Publish all tracks
  // ---------------------------------------------------------------------
  for (const track of [hardwareTrack, softwareTrack, dataTrack, internTrack]) {
    await prisma.track.update({ where: { id: track.id }, data: { status: 'PUBLISHED' } });
  }

  // ---------------------------------------------------------------------
  // Enrollments
  // ---------------------------------------------------------------------
  await enroll(students['alex.mercer@dojo.edu'].id, hardwareTrack.id, 'IN_PROGRESS');
  await enroll(students['alex.mercer@dojo.edu'].id, softwareTrack.id, 'IN_PROGRESS');
  await enroll(students['sophia.lin@dojo.edu'].id, softwareTrack.id, 'IN_PROGRESS');
  await enroll(students['sophia.lin@dojo.edu'].id, dataTrack.id, 'IN_PROGRESS');
  await enroll(students['devon.carter@dojo.edu'].id, softwareTrack.id, 'COMPLETED');
  await enroll(students['aria.sterling@dojo.edu'].id, hardwareTrack.id, 'NOT_STARTED');

  // ---------------------------------------------------------------------
  // Sample submissions (one-time seed data — skip if already seeded, since
  // these rows have no natural idempotency key of their own)
  // ---------------------------------------------------------------------
  const sampleDataAlreadySeeded = await prisma.credential.findUnique({
    where: { id: 'seed-cred-beg-alex' },
  });

  if (!sampleDataAlreadySeeded) {
  await prisma.submission.create({
    data: {
      type: 'COMPETENCY',
      studentId: students['alex.mercer@dojo.edu'].id,
      topicId: 'seed-hw-top-11',
      title: 'Interactive Personal Dashboard',
      submissionText:
        'I built an interactive dashboard using semantic HTML5 and customized Tailwind colors. It tracks daily tasks and includes persistent dark mode.',
      links: [{ url: 'https://github.com/alex-mercer/personal-dashboard', description: 'GitHub Repository' }],
      status: 'APPROVED',
      score: 95,
      feedback: 'Splendid work, Alex! Your layout shows solid comprehension. Keep up the high standard.',
      evaluatorId: evaluators['kenji@dojo.edu'].id,
      evaluatedAt: new Date('2026-05-16T10:15:00Z'),
      submittedAt: new Date('2026-05-15T14:30:00Z'),
    },
  });
  await prisma.credential.create({
    data: {
      id: 'seed-cred-beg-alex',
      studentId: students['alex.mercer@dojo.edu'].id,
      levelId: levels.Beginner.id,
      issuedAt: new Date('2026-05-16T10:15:00Z'),
      hash: 'seed-hash-beginner-alex-mercer-0000000000000000000000000000',
      status: 'ACTIVE',
      evaluatorSignatureId: evaluators['kenji@dojo.edu'].id,
      adminSignatureId: admin.id,
    },
  });

  await prisma.submission.create({
    data: {
      type: 'CAPSTONE',
      studentId: students['alex.mercer@dojo.edu'].id,
      levelId: levels.Intermediate.id,
      title: 'Collaborative Multi-user Canvas Project',
      submissionText:
        'Here is my capstone for the Intermediate level. Built using React, custom hooks for state management, and Motion for canvas animations.',
      links: [
        { url: 'https://github.com/alex-mercer/react-canvas-hub', description: 'GitHub Repository' },
        { url: 'https://react-canvas-hub-demo.vercel.app', description: 'Live Staging Sandbox' },
      ],
      status: 'PENDING',
      submittedAt: new Date('2026-06-24T18:45:00Z'),
    },
  });

  await prisma.submission.create({
    data: {
      type: 'CAPSTONE',
      studentId: students['sophia.lin@dojo.edu'].id,
      levelId: levels.Advanced.id,
      title: 'Distributed Chat API with Redis backing',
      submissionText:
        'Finished Advanced backend. Implements Express with SSE, a Redis cluster for pub/sub session state, and a PostgreSQL database.',
      links: [
        { url: 'https://github.com/sophia-lin/express-redis-chat', description: 'GitHub Codebase' },
        { url: 'https://api.dojo-chat-staging.net/health', description: 'Production API Health Endpoint' },
      ],
      status: 'PENDING',
      submittedAt: new Date('2026-06-24T22:15:00Z'),
    },
  });

  await prisma.submission.create({
    data: {
      type: 'CAPSTONE',
      studentId: students['devon.carter@dojo.edu'].id,
      levelId: levels.Expert.id,
      title: 'Secure Enterprise Identity Proxy',
      submissionText:
        'This is my Expert level capstone submission. Implemented zero-trust authentication proxies, multi-region failovers, and Dockerized orchestration.',
      links: [{ url: 'https://github.com/devon-carter/zero-trust-proxy', description: 'GitHub Repository' }],
      status: 'APPROVED',
      score: 98,
      feedback: 'Absolutely brilliant. The threat-model assessment and CI/CD coverage are outstanding.',
      evaluatorId: evaluators['tanaka@dojo.edu'].id,
      evaluatedAt: new Date('2026-06-22T16:40:00Z'),
      submittedAt: new Date('2026-06-20T09:00:00Z'),
    },
  });
  await prisma.credential.create({
    data: {
      id: 'seed-cred-exp-devon',
      studentId: students['devon.carter@dojo.edu'].id,
      levelId: levels.Expert.id,
      issuedAt: new Date('2026-06-22T16:40:00Z'),
      hash: 'seed-hash-expert-devon-carter-00000000000000000000000000000',
      status: 'ACTIVE',
      evaluatorSignatureId: evaluators['tanaka@dojo.edu'].id,
      adminSignatureId: admin.id,
    },
  });
  }

  // ---------------------------------------------------------------------
  // Office hours
  // ---------------------------------------------------------------------
  await prisma.officeHourSlot.createMany({
    data: [
      {
        evaluatorId: evaluators['kenji@dojo.edu'].id,
        topic: 'Flexbox vs CSS Grid & Tailwind Responsive Systems',
        startTime: new Date('2026-07-30T15:00:00Z'),
        endTime: new Date('2026-07-30T16:30:00Z'),
        capacity: 15,
      },
      {
        evaluatorId: evaluators['tanaka@dojo.edu'].id,
        topic: 'Security Auditing & Kubernetes Deployment Strategies',
        startTime: new Date('2026-07-31T10:00:00Z'),
        endTime: new Date('2026-07-31T11:30:00Z'),
        capacity: 5,
      },
      {
        evaluatorId: evaluators['amanda@dojo.edu'].id,
        topic: 'Mastering React State & Side Effect Lifecycle Hooks',
        startTime: new Date('2026-08-03T13:00:00Z'),
        endTime: new Date('2026-08-03T14:00:00Z'),
        capacity: 20,
      },
    ],
  });

  console.log('Seed complete.');
  console.log(`All demo accounts use the password: ${DEMO_PASSWORD}`);
  console.log('  Admin:     sarah.chen@dojo.edu');
  console.log('  Evaluator: kenji@dojo.edu / tanaka@dojo.edu / amanda@dojo.edu');
  console.log('  Student:   alex.mercer@dojo.edu / sophia.lin@dojo.edu / devon.carter@dojo.edu / aria.sterling@dojo.edu');

  // ---------------------------------------------------------------------
  // Helper functions (closures over `prisma`)
  // ---------------------------------------------------------------------
  async function upsertTrack(input: {
    id: string;
    title: string;
    category: { id: string };
    description: string;
    icon: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    durationWeeks: number;
    examEnabled?: boolean;
  }) {
    return prisma.track.upsert({
      where: { id: input.id },
      update: {},
      create: {
        id: input.id,
        title: input.title,
        categoryId: input.category.id,
        description: input.description,
        icon: input.icon,
        difficulty: input.difficulty,
        durationWeeks: input.durationWeeks,
        examEnabled: input.examEnabled ?? true,
        status: 'DRAFT',
      },
    });
  }

  async function upsertModule(
    trackId: string,
    order: number,
    input: { id: string; title: string; description: string; quizEnabled?: boolean },
  ) {
    return prisma.module.upsert({
      where: { id: input.id },
      update: {},
      create: {
        id: input.id,
        trackId,
        order,
        title: input.title,
        description: input.description,
        quizEnabled: input.quizEnabled ?? true,
      },
    });
  }

  async function upsertTopic(
    moduleId: string,
    order: number,
    input: {
      id: string;
      title: string;
      description: string;
      duration: string;
      videoUrl: string;
      tools: string[];
      subtitles: { timeSeconds: number; text: string }[];
    },
  ) {
    return prisma.topic.upsert({
      where: { id: input.id },
      update: {
        title: input.title,
        description: input.description,
        durationSeconds: durationToSeconds(input.duration),
        videoUrl: input.videoUrl,
        tools: input.tools,
        subtitles: input.subtitles,
      },
      create: {
        id: input.id,
        moduleId,
        order,
        title: input.title,
        description: input.description,
        durationSeconds: durationToSeconds(input.duration),
        videoUrl: input.videoUrl,
        tools: input.tools,
        subtitles: input.subtitles,
      },
    });
  }

  async function upsertCompetency(
    moduleId: string,
    input: { title: string; description: string; validationRequirements: string[]; tools: string[] },
  ) {
    const existing = await prisma.competency.findFirst({ where: { moduleId, title: input.title } });
    if (existing) return existing;
    return prisma.competency.create({ data: { moduleId, ...input } });
  }

  async function upsertModuleQuiz(
    moduleId: string,
    input: {
      title: string;
      objective: { question: string; options: string[]; correctIndex: number; explanation: string }[];
      subjective: { prompt: string; guidelines: string; sampleKeywords: string[] };
    },
  ) {
    const quiz = await prisma.moduleQuiz.upsert({
      where: { moduleId },
      update: {},
      create: { moduleId, title: input.title, passThreshold: 70 },
    });
    const existingQuestions = await prisma.quizQuestion.count({ where: { moduleQuizId: quiz.id } });
    if (existingQuestions === 0) {
      let order = 0;
      for (const q of input.objective) {
        await prisma.quizQuestion.create({
          data: { moduleQuizId: quiz.id, type: 'OBJECTIVE', order: order++, ...q },
        });
      }
      await prisma.quizQuestion.create({
        data: { moduleQuizId: quiz.id, type: 'SUBJECTIVE', order: order++, ...input.subjective },
      });
    }
    return quiz;
  }

  async function upsertTrackAssessment(
    trackId: string,
    input: {
      title: string;
      objective: { question: string; options: string[]; correctIndex: number; explanation: string }[];
      subjective: { prompt: string; guidelines: string; sampleKeywords: string[] };
    },
  ) {
    const assessment = await prisma.trackAssessment.upsert({
      where: { trackId },
      update: {},
      create: { trackId, title: input.title, passThreshold: 70 },
    });
    const existingQuestions = await prisma.quizQuestion.count({ where: { trackAssessmentId: assessment.id } });
    if (existingQuestions === 0) {
      let order = 0;
      for (const q of input.objective) {
        await prisma.quizQuestion.create({
          data: { trackAssessmentId: assessment.id, type: 'OBJECTIVE', order: order++, ...q },
        });
      }
      await prisma.quizQuestion.create({
        data: { trackAssessmentId: assessment.id, type: 'SUBJECTIVE', order: order++, ...input.subjective },
      });
    }
    return assessment;
  }

  async function enroll(userId: string, trackId: string, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') {
    await prisma.enrollment.upsert({
      where: { userId_trackId: { userId, trackId } },
      update: { status },
      create: { userId, trackId, status },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
