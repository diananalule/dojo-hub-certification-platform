export interface Topic {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  subtitles: { time: number; text: string }[];
  tools: string[];
  documents?: string[];
  referenceVideoUrl?: string;
}

export interface Competency {
  id: string;
  title?: string;
  description: string;
  completed?: boolean;
  validationRequirements?: string[];
  tools?: string[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  quizEnabled?: boolean;
  competencies?: Competency[];
}

export interface Track {
  id: string;
  title: string;
  category: 'Hardware' | 'Software' | 'Data Science';
  description: string;
  icon: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationWeeks: number;
  modules: Module[];
  examEnabled?: boolean;
  status?: 'draft' | 'published';
}

export const DOJO_TRACKS: Track[] = [
  {
    id: 'track-hardware',
    title: 'The Hardware Course',
    category: 'Hardware',
    description: 'Master embedded electronics, schematic design, logic analyzer signaling, and bare-metal firmware. Build connected devices from the silicon up.',
    icon: '📟',
    difficulty: 'Intermediate',
    durationWeeks: 12,
    modules: [
      {
        id: 'hw-mod-1',
        title: 'Module 1: Foundations of Microcontrollers',
        description: 'Explore GPIO registers, Analog-to-Digital Conversion (ADC), and PWM motor drivers on ARM Cortex-M architecture.',
        topics: [
          {
            id: 'hw-top-11',
            title: 'Topic 1.1: Environment Setup & Toolchains',
            description: 'Install GCC compiler for ARM Embedded, set up openOCD debugger, and flash your first led-blink firmware onto the development board. Understand makefiles and toolchain paths.',
            duration: '14:20',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['ARM GCC Compiler', 'OpenOCD', 'ST-Link v2', 'CMake', 'VS Code'],
            subtitles: [
              { time: 0, text: 'Welcome to Hardware & IoT Engineering Track!' },
              { time: 3, text: 'In this topic, we will configure the ARM bare-metal compilation toolchain.' },
              { time: 7, text: 'Make sure your ST-Link debugger is plugged into your local USB port.' },
              { time: 11, text: 'We will verify compilation by flashing our first non-blocking led-blink routine.' }
            ]
          },
          {
            id: 'hw-top-12',
            title: 'Topic 1.2: Analog-to-Digital Conversion (ADC) Channels',
            description: 'Learn how to configure multi-channel ADC in single-conversion and continuous-conversion modes. Examine sample cycles and register configurations to prevent signal noise.',
            duration: '18:45',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['Multi-meter', 'Rotary Potentiometer', 'ARM ADC Registers', 'Oscilloscope'],
            subtitles: [
              { time: 0, text: 'Now we explore Analog-to-Digital conversion.' },
              { time: 4, text: 'We configure ADC channels to translate physical sensor voltages.' },
              { time: 8, text: 'Observe how we set the sample-and-hold cycles to stabilize the reference voltage.' },
              { time: 13, text: 'We will implement an exponential moving average filter in C.' }
            ]
          },
          {
            id: 'hw-top-13',
            title: 'Topic 1.3: PWM & Motor Driver Signals',
            description: 'Structure hardware timers to output Pulse-Width Modulation (PWM) frequencies. Wire your MCU to an L298N H-bridge motor driver and command dual-channel speed loops.',
            duration: '16:10',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['L298N H-Bridge', 'DC Gear Motor', 'Hardware Timers', 'Logic Analyzer'],
            subtitles: [
              { time: 0, text: 'Pulse Width Modulation is essential for actuator control.' },
              { time: 4, text: 'Let’s calculate our timer prescaler and reload values for a 20kHz output.' },
              { time: 9, text: 'Connect the timer outputs to the dual H-Bridge inputs.' },
              { time: 14, text: 'Ensure you establish a common ground to prevent power surges.' }
            ]
          }
        ]
      },
      {
        id: 'hw-mod-2',
        title: 'Module 2: Embedded Protocols & Sensors',
        description: 'Establish serial bus architectures (I2C, SPI, UART) to query hardware state from digital sensors.',
        topics: [
          {
            id: 'hw-top-21',
            title: 'Topic 2.1: I2C Wire Signaling with Logic Analyzers',
            description: 'Learn the pull-up resistor constraints on standard I2C buses. Hook up a logic analyzer to decode start bits, device address bytes, write/read acknowledges, and stop bits.',
            duration: '15:30',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['Logic Analyzer', 'I2C Temp Sensor', '4.7k Pull-up Resistors', 'PulseView Software'],
            subtitles: [
              { time: 0, text: 'I2C is a 2-wire synchronous serial communication bus.' },
              { time: 4, text: 'We hook up our analyzer to SDA and SCL lines.' },
              { time: 8, text: 'Notice how the open-drain configuration requires pull-up resistors.' },
              { time: 13, text: 'Here is the 7-bit peripheral address followed by the write command.' }
            ]
          },
          {
            id: 'hw-top-22',
            title: 'Topic 2.2: SPI Sensor Registers & DMA Buffers',
            description: 'Interact with high-speed 3-axis accelerometers using Serial Peripheral Interface (SPI). Code multi-byte packet transactions and hook up Direct Memory Access (DMA) channels for low-latency updates.',
            duration: '21:05',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['3-Axis Accelerometer', 'SPI Controller', 'DMA Controller Channels', 'Saleae Logic'],
            subtitles: [
              { time: 0, text: 'SPI runs significantly faster than I2C.' },
              { time: 4, text: 'We will stream acceleration frames at 1000 Hertz.' },
              { time: 8, text: 'By offloading buffers to Direct Memory Access (DMA),' },
              { time: 12, text: 'the main CPU can sleep while memory is populated.' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'track-software',
    title: 'The Software Course',
    category: 'Software',
    description: 'Learn high-performance client state management, server-side REST pipelines, caching tiers, and containerized DevOps architecture.',
    icon: '💻',
    difficulty: 'Advanced',
    durationWeeks: 16,
    modules: [
      {
        id: 'sw-mod-1',
        title: 'Module 1: High-Performance Client Applications',
        description: 'Understand rendering mechanics, custom state hooks, and custom sensory elements in modern client interfaces.',
        topics: [
          {
            id: 'sw-top-11',
            title: 'Topic 1.1: Virtual DOM, Fiber Reconciliation, & State Slices',
            description: 'Dive deep into React 19 Fiber architecture. Explore why rendering loops occur and learn how to implement memoization, Zustand selectors, and callback preservation.',
            duration: '16:50',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['React DevTools', 'Zustand Store', 'Chrome Performance Profiler', 'Vite Bundler'],
            subtitles: [
              { time: 0, text: 'Let’s look under the hood of React rendering cycles.' },
              { time: 4, text: 'The Fiber tree reconciles components dynamically.' },
              { time: 8, text: 'By utilizing precise slice selectors in state,' },
              { time: 12, text: 'we ensure only the modified nodes trigger DOM mutations.' }
            ]
          },
          {
            id: 'sw-top-12',
            title: 'Topic 1.2: Intersection Observer & Responsive Infinite Scroll',
            description: 'Construct native Intersection Observer containers. Build scroll managers that load pages dynamically from an API without causing layout shift or content jumps.',
            duration: '12:15',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['Intersection Observer API', 'Tailwind CSS Layouts', 'REST Mock Server'],
            subtitles: [
              { time: 0, text: 'Infinite scroll shouldn’t lag your interface.' },
              { time: 4, text: 'We hook up an Intersection Observer onto our sentinel element.' },
              { time: 9, text: 'When the sentinel intersects, we fetch the next chunk.' },
              { time: 13, text: 'Notice how the layout height is preserved to avoid jumping scrollbars.' }
            ]
          },
          {
            id: 'sw-top-13',
            title: 'Topic 1.3: Real-time Audio Synthesizer Interface',
            description: 'Unlock sensory experiences by harnessing the Web Audio API. Program custom oscillator nodes, gain nodes, and dynamic filters to generate interactive wave synthesizers.',
            duration: '18:30',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['Web Audio API', 'Oscillator Nodes', 'Gain Nodes', 'Canvas Visualizer'],
            subtitles: [
              { time: 0, text: 'Welcome to real-time audio creation on the web.' },
              { time: 4, text: 'We instantiate an AudioContext first.' },
              { time: 8, text: 'Let’s construct a sine-wave oscillator node and connect it to a gain filter.' },
              { time: 13, text: 'We can sweep the frequency dynamically on user click.' }
            ]
          }
        ]
      },
      {
        id: 'sw-mod-2',
        title: 'Module 2: Resilient API Design & Middleware Pipelines',
        description: 'Construct secure, scalable servers capable of serving thousands of simultaneous requests using Express and database caching layers.',
        topics: [
          {
            id: 'sw-top-21',
            title: 'Topic 2.1: RESTful Contracts, Input Validation, & JWT Auth',
            description: 'Write robust API servers using Express. Implement schema validations for inputs and secure your endpoints using JSON Web Token verification.',
            duration: '19:40',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['Node Express', 'Zod validation', 'jsonwebtoken', 'Bruno API Client'],
            subtitles: [
              { time: 0, text: 'Every secure API begins with input validation.' },
              { time: 3, text: 'We use Zod schemas to sanitize input parameters.' },
              { time: 7, text: 'Next, we establish our authorization check.' },
              { time: 11, text: 'The server verifies the signature of incoming JWT tokens.' }
            ]
          },
          {
            id: 'sw-top-22',
            title: 'Topic 2.2: Horizontal Scaling & Redis Cache Eviction',
            description: 'Analyze horizontal scale parameters. Introduce a Redis cache layer inside your request pipelines and configure custom cache eviction policies.',
            duration: '22:15',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['Redis', 'ioredis client', 'Docker Compose', 'k6 Load Testing'],
            subtitles: [
              { time: 0, text: 'Let’s scale our Node cluster to 10 instances.' },
              { time: 4, text: 'We require a shared caching node like Redis to offload SQL reads.' },
              { time: 9, text: 'Observe how we set cache keys with an automatic TTL value.' },
              { time: 14, text: 'We will measure peak throughput using k6 load tests.' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'track-data',
    title: 'The Data Science Course',
    category: 'Data Science',
    description: 'Transform datasets, engineer statistical features, optimize neural architectures, and pipeline local machine learning models.',
    icon: '📊',
    difficulty: 'Advanced',
    durationWeeks: 14,
    modules: [
      {
        id: 'ds-mod-1',
        title: 'Module 1: Scientific Computing & EDA',
        description: 'Examine pandas indexing logic, vectorize mathematical transformations, and build high-fidelity data visualizers.',
        topics: [
          {
            id: 'ds-top-11',
            title: 'Topic 1.1: Jupyter Notebooks & Pandas Multi-Indexing',
            description: 'Leverage Python scientific libraries. Understand multi-index series, categorical categorization, and complex pivot operations to process dirty data files.',
            duration: '15:10',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['Jupyter Lab', 'Python Pandas', 'NumPy Vectors', 'Anaconda'],
            subtitles: [
              { time: 0, text: 'Welcome to the Applied AI & Data Science Track.' },
              { time: 4, text: 'We begin our exploratory data analysis with multi-indexing.' },
              { time: 8, text: 'Multi-indexing allows us to represent high-dimensional tables.' },
              { time: 13, text: 'Let’s load our sample census dataset using pandas.' }
            ]
          },
          {
            id: 'ds-top-12',
            title: 'Topic 1.2: Dimensionality Reduction (PCA) Visualizations',
            description: 'Understand the math of Principal Component Analysis. Apply scikit-learn PCA pipeline to project 50 features down to 2 axes, and display results in an interactive scatter graph.',
            duration: '20:10',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['Scikit-Learn', 'Matplotlib', 'PCA Pipeline Objects', 'D3.js Charts'],
            subtitles: [
              { time: 0, text: 'High dimensional data is extremely difficult to visualize.' },
              { time: 4, text: 'Principal Component Analysis identifies directions of maximum variance.' },
              { time: 9, text: 'We scale our feature vectors to have zero mean and unit variance.' },
              { time: 14, text: 'We then plot the two highest principal components.' }
            ]
          }
        ]
      },
      {
        id: 'ds-mod-2',
        title: 'Module 2: Machine Learning & Neural Networks',
        description: 'Train deep neural models, optimize loss weights, and deploy local model files to handle runtime evaluations.',
        topics: [
          {
            id: 'ds-top-21',
            title: 'Topic 2.1: Feature Engineering & Gradient Boosting Trees',
            description: 'Learn how to handle missing values, encode categorical variables, and train gradient boosted tree models (XGBoost/LightGBM) to perform highly accurate classifications.',
            duration: '18:50',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['XGBoost Engine', 'OneHotEncoder', 'Cross Validation Folders', 'Feature Importances'],
            subtitles: [
              { time: 0, text: 'Let’s construct advanced features for our tree models.' },
              { time: 4, text: 'We encode text classes into binary indicators.' },
              { time: 8, text: 'XGBoost trains sequential tree ensembles by fitting residuals.' },
              { time: 13, text: 'We will inspect our feature importances using bar charts.' }
            ]
          },
          {
            id: 'ds-top-22',
            title: 'Topic 2.2: PyTorch Tensors, Backpropagation, & Custom Loss',
            description: 'Structure custom neural layers using PyTorch. Write training loops from scratch, calculate loss slopes, execute backpropagation steps, and inspect model weight paths.',
            duration: '24:40',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['PyTorch Core', 'CUDA Acceleration', 'Adam Optimizer', 'Weights & Biases'],
            subtitles: [
              { time: 0, text: 'Let’s write a deep neural classifier from scratch.' },
              { time: 4, text: 'We define the forward pass containing linear and relu layers.' },
              { time: 9, text: 'We run the backward pass by calling loss.backward().' },
              { time: 13, text: 'Our Adam optimizer will adjust weights in the direction of steepest descent.' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'track-intern-sw',
    title: 'Intern Software Engineering Course',
    category: 'Software',
    description: 'A specialized single-module course designed for engineering interns, focused on learning and verifying six critical software engineering topics.',
    icon: '🎓',
    difficulty: 'Beginner',
    durationWeeks: 4,
    examEnabled: false,
    modules: [
      {
        id: 'intern-sw-mod-1',
        title: 'Module 1: Intern Software Core Competencies',
        description: 'Verifies six fundamental development and engineering capabilities.',
        quizEnabled: false,
        topics: [
          {
            id: 'intern-comp-1',
            title: 'Topic 1: Secure Local Environment Configuration',
            description: 'Learn how to configure dynamic local environment files securely to manage credentials and server-side keys.',
            duration: '10:00',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['dotenv', 'process.env', 'Node.js'],
            subtitles: [
              { time: 0, text: 'Welcome to Intern Software Core Competencies!' },
              { time: 5, text: 'In this topic, we will configure local environment files securely.' }
            ]
          },
          {
            id: 'intern-comp-2',
            title: 'Topic 2: Clean Express-v5 Routing Table',
            description: 'Initialize a clean express-v5 routing table and handle modular API router separation.',
            duration: '12:30',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['Express v5', 'Router', 'REST APIs'],
            subtitles: [
              { time: 0, text: 'Let’s initialize our express application routing.' }
            ]
          },
          {
            id: 'intern-comp-3',
            title: 'Topic 3: Unit Testing with Jest Framework',
            description: 'Write basic unit tests using Jest framework to enforce backend controller reliability.',
            duration: '15:15',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['Jest', 'Supertest', 'Assert'],
            subtitles: [
              { time: 0, text: 'Testing is critical for automated validation.' }
            ]
          },
          {
            id: 'intern-comp-4',
            title: 'Topic 4: Async Catch Middleware Promise Handling',
            description: 'Handle promise errors gracefully using standard async catch middleware to prevent server crashes.',
            duration: '11:45',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['Async/Await', 'Express Middleware', 'Promise Catch'],
            subtitles: [
              { time: 0, text: 'Now we look at handling promise rejections in Express.' }
            ]
          },
          {
            id: 'intern-comp-5',
            title: 'Topic 5: Schema Verification using Zod',
            description: 'Implement standard schema verification using Zod to enforce input payload shapes at the API layer.',
            duration: '14:00',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['Zod', 'Schema Validation', 'TypeScript Types'],
            subtitles: [
              { time: 0, text: 'Zod provides excellent runtime type safety.' }
            ]
          },
          {
            id: 'intern-comp-6',
            title: 'Topic 6: Deploying Server Code to Sandbox Containers',
            description: 'Deploy server code to sandbox container instances and examine logging behaviors.',
            duration: '18:10',
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            tools: ['Docker', 'Cloud Run', 'Sandbox'],
            subtitles: [
              { time: 0, text: 'Finally, let’s pack our service into a container.' }
            ]
          }
        ]
      }
    ]
  }
];
